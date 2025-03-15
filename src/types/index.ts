import { NextRequest } from 'next/server'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface UserPreferences {
  age: number | null
  interests: string | null
  difficultyLevel: string
  topicsOfInterest: string | null
  adaptiveDifficulty: number
  currentDifficultyScore: number
}

export interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  unlockedAt?: number
  isNew?: boolean
  requiredValue: number
  achievementType: string
  createdAt: number
}

export interface ExerciseResult {
  wordId: string
  correct: boolean
  timestamp: Date
  errorCount: number
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
} 