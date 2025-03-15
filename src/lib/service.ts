import * as repository from './repository';
import * as ai from './openai';
import * as gamification from './gamification';

// Types
export type SpellingResult = {
  misspelledWords: Array<{
    misspelled: string;
    correct: string;
    tip: string;
    severity: number;
  }>;
  encouragement: string;
  overallScore: number;
};

export type Exercise = {
  id: number;
  original: string;
  translation?: string;
  userTranslation?: string;
  difficulty?: number;
};

export type Progress = {
  summary: string;
  strengths: string;
  challenges: string;
  tips: string[];
  encouragement: string;
  level?: number;
  experiencePoints?: number;
  nextLevelPoints?: number;
  achievements?: Achievement[];
  streak?: number;
};

export type UserPreferences = {
  age?: number;
  interests?: string;
  difficultyLevel?: string;
  topicsOfInterest?: string;
  adaptiveDifficulty?: number;
  currentDifficultyScore?: number;
};

export type Achievement = {
  id: number;
  name: string;
  description: string;
  icon: string;
  isNew: boolean;
  unlockedAt: number;
  achievementType: string;
  requiredValue: number;
};

// Service functions
export async function createNewExercise(userId: number): Promise<Exercise> {
  // Get difficult words to include in the exercise - randomly select a subset
  const difficultWords = await repository.getMostDifficultWordsForUser(userId, 10);
  // Randomly select 2-3 difficult words to focus on (if available)
  const shuffledWords = difficultWords.sort(() => 0.5 - Math.random());
  const selectedWords = shuffledWords.slice(0, Math.min(shuffledWords.length, Math.floor(Math.random() * 2) + 2));
  const wordList = selectedWords.map(w => w.word);
  
  // Get words the user has mastered (to exclude from exercises)
  const masteredWords = await repository.getMasteredWordsForUser(userId);
  const masteredWordList = masteredWords.map(w => w.word);
  
  // Get user preferences
  const preferences = await repository.getUserPreferences(userId);
  
  // Get user level and calculate appropriate difficulty
  const user = await repository.getUserById(userId);
  const userLevel = user?.level || 1;
  
  // Calculate difficulty based on user level and preferences
  let baseDifficulty = 1;
  if (preferences.adaptiveDifficulty === 1) {
    // Use adaptive difficulty
    baseDifficulty = preferences.currentDifficultyScore || 1;
  } else {
    // Use static difficulty based on preference
    switch (preferences.difficultyLevel) {
      case 'beginner':
        baseDifficulty = Math.max(1, Math.min(25, userLevel));
        break;
      case 'intermediate':
        baseDifficulty = Math.max(25, Math.min(50, userLevel * 1.5));
        break;
      case 'advanced':
        baseDifficulty = Math.max(50, Math.min(75, userLevel * 2));
        break;
      case 'expert':
        baseDifficulty = Math.max(75, Math.min(100, userLevel * 3));
        break;
      default:
        baseDifficulty = Math.max(1, Math.min(100, userLevel));
    }
  }
  
  // Add some randomization to difficulty to ensure variety (±10%)
  const randomFactor = 0.9 + (Math.random() * 0.2); // Between 0.9 and 1.1
  const difficulty = Math.max(1, Math.min(100, Math.round(baseDifficulty * randomFactor)));
  
  // Generate exercise with OpenAI
  const exercise = await ai.generateExercise(wordList, preferences, difficulty, masteredWordList);
  
  // Save to database
  const id = await repository.createExercise(userId, exercise.original, difficulty);
  if (id) {
    await repository.updateExerciseTranslation(id, exercise.translation, '');
  }
  
  return {
    id: id || 0,
    original: exercise.original,
    translation: exercise.translation,
    difficulty: difficulty,
  };
}

export async function saveSpokenTranslation(
  exerciseId: number, 
  spokenText: string
): Promise<void> {
  const exercise = await repository.getExercise(exerciseId);
  if (exercise) {
    await repository.updateExerciseTranslation(
      exerciseId, 
      exercise.translatedText || '', 
      spokenText
    );
  }
}

