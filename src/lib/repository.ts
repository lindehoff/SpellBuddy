import { eq, and, desc, sql } from 'drizzle-orm';
import { db, schema } from './db';
import { UserPreferences } from './service';

// Exercise repository functions
export async function createExercise(userId: number, originalText: string) {
  const result = await db.insert(schema.exercises).values({
    userId,
    originalText,
    createdAt: Math.floor(Date.now() / 1000),
  }).returning({ id: schema.exercises.id });
  
  return result[0]?.id;
}

export async function updateExerciseTranslation(
  exerciseId: number, 
  translatedText: string, 
  spokenTranslation: string
) {
  await db.update(schema.exercises)
    .set({ 
      translatedText, 
      spokenTranslation 
    })
    .where(eq(schema.exercises.id, exerciseId));
}

export async function updateExerciseAnswer(
  exerciseId: number, 
  userTranslation: string
) {
  await db.update(schema.exercises)
    .set({ 
      userTranslation,
      completedAt: Math.floor(Date.now() / 1000)
    })
    .where(eq(schema.exercises.id, exerciseId));
}

export async function getExercise(exerciseId: number) {
  const result = await db.select()
    .from(schema.exercises)
    .where(eq(schema.exercises.id, exerciseId));
  
  return result[0];
}

export async function getLatestExercisesForUser(userId: number, limit = 5) {
  return db.select()
    .from(schema.exercises)
    .where(eq(schema.exercises.userId, userId))
    .orderBy(desc(schema.exercises.createdAt))
    .limit(limit);
}

// Word repository functions
export async function getOrCreateWord(word: string) {
  const existing = await db.select()
    .from(schema.words)
    .where(eq(schema.words.word, word));
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  const result = await db.insert(schema.words).values({
    word,
    createdAt: Math.floor(Date.now() / 1000),
  }).returning({ id: schema.words.id });
  
  return { id: result[0]?.id, word, correctCount: 0, incorrectCount: 0 };
}

export async function recordWordResult(
  exerciseId: number,
  wordId: number,
  userId: number,
  isCorrect: boolean,
  attempts: number
) {
  // Record the word exercise result
  await db.insert(schema.wordExercises).values({
    exerciseId,
    wordId,
    userId,
    isCorrect: isCorrect ? 1 : 0,
    attempts,
    createdAt: Math.floor(Date.now() / 1000),
  });
  
  // Update the word stats
  if (isCorrect) {
    await db.update(schema.words)
      .set({ 
        correctCount: sql`${schema.words.correctCount} + 1`,
        lastPracticed: Math.floor(Date.now() / 1000),
      })
      .where(eq(schema.words.id, wordId));
  } else {
    await db.update(schema.words)
      .set({ 
        incorrectCount: sql`${schema.words.incorrectCount} + 1`,
        lastPracticed: Math.floor(Date.now() / 1000),
      })
      .where(eq(schema.words.id, wordId));
  }
}

export async function getMostDifficultWordsForUser(userId: number, limit = 10) {
  return db.select({
    id: schema.words.id,
    word: schema.words.word,
    correctCount: schema.words.correctCount,
    incorrectCount: schema.words.incorrectCount,
    errorRatio: sql<number>`${schema.words.incorrectCount} * 1.0 / (${schema.words.correctCount} + ${schema.words.incorrectCount})`,
  })
    .from(schema.words)
    .innerJoin(
      schema.wordExercises,
      eq(schema.words.id, schema.wordExercises.wordId)
    )
    .where(
      and(
        eq(schema.wordExercises.userId, userId),
        sql`${schema.words.correctCount} + ${schema.words.incorrectCount} > 0`
      )
    )
    .orderBy(desc(sql`${schema.words.incorrectCount} * 1.0 / (${schema.words.correctCount} + ${schema.words.incorrectCount})`))
    .limit(limit);
}

// Progress repository functions
export async function getProgressForUser(userId: number) {
  const progress = await db.select()
    .from(schema.progress)
    .where(eq(schema.progress.userId, userId));
    
  if (progress.length === 0) {
    const result = await db.insert(schema.progress).values({
      userId,
      updatedAt: Math.floor(Date.now() / 1000),
    }).returning();
    return result[0];
  }
  return progress[0];
}

export async function updateProgress(
  userId: number,
  exerciseCount: number,
  correctWords: number,
  incorrectWords: number
) {
  // Get existing progress
  const progress = await getProgressForUser(userId);
  
  // Check if the last exercise was today
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
  const lastExerciseDate = progress.lastExerciseDate || 0;
  const lastExerciseDay = new Date(lastExerciseDate * 1000).setHours(0, 0, 0, 0) / 1000;
  
  // Calculate streak
  let streakDays = progress.streakDays || 0;
  if (lastExerciseDate === 0) {
    // First exercise
    streakDays = 1;
  } else if (lastExerciseDay < today - 24 * 60 * 60) {
    // Gap in streak (more than 1 day since last exercise)
    streakDays = 1;
  } else if (lastExerciseDay < today) {
    // New day, continue streak
    streakDays += 1;
  }
  
  await db.update(schema.progress)
    .set({
      totalExercises: exerciseCount,
      correctWords,
      incorrectWords,
      streakDays,
      lastExerciseDate: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(schema.progress.userId, userId));
}

// User preferences repository functions
export async function getUserPreferences(userId: number): Promise<UserPreferences> {
  const preferences = await db.select()
    .from(schema.userPreferences)
    .where(eq(schema.userPreferences.userId, userId));
    
  if (preferences.length === 0) {
    return {};
  }
  
  const pref = preferences[0];
  return {
    age: pref.age || undefined,
    interests: pref.interests || undefined,
    difficultyLevel: pref.difficultyLevel || undefined,
    topicsOfInterest: pref.topicsOfInterest || undefined,
  };
} 