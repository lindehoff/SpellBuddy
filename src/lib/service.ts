import * as repository from './repository';
import * as ai from './openai';

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
};

export type Progress = {
  summary: string;
  strengths: string;
  challenges: string;
  tips: string[];
  encouragement: string;
};

// Service functions
export async function createNewExercise(): Promise<Exercise> {
  // Get difficult words to include in the exercise
  const difficultWords = await repository.getMostDifficultWords(5);
  const wordList = difficultWords.map(w => w.word);
  
  // Generate exercise with OpenAI
  const exercise = await ai.generateExercise(wordList);
  
  // Save to database
  const id = await repository.createExercise(exercise.original);
  if (id) {
    await repository.updateExerciseTranslation(id, exercise.translation, '');
  }
  
  return {
    id: id || 0,
    original: exercise.original,
    translation: exercise.translation,
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
      false,
      1
    );
  }
  
  // Update progress
  const progress = await repository.getProgress();
  await repository.updateProgress(
    progress.totalExercises + 1,
    progress.correctWords + (writtenText.split(' ').length - (evaluation.misspelledWords?.length || 0)),
    progress.incorrectWords + (evaluation.misspelledWords?.length || 0)
  );
  
  return evaluation;
}

export async function markWordAsLearned(
  exerciseId: number,
  word: string
): Promise<void> {
  const wordRecord = await repository.getOrCreateWord(word);
  
  // Record the word as correctly spelled after practice
  await repository.recordWordResult(
    exerciseId,
    wordRecord.id,
    true,
    1
  );
}

export async function getProgressReport(): Promise<Progress> {
  // Get progress data
  const progress = await repository.getProgress();
  
  // Get difficult words
  const difficultWords = await repository.getMostDifficultWords(10);
  const wordList = difficultWords.map(w => w.word);
  
  // Generate report with OpenAI
  return ai.getProgressReport(
    progress.totalExercises,
    progress.correctWords,
    progress.incorrectWords,
    wordList
  );
} 