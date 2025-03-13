import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Table for storing users
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  lastLoginAt: integer("last_login_at"),
});

// Table for storing user preferences
export const userPreferences = sqliteTable("user_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  age: integer("age"),
  interests: text("interests"), // Comma-separated list or JSON string
  difficultyLevel: text("difficulty_level").default("medium"), // easy, medium, hard
  topicsOfInterest: text("topics_of_interest"), // Comma-separated list or JSON string
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
  updatedAt: integer("updated_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
});

// Table for storing individual words
export const words = sqliteTable("words", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  word: text("word").notNull(),
  correctCount: integer("correct_count").default(0),
  incorrectCount: integer("incorrect_count").default(0),
  lastPracticed: integer("last_practiced"), // Unix timestamp
  createdAt: integer("created_at").notNull().$defaultFn(() => Math.floor(Date.now() / 1000)),
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
}); 