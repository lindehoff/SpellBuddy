import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Table for storing users
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  lastLoginAt: integer("last_login_at"),
  experiencePoints: integer("experience_points").notNull().default(0),
  level: integer("level").notNull().default(1),
});

// Table for storing user preferences
export const userPreferences = sqliteTable("user_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  age: integer("age"),
  interests: text("interests"), // Comma-separated list or JSON string
  difficultyLevel: text("difficulty_level").default("beginner"), // beginner, intermediate, advanced, expert
  topicsOfInterest: text("topics_of_interest"), // Comma-separated list or JSON string
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  adaptiveDifficulty: integer("adaptive_difficulty").notNull().default(1), // 0 = off, 1 = on
  currentDifficultyScore: integer("current_difficulty_score").notNull().default(1), // 1-100 scale
});

// Table for storing individual words
export const words = sqliteTable("words", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  word: text("word").notNull(),
  correctCount: integer("correct_count").default(0),
  incorrectCount: integer("incorrect_count").default(0),
  lastPracticed: integer("last_practiced"), // Unix timestamp
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  difficultyRating: integer("difficulty_rating").default(50), // 1-100 scale
});

// Table for storing practice sessions
export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text"),
  userTranslation: text("user_translation"),
  spokenTranslation: text("spoken_translation"),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  completedAt: integer("completed_at"),
  exerciseDifficulty: integer("exercise_difficulty").default(1), // 1-100 scale
  experienceAwarded: integer("experience_awarded").default(0),
});

// Table for storing word practice results within exercises
export const wordExercises = sqliteTable("word_exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
  wordId: integer("word_id").notNull().references(() => words.id),
  userId: integer("user_id").notNull().references(() => users.id),
  isCorrect: integer("is_correct").notNull(), // 0 = incorrect, 1 = correct
  attempts: integer("attempts").notNull().default(0),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

// Table for storing progress metrics
export const progress = sqliteTable("progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  totalExercises: integer("total_exercises").notNull().default(0),
  correctWords: integer("correct_words").notNull().default(0),
  incorrectWords: integer("incorrect_words").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  lastExerciseDate: integer("last_exercise_date"),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  perfectExercises: integer("perfect_exercises").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalExperiencePoints: integer("total_experience_points").notNull().default(0),
});

// New table for achievements
export const achievements = sqliteTable("achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Icon name or path
  requiredValue: integer("required_value").notNull(), // Value needed to unlock
  achievementType: text("achievement_type").notNull(), // streak, exercises, words, level, etc.
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

// Table for tracking user achievements
export const userAchievements = sqliteTable("user_achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: integer("unlocked_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  isNew: integer("is_new").notNull().default(1), // 0 = seen, 1 = new/unseen
});

// Table for daily challenges
export const dailyChallenges = sqliteTable("daily_challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  experienceReward: integer("experience_reward").notNull(),
  targetCount: integer("target_count").notNull(), // Number of exercises/words needed
  challengeType: text("challenge_type").notNull(), // exercises, words, streak, etc.
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  expiresAt: integer("expires_at").notNull(),
});

// Table for tracking user challenges
export const userChallenges = sqliteTable("user_challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => dailyChallenges.id),
  currentCount: integer("current_count").notNull().default(0),
  isCompleted: integer("is_completed").notNull().default(0), // 0 = incomplete, 1 = complete
  completedAt: integer("completed_at"),
  isRewardClaimed: integer("is_reward_claimed").notNull().default(0), // 0 = unclaimed, 1 = claimed
}); 