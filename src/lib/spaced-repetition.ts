/**
 * Spaced Repetition Algorithm (SM-2 based)
 * 
 * This implements a simplified version of the SM-2 algorithm for spaced repetition learning.
 * The algorithm adjusts the interval between reviews based on how well the user performed.
 */

export interface SpacedRepetitionItem {
  id: string
  userId: string
  questionId: string
  easiness: number    // Easiness factor (1.3 - 2.5+)
  interval: number    // Days until next review
  repetition: number  // Number of successful repetitions
  dueDate: Date
  lastReview?: Date
}

export interface ReviewResult {
  quality: number // 0-5 scale (0=total blackout, 5=perfect response)
  responseTime?: number // milliseconds
}

export interface UpdatedSpacedItem {
  easiness: number
  interval: number
  repetition: number
  dueDate: Date
}

/**
 * Calculate the next review parameters based on the SM-2 algorithm
 */
export function calculateNextReview(
  item: SpacedRepetitionItem,
  result: ReviewResult
): UpdatedSpacedItem {
  const { quality } = result
  let { easiness, interval, repetition } = item

  // Quality must be between 0 and 5
  const q = Math.max(0, Math.min(5, quality))

  // If quality < 3, reset repetition count and set interval to 0 (Immediate Retry)
  if (q < 3) {
    repetition = 0
    interval = 0
  } else {
    // Successful review
    if (repetition === 0) {
      interval = 1
    } else if (repetition === 1) {
      interval = 3 // Bumped slightly for second success
    } else {
      interval = Math.round(interval * easiness)
    }
    repetition += 1
  }

  // Update easiness factor
  easiness = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))

  // Ensure easiness doesn't go below 1.3
  easiness = Math.max(1.3, easiness)

  // Calculate due date
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + interval)

  return {
    easiness,
    interval,
    repetition,
    dueDate
  }
}

/**
 * Convert answer correctness to quality score
 */
export function answerToQuality(
  isCorrect: boolean,
  responseTime?: number,
  timeLimit?: number
): number {
  if (!isCorrect) {
    return 1 // Wrong answer, but not total blackout (0)
  }

  // Base quality for correct answer
  let quality = 4

  // Adjust based on response time if available
  if (responseTime && timeLimit) {
    const timeRatio = responseTime / (timeLimit * 1000) // Convert to seconds

    if (timeRatio <= 0.3) {
      quality = 5 // Very fast, perfect response
    } else if (timeRatio <= 0.6) {
      quality = 4 // Good response time
    } else if (timeRatio <= 0.9) {
      quality = 3 // Acceptable response time
    } else {
      quality = 3 // Slow but correct
    }
  }

  return quality
}

/**
 * Get items that are due for review
 */
export function getDueItems(items: SpacedRepetitionItem[]): SpacedRepetitionItem[] {
  const now = new Date()
  return items.filter(item => item.dueDate <= now)
}

/**
 * Sort items by priority (most overdue first, then by difficulty)
 */
export function sortByPriority(items: SpacedRepetitionItem[]): SpacedRepetitionItem[] {
  const now = new Date()

  return items.sort((a, b) => {
    // Calculate how overdue each item is (in days)
    const aOverdue = Math.max(0, (now.getTime() - a.dueDate.getTime()) / (1000 * 60 * 60 * 24))
    const bOverdue = Math.max(0, (now.getTime() - b.dueDate.getTime()) / (1000 * 60 * 60 * 24))

    // If both are overdue, prioritize the more overdue one
    if (aOverdue > 0 && bOverdue > 0) {
      return bOverdue - aOverdue
    }

    // If only one is overdue, prioritize it
    if (aOverdue > 0) return -1
    if (bOverdue > 0) return 1

    // If neither is overdue, prioritize by difficulty (lower easiness = harder)
    return a.easiness - b.easiness
  })
}

/**
 * Create a new spaced repetition item for a question
 */
export function createSpacedItem(
  userId: string,
  questionId: string
): Omit<SpacedRepetitionItem, 'id'> {
  const now = new Date()

  return {
    userId,
    questionId,
    easiness: 2.5, // Default easiness factor
    interval: 0,   // Start with 0 (immediately due) if created
    repetition: 0, // No successful repetitions yet
    dueDate: now,  // Due immediately for first review
  }
}

/**
 * Calculate study session recommendations
 */
export function getStudyRecommendations(items: SpacedRepetitionItem[]) {
  const now = new Date()
  const dueItems = getDueItems(items)
  const overdueItems = dueItems.filter(item => item.dueDate < now)

  // Calculate average difficulty of due items
  const avgDifficulty = dueItems.length > 0
    ? dueItems.reduce((sum, item) => sum + (3.0 - item.easiness), 0) / dueItems.length
    : 0

  // Recommend session size based on overdue items and difficulty
  let recommendedSessionSize = Math.min(20, Math.max(5, dueItems.length))

  if (overdueItems.length > 10) {
    recommendedSessionSize = Math.min(30, overdueItems.length)
  }

  return {
    dueCount: dueItems.length,
    overdueCount: overdueItems.length,
    recommendedSessionSize,
    avgDifficulty,
    prioritizedItems: sortByPriority(dueItems).slice(0, recommendedSessionSize)
  }
}

import { prisma } from '@/lib/prisma'

export async function updateSpacedRepetition(userId: string, questionId: string, isCorrect: boolean) {
  try {
    const existingItem = await prisma.spacedItem.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      }
    })

    if (existingItem) {
      // Update existing spaced repetition item using SM-2 algorithm
      // Quality: 3-5 is Passing. <3 is Failing.
      // We map "Correct" to 4, "Incorrect" to 1.
      const quality = isCorrect ? 4 : 1

      const update = calculateNextReview(existingItem, { quality })

      await prisma.spacedItem.update({
        where: { id: existingItem.id },
        data: {
          easiness: update.easiness,
          interval: update.interval,
          repetition: update.repetition,
          dueDate: update.dueDate,
          lastReview: new Date()
        }
      })
    } else {
      // Create new spaced repetition item
      // If WRONG on first try: Interval = 0 (Immediate).
      // If CORRECT on first try: Interval = 1 (Tomorrow).
      const interval = isCorrect ? 1 : 0
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + interval)

      await prisma.spacedItem.create({
        data: {
          userId,
          questionId,
          easiness: 2.5,
          interval,
          repetition: isCorrect ? 1 : 0,
          dueDate,
          lastReview: new Date()
        }
      })
    }
  } catch (error) {
    console.error('Error updating spaced repetition:', error)
  }
}