export async function submitWrittenTranslation(
  exerciseId: number,
  writtenText: string
): Promise<SpellingResult> {
  // Get the exercise
  const exercise = await repository.getExercise(exerciseId);
  if (!exercise) {
    throw new Error('Exercise not found');
  }
  
  // Save user's answer
  await repository.updateExerciseAnswer(exerciseId, writtenText);
  
  // Evaluate spelling with OpenAI
  const evaluation = await ai.evaluateSpelling(
    exercise.originalText,
    writtenText,
    exercise.translatedText || ''
  );
  
  // Process misspelled words
  for (const misspelled of evaluation.misspelledWords || []) {
    // Get or create the word in the database
    const word = await repository.getOrCreateWord(misspelled.correct);
    
    // Record the result as incorrect
    await repository.recordWordResult(
      exerciseId,
      word.id,
      exercise.userId,
      false,
      1
    );
  }
  
  // Calculate experience points based on performance and difficulty
  const exerciseDifficulty = exercise.exerciseDifficulty || 1;
  const wordCount = writtenText.split(' ').length;
  const misspelledCount = evaluation.misspelledWords?.length || 0;
  const correctCount = wordCount - misspelledCount;
  const isPerfect = misspelledCount === 0 && wordCount > 0;
  
  // Base XP formula: (correct words * difficulty multiplier) + perfect bonus
  const difficultyMultiplier = Math.max(1, Math.sqrt(exerciseDifficulty) / 5);
  const baseXP = Math.round(correctCount * difficultyMultiplier);
  const perfectBonus = isPerfect ? Math.round(10 * difficultyMultiplier) : 0;
  const totalXP = baseXP + perfectBonus;
  
  // Update exercise with awarded XP
  await repository.updateExerciseExperience(exerciseId, totalXP);
  
  // Update user's experience points
  await gamification.addExperiencePoints(exercise.userId, totalXP);
  
  // Update progress
  const progress = await repository.getProgressForUser(exercise.userId);
  await repository.updateProgress(
    exercise.userId,
    progress.totalExercises + 1,
    progress.correctWords + correctCount,
    progress.incorrectWords + misspelledCount,
    isPerfect ? progress.perfectExercises + 1 : progress.perfectExercises,
    progress.totalExperiencePoints + totalXP
  );
  
  // Update difficulty score based on performance
  if (exercise.userId) {
    await updateDifficultyScore(exercise.userId, evaluation.overallScore, isPerfect);
  }
  
  // Check for new achievements
  await gamification.checkAchievements(exercise.userId);
  
  return evaluation;
}

export async function markWordAsLearned(
  exerciseId: number,
  word: string
): Promise<void> {
  const exercise = await repository.getExercise(exerciseId);
  if (!exercise) {
    throw new Error('Exercise not found');
  }
  
  const wordRecord = await repository.getOrCreateWord(word);
  
  // Record the word as correctly spelled after practice
  await repository.recordWordResult(
    exerciseId,
    wordRecord.id,
    exercise.userId,
    true,
    1
  );
  
  // Award a small amount of XP for practicing a word
  await gamification.addExperiencePoints(exercise.userId, 1);
}

export async function getProgressReport(userId: number): Promise<Progress> {
  // Get progress data
  const progress = await repository.getProgressForUser(userId);
  
  // Get difficult words
  const difficultWords = await repository.getMostDifficultWordsForUser(userId, 10);
  const wordList = difficultWords.map(w => w.word);
  
  // Get user preferences
  const preferences = await repository.getUserPreferences(userId);
  
  // Get user level and XP
  const user = await repository.getUserById(userId);
  const level = user?.level || 1;
  const xp = user?.experiencePoints || 0;
  const nextLevelXP = gamification.getExperienceForNextLevel(level);
  
  // Get recent achievements
  const achievements = await repository.getRecentAchievements(userId, 5);
  
  // Generate report with OpenAI
  const aiReport = await ai.getProgressReport(
    progress.totalExercises,
    progress.correctWords,
    progress.incorrectWords,
    wordList,
    preferences
  );
  
  return {
    ...aiReport,
    level,
    experiencePoints: xp,
    nextLevelPoints: nextLevelXP,
    achievements: achievements.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      isNew: a.isNew === 1,
      unlockedAt: a.unlockedAt,
    })),
    streak: progress.streakDays,
  };
}

// Helper function to update difficulty score based on performance
async function updateDifficultyScore(
  userId: number, 
  overallScore: number, 
  isPerfect: boolean
): Promise<void> {
  // Get current preferences
  const preferences = await repository.getUserPreferences(userId);
  
  // Only update if adaptive difficulty is enabled
  if (preferences.adaptiveDifficulty !== 1) {
    return;
  }
  
  let currentScore = preferences.currentDifficultyScore || 1;
  
  // Adjust difficulty based on performance
  if (isPerfect && overallScore >= 9) {
    // Increase difficulty if perfect or near-perfect
    currentScore = Math.min(100, currentScore + 5);
  } else if (overallScore >= 7) {
    // Slight increase for good performance
    currentScore = Math.min(100, currentScore + 2);
  } else if (overallScore <= 3) {
    // Significant decrease for poor performance
    currentScore = Math.max(1, currentScore - 5);
  } else if (overallScore <= 5) {
    // Slight decrease for below-average performance
    currentScore = Math.max(1, currentScore - 2);
  }
  
  // Update the difficulty score
  await repository.updateUserDifficultyScore(userId, currentScore);
} 