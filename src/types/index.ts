// Database types (matching Prisma schema)
export type ScriptType = 'LATIN' | 'ARABIC'
export type Level = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type QuestionType = 
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_SELECT'
  | 'AUDIO_COMPREHENSION'
  | 'VIDEO_COMPREHENSION'
  | 'DICTATION'
  | 'FILL_BLANK'
  | 'DRAG_DROP'
  | 'PRONUNCIATION'
  | 'MATCHING'
  | 'SEQUENCE_ORDER'
  | 'TRUE_FALSE'

export type AnswerResult = 'CORRECT' | 'PARTIAL' | 'INCORRECT' | 'SKIPPED'

// Multi-language content type
export interface MultiLanguageContent {
  en?: string
  de?: string
  ku?: string
  [key: string]: string | undefined
}

// User types
export interface User {
  id: string
  name?: string
  email?: string
  image?: string
  preferredScript: ScriptType
  dailyGoal: number
  streak: number
  totalXP: number
  currentLevel: Level
  lastActiveDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Course structure types
export interface Course {
  id: string
  title: MultiLanguageContent
  description?: MultiLanguageContent
  dialectCode: string
  level: Level
  isPublished: boolean
  order: number
  chapters?: Chapter[]
  createdAt: Date
  updatedAt: Date
}

export interface Chapter {
  id: string
  title: MultiLanguageContent
  description?: MultiLanguageContent
  courseId: string
  order: number
  isPublished: boolean
  lessons?: Lesson[]
  createdAt: Date
  updatedAt: Date
}

export interface Lesson {
  id: string
  title: MultiLanguageContent
  description?: MultiLanguageContent
  chapterId: string
  order: number
  isPublished: boolean
  targetSkills: string[]
  quizzes?: Quiz[]
  createdAt: Date
  updatedAt: Date
}

export interface Quiz {
  id: string
  title: MultiLanguageContent
  description?: MultiLanguageContent
  lessonId: string
  order: number
  isPublished: boolean
  config: QuizConfig
  questions?: Question[]
  createdAt: Date
  updatedAt: Date
}

// Question types
export interface Question {
  id: string
  type: QuestionType
  prompt: MultiLanguageContent
  dialectCode: string
  script: ScriptType
  difficulty: number
  points: number
  quizId: string
  audioUrl?: string
  videoUrl?: string
  imageUrl?: string
  settings: QuestionSettings
  explanation?: MultiLanguageContent
  hints?: MultiLanguageContent
  choices?: Choice[]
  createdAt: Date
  updatedAt: Date
}

export interface Choice {
  id: string
  questionId: string
  label: MultiLanguageContent
  isCorrect: boolean
  order: number
  mediaUrl?: string
}

// Quiz and question configuration
export interface QuizConfig {
  timeLimit?: number // seconds
  allowReview?: boolean
  shuffleQuestions?: boolean
  shuffleChoices?: boolean
  showProgress?: boolean
  passingScore?: number
}

export interface QuestionSettings {
  timeLimit?: number
  allowSlowPlayback?: boolean
  showIPA?: boolean
  allowHints?: boolean
  maxAttempts?: number
  caseSensitive?: boolean
  acceptableAnswers?: string[]
  tolerance?: 'strict' | 'normal' | 'lenient'
}

// Attempt and answer types
export interface Attempt {
  id: string
  userId: string
  quizId: string
  startedAt: Date
  completedAt?: Date
  score: number
  maxScore: number
  timeSpent: number
  metadata?: Record<string, any>
  answers?: Answer[]
}

export interface Answer {
  id: string
  attemptId: string
  questionId: string
  result: AnswerResult
  responseData: ResponseData
  isCorrect: boolean
  pointsEarned: number
  timeSpent: number
  confidence?: number
  createdAt: Date
}

// Response data types for different question types
export type ResponseData = 
  | MultipleChoiceResponse
  | MultipleSelectResponse
  | TextResponse
  | AudioResponse
  | DragDropResponse
  | MatchingResponse
  | SequenceResponse

export interface MultipleChoiceResponse {
  selectedChoiceId: string
}

export interface MultipleSelectResponse {
  selectedChoiceIds: string[]
}

export interface TextResponse {
  text: string
  normalizedText?: string
}

export interface AudioResponse {
  audioBlob?: Blob
  audioUrl?: string
  transcription?: string
  confidence?: number
}

export interface DragDropResponse {
  pairs: Array<{
    sourceId: string
    targetId: string
  }>
}

export interface MatchingResponse {
  matches: Array<{
    leftId: string
    rightId: string
  }>
}

export interface SequenceResponse {
  sequence: string[]
}

// Progress and gamification
export interface Progress {
  id: string
  userId: string
  courseId?: string
  lessonId?: string
  xpEarned: number
  completed: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Badge {
  id: string
  code: string
  title: MultiLanguageContent
  description: MultiLanguageContent
  iconUrl?: string
  criteria: BadgeCriteria
  isActive: boolean
  createdAt: Date
}

export interface BadgeCriteria {
  type: 'streak' | 'xp' | 'completion' | 'accuracy' | 'speed'
  threshold: number
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time'
}

export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  earnedAt: Date
  badge?: Badge
}

// Spaced repetition
export interface SpacedItem {
  id: string
  userId: string
  questionId: string
  easiness: number
  interval: number
  repetition: number
  dueDate: Date
  lastReview?: Date
  createdAt: Date
  updatedAt: Date
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Quiz session types
export interface QuizSession {
  id: string
  quiz: Quiz
  questions: Question[]
  currentQuestionIndex: number
  answers: Map<string, Answer>
  startedAt: Date
  timeRemaining?: number
  score: number
  maxScore: number
}

export interface QuizResult {
  attemptId: string
  score: number
  maxScore: number
  percentage: number
  timeSpent: number
  correctAnswers: number
  totalQuestions: number
  xpEarned: number
  badgesEarned: Badge[]
  nextRecommendation?: {
    type: 'lesson' | 'review' | 'practice'
    id: string
    title: MultiLanguageContent
  }
}

// UI state types
export interface UIState {
  isLoading: boolean
  error?: string
  theme: 'light' | 'dark'
  language: string
  script: ScriptType
}

// Audio/Video types
export interface MediaFile {
  id: string
  url: string
  type: 'audio' | 'video' | 'image'
  duration?: number
  size?: number
  mimeType: string
  metadata?: {
    waveform?: number[]
    transcript?: string
    thumbnailUrl?: string
  }
}

// Pronunciation scoring
export interface PronunciationScore {
  overall: number // 0-100
  phonemes: Array<{
    phoneme: string
    score: number
    expected: string
    actual: string
  }>
  fluency: number
  accuracy: number
  completeness: number
}

// Analytics types
export interface AnalyticsEvent {
  type: string
  userId?: string
  sessionId: string
  timestamp: Date
  properties: Record<string, any>
}

export interface LearningAnalytics {
  userId: string
  timeSpent: number
  questionsAnswered: number
  accuracy: number
  streakDays: number
  weakAreas: string[]
  strongAreas: string[]
  recommendedFocus: string[]
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: Date
}

// Form types
export interface LoginForm {
  email: string
}

export interface ProfileForm {
  name: string
  preferredScript: ScriptType
  dailyGoal: number
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: any
}

export interface QuestionComponentProps extends BaseComponentProps {
  question: Question
  onAnswer: (response: ResponseData) => void
  disabled?: boolean
  showResult?: boolean
  userAnswer?: Answer
}

export interface ProgressBarProps extends BaseComponentProps {
  current: number
  total: number
  showPercentage?: boolean
  color?: 'primary' | 'success' | 'warning' | 'error'
}
