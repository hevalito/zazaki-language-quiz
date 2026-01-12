/**
 * Spaced Repetition Algorithm (Stage-Based)
 * 
 * Implements a stage-based learning system:
 * Stages: 0 (Unknown) -> 1 -> 2 -> 3 -> 4 -> 5 (Mastered)
 * Intervals: 0, 1, 3, 7, 21, 60 days
 */

export interface SpacedRepetitionItem {
  id: string
  userId: string
  questionId: string
  easiness: number    // Legacy SM-2 support
  interval: number    // Days until next review
  repetition: number  // Total repetitions
  stage: number       // Current learning stage (0-5)
  dueDate: Date
  lastReview?: Date | null
}

export interface ReviewResult {
  isCorrect: boolean
}

export interface UpdatedSpacedItem {
  easiness: number
  interval: number
  repetition: number
  stage: number
  dueDate: Date
}

// Stage intervals in days. Index = Stage.
// Stage 0: 0 days (Immediate/Same Session)
// Stage 1: 1 day
// Stage 2: 3 days
// Stage 3: 7 days
// Stage 4: 21 days
// Stage 5: 60 days
const STAGE_INTERVALS = [0, 1, 3, 7, 21, 60]

/**
 * Calculate the next review parameters based on Stage Logic
 */
export function calculateNextReview(
  item: SpacedRepetitionItem,
  result: ReviewResult
): UpdatedSpacedItem {
  const { isCorrect } = result
  let { stage, repetition, easiness } = item

  let newStage = stage

  if (isCorrect) {
    // Promotion: Move up one stage, cap at 5
    newStage = Math.min(5, stage + 1)
  } else {
    // Demotion: Drop 2 stages (Significant penalty), cap at 0
    newStage = Math.max(0, stage - 2)
  }

  // Determine new interval based on stage
  const interval = STAGE_INTERVALS[newStage]

  // Calculate due date
  const dueDate = new Date()
  if (interval === 0) {
    // Due immediately (keep date as now)
  } else {
    dueDate.setDate(dueDate.getDate() + interval)
  }

  return {
    easiness, // Unchanged, legacy
    interval,
    repetition: repetition + 1,
    stage: newStage,
    dueDate
  }
}

/**
 * Get items that are currently active/due
 */
export function getDueItems(items: SpacedRepetitionItem[]): SpacedRepetitionItem[] {
  const now = new Date()
  return items.filter(item => item.dueDate <= now)
}

/**
 * Sort items by priority for the Learning Room
 * Priority:
 * 1. Active Errors (Stage 0) & Overdue items
 * 2. Unstable items (Stage 1-2)
 * 3. Stable items (Stage 3+)
 */
export function sortByPriority(items: SpacedRepetitionItem[]): SpacedRepetitionItem[] {
  const now = new Date()

  return items.sort((a, b) => {
    // 1. Overdue Score (Days Overdue)
    const aOverdue = Math.max(0, (now.getTime() - a.dueDate.getTime()) / (1000 * 60 * 60 * 24))
    const bOverdue = Math.max(0, (now.getTime() - b.dueDate.getTime()) / (1000 * 60 * 60 * 24))

    // If something is VERY overdue (e.g. 7+ days), prioritize it heavily
    if (aOverdue > 7 && bOverdue <= 7) return -1
    if (bOverdue > 7 && aOverdue <= 7) return 1

    // 2. Stage Priority (Lower stage = Higher priority)
    // We want to clear Stage 0 (mistakes) first
    if (a.stage !== b.stage) {
      return a.stage - b.stage
    }

    // 3. Within same stage, prioritize most overdue
    return bOverdue - aOverdue
  })
}

/**
 * Create a new spaced repetition item for a question
 */
export function createSpacedItem(
  userId: string,
  questionId: string,
  initialStage: number = 0
): Omit<SpacedRepetitionItem, 'id'> {
  const now = new Date()
  const interval = STAGE_INTERVALS[Math.min(5, Math.max(0, initialStage))]

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + interval)

  return {
    userId,
    questionId,
    easiness: 2.5,
    interval,
    repetition: 0,
    stage: initialStage,
    dueDate,
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
      const update = calculateNextReview(existingItem, { isCorrect })

      await prisma.spacedItem.update({
        where: { id: existingItem.id },
        data: {
          easiness: update.easiness,
          interval: update.interval,
          repetition: update.repetition,
          stage: update.stage,
          dueDate: update.dueDate,
          lastReview: new Date()
        }
      })
    } else {
      // New Item:
      // Correct -> Stage 1 (1 day interval)
      // Incorrect -> Stage 0 (Immediate retry)
      const newStage = isCorrect ? 1 : 0
      const newItem = createSpacedItem(userId, questionId, newStage)

      await prisma.spacedItem.create({
        data: {
          ...newItem,
          repetition: 1, // First attempt
          lastReview: new Date()
        }
      })
    }
  } catch (error) {
    console.error('Error updating spaced repetition:', error)
  }
}
