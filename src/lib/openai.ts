import OpenAI from 'openai';
import { UserPreferences } from './service';

// Check if OpenAI API key is defined in environment variables
if (!process.env.OPENAI_API_KEY) {
  console.warn('Missing OPENAI_API_KEY environment variable');
}

// Create OpenAI API client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get the model from environment variables or use a default
export const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Get an evaluation of spelling from the OpenAI API
 * @param original Swedish text for context
 * @param userAnswer User's written response in English
 * @param translatedText The expected English translation
 * @returns List of misspelled words with corrections and tips
 */
export async function evaluateSpelling(
  original: string, 
  userAnswer: string, 
  translatedText: string
) {
  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a helpful English spelling tutor for a Swedish student with dyslexia. 
        Your task is to evaluate her spelling when translating from Swedish to English.
        Focus ONLY on spelling errors, not grammar or translation accuracy.
        For each misspelled word, provide the correct spelling and a helpful, friendly memory tip.
        Respond in JSON format with an array of misspelled words, each with properties:
        - misspelled: the misspelled word
        - correct: the correct spelling
        - tip: a short, friendly memory tip to help remember the spelling
        - severity: a number from 1-3 indicating severity (1=minor, 3=severe)
        
        Additionally, include an "encouragement" field with a brief, friendly message acknowledging strengths and progress.
        Also include an "overallScore" field from 1-10 rating spelling accuracy.

        If there are no spelling errors, return an empty array for misspelledWords.`,
      },
      {
        role: 'user',
        content: `Original Swedish text: "${original}"
        Expected English translation: "${translatedText}"
        Student's written answer: "${userAnswer}"`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

/**
 * Generate a new practice exercise based on user's history and preferences
 * @param difficultWords Array of words the user has struggled with
 * @param preferences User preferences for personalization
 * @returns Object with original text in Swedish and its English translation
 */
export async function generateExercise(
  difficultWords: string[] = [],
  preferences?: UserPreferences
) {
  const wordContext = difficultWords.length > 0 
    ? `Include some of these words the student has struggled with: ${difficultWords.join(', ')}.` 
    : '';

  // Build personalization context based on user preferences
  let personalizationContext = '';
  if (preferences) {
    if (preferences.age) {
      personalizationContext += `The student is ${preferences.age} years old. `;
    }
    
    if (preferences.interests) {
      personalizationContext += `The student is interested in: ${preferences.interests}. `;
    }
    
    if (preferences.topicsOfInterest) {
      personalizationContext += `Topics the student enjoys: ${preferences.topicsOfInterest}. `;
    }
    
    if (preferences.difficultyLevel) {
      personalizationContext += `Preferred difficulty level: ${preferences.difficultyLevel}. `;
    }
  }

  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a helpful English tutor for a Swedish student with dyslexia. 
        Create a short practice text in Swedish (2-3 sentences) that will be used for an English spelling exercise.
        The student will translate this to English.
        Create text appropriate for a student who knows English well but struggles with spelling.
        Make the content engaging, relatable and age-appropriate for the student.
        ${personalizationContext}
        ${wordContext}
        
        Respond in JSON format with:
        - original: The Swedish text (2-3 sentences)
        - translation: The expected English translation
        - difficulty: A number from 1-5 indicating the spelling difficulty level`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

/**
 * Get a progress report and learning insights
 * @param exerciseCount Total number of exercises completed
 * @param correctWordCount Total number of correctly spelled words
 * @param incorrectWordCount Total number of incorrectly spelled words
 * @param difficultWords Array of words the user consistently struggles with
 * @param preferences User preferences for personalization
 * @returns A friendly progress report with insights and encouragement
 */
export async function getProgressReport(
  exerciseCount: number,
  correctWordCount: number,
  incorrectWordCount: number,
  difficultWords: string[] = [],
  preferences?: UserPreferences
) {
  // Build personalization context based on user preferences
  let personalizationContext = '';
  if (preferences) {
    if (preferences.age) {
      personalizationContext += `The student is ${preferences.age} years old. `;
    }
    
    if (preferences.interests) {
      personalizationContext += `The student is interested in: ${preferences.interests}. `;
    }
    
    if (preferences.difficultyLevel) {
      personalizationContext += `Current difficulty level: ${preferences.difficultyLevel}. `;
    }
  }

  const response = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a supportive English tutor for a Swedish student with dyslexia.
        Create an encouraging progress report based on the student's performance data.
        Focus on celebrating improvements while gently identifying areas to work on.
        Use a friendly, positive tone appropriate for encouraging the student.
        ${personalizationContext}
        
        Respond in JSON format with:
        - summary: A brief, encouraging summary of overall progress
        - strengths: What the student is doing well
        - challenges: Areas to focus on improving (in a constructive, non-discouraging way)
        - tips: 2-3 specific learning tips tailored to their difficult words
        - encouragement: A motivational message to keep the student engaged`,
      },
      {
        role: 'user',
        content: `Exercises completed: ${exerciseCount}
        Correctly spelled words: ${correctWordCount}
        Incorrectly spelled words: ${incorrectWordCount}
        Difficult words: ${difficultWords.join(', ')}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content || '{}');
} 