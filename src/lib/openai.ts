import OpenAI from 'openai';
import { UserPreferences } from './service';

// Check if OpenAI API key is defined in environment variables
if (!process.env.OPENAI_API_KEY) {
  console.warn('Missing OPENAI_API_KEY environment variable');
}

// Determine if we're in a build/SSR context
const isBuildOrSSR = typeof window === 'undefined' && process.env.NODE_ENV === 'production';

// Create OpenAI API client with conditional initialization
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-key-for-build-process',
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
  // Return mock data during build to prevent API calls
  if (isBuildOrSSR) {
    return { misspelledWords: [], encouragement: "Great job!", overallScore: 10 };
  }

  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful English spelling tutor for a Swedish student with dyslexia. 
          Your task is to evaluate her spelling when translating from Swedish to English.
          Focus ONLY on actual spelling errors of individual words, not grammar, punctuation, or capitalization.
          
          Do NOT flag issues like:
          - Missing capital letters at the beginning of sentences
          - Punctuation errors (periods, commas, etc.)
          - Grammar mistakes
          - Word order or sentence structure
          - Missing words or extra words
          
          ONLY identify words that are genuinely misspelled (wrong letters, missing letters, etc.).
          Be lenient and only flag clear spelling mistakes, not minor variations or typos.
          
          For each misspelled word, provide:
          - The misspelled word exactly as written
          - The correct spelling of just that word (not the whole phrase)
          - A short, friendly memory tip focused on that specific word's spelling
          - A severity rating from 1-3
          
          Respond in JSON format with an array of misspelled words, each with properties:
          - misspelled: the misspelled word exactly as written
          - correct: the correct spelling of just that word
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
  } catch (error) {
    console.error('Error evaluating spelling:', error);
    return { misspelledWords: [], encouragement: "Error evaluating spelling", overallScore: 0 };
  }
}

/**
 * Generate a new practice exercise based on user's history and preferences
 * @param difficultWords Array of words the user has struggled with
 * @param preferences User preferences for personalization
 * @param difficulty Difficulty level (1-100 scale)
 * @param masteredWords Array of words the user has already mastered (to exclude)
 * @returns Object with original text in Swedish and its English translation
 */
export async function generateExercise(
  difficultWords: string[] = [],
  preferences?: UserPreferences,
  difficulty: number = 1,
  masteredWords: string[] = []
) {
  // Return mock data during build to prevent API calls
  if (isBuildOrSSR) {
    return {
      original: "Hej, hur mår du idag?",
      translation: "Hello, how are you today?",
      difficulty: 1
    };
  }

  try {
    // Create context for difficult words to include
    const wordContext = difficultWords.length > 0 
      ? `Try to include some of these words the student has struggled with: ${difficultWords.join(', ')}.` 
      : '';
      
    // Create context for mastered words to exclude
    const excludeContext = masteredWords.length > 0
      ? `Avoid using these words that the student has already mastered: ${masteredWords.join(', ')}.`
      : '';

    // Build personalization context based on user preferences
    let personalizationContext = '';
    if (preferences) {
      if (preferences.age) {
        personalizationContext += `The student is ${preferences.age} years old. `;
      }
      
      if (preferences.interests) {
        personalizationContext += `The student has mentioned interests in: ${preferences.interests}. Use these interests only as loose inspiration, not as strict themes. `;
      }
      
      if (preferences.topicsOfInterest) {
        personalizationContext += `Topics the student enjoys: ${preferences.topicsOfInterest}. Use these as occasional inspiration, but vary topics widely. `;
      }
    }
    
    // Map the 1-100 difficulty scale to a more descriptive range for the AI
    let difficultyDescription = '';
    if (difficulty <= 20) {
      difficultyDescription = 'very easy, with simple words and basic sentence structure';
    } else if (difficulty <= 40) {
      difficultyDescription = 'easy, with common words and straightforward sentences';
    } else if (difficulty <= 60) {
      difficultyDescription = 'moderate, with a mix of common and less common words';
    } else if (difficulty <= 80) {
      difficultyDescription = 'challenging, with some complex words and sentence structures';
    } else {
      difficultyDescription = 'very challenging, with advanced vocabulary and complex sentences';
    }

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful English tutor for a Swedish student with dyslexia. 
          Create a short practice text in Swedish (2-3 sentences) that will be used for an English spelling exercise.
          The student will translate this to English.
          
          IMPORTANT GUIDELINES:
          - Create text appropriate for a student who knows English well but struggles with spelling
          - Make the content engaging, relatable and age-appropriate
          - VARY THE TOPICS WIDELY - do not fixate on a single theme or interest
          - Each new exercise should feel fresh and different from previous ones
          - Use the student's interests only as loose inspiration, not as strict themes
          - Include unexpected and creative scenarios, everyday situations, or interesting facts
          - Rotate between different themes: nature, science, history, daily life, fantasy, technology, etc.
          - Avoid repetitive patterns in content or structure
          
          ${personalizationContext}
          
          The difficulty level should be ${difficultyDescription}.
          ${wordContext}
          ${excludeContext}
          
          Respond in JSON format with:
          - original: The Swedish text (2-3 sentences)
          - translation: The expected English translation
          - difficulty: A number from 1-5 indicating the spelling difficulty level`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error generating exercise:', error);
    return {
      original: "Ett fel uppstod när övningen skulle genereras.",
      translation: "An error occurred while generating the exercise.",
      difficulty: 1
    };
  }
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
  // Return mock data during build to prevent API calls
  if (isBuildOrSSR) {
    return {
      summary: "You're making great progress!",
      strengths: "You're doing well with your spelling.",
      challenges: "Keep practicing regularly.",
      tips: ["Practice a little each day", "Focus on words you find difficult"],
      encouragement: "Keep up the good work!"
    };
  }

  try {
    // Build personalization context based on user preferences
    let personalizationContext = '';
    if (preferences) {
      if (preferences.age) {
        personalizationContext += `The student is ${preferences.age} years old. `;
      }
      
      if (preferences.interests) {
        personalizationContext += `The student is interested in: ${preferences.interests}. `;
      }
      
      // Use the adaptive difficulty score if available
      if (preferences.adaptiveDifficulty === 1 && preferences.currentDifficultyScore) {
        const difficultyScore = preferences.currentDifficultyScore;
        let difficultyDescription = '';
        
        if (difficultyScore <= 20) {
          difficultyDescription = 'beginner';
        } else if (difficultyScore <= 40) {
          difficultyDescription = 'elementary';
        } else if (difficultyScore <= 60) {
          difficultyDescription = 'intermediate';
        } else if (difficultyScore <= 80) {
          difficultyDescription = 'advanced';
        } else {
          difficultyDescription = 'expert';
        }
        
        personalizationContext += `Current difficulty level: ${difficultyDescription} (${difficultyScore}/100). `;
      } else if (preferences.difficultyLevel) {
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
  } catch (error) {
    console.error('Error generating progress report:', error);
    return {
      summary: "Error generating progress report",
      strengths: "Unable to analyze strengths at this time",
      challenges: "Unable to analyze challenges at this time",
      tips: ["Try again later"],
      encouragement: "Keep practicing!"
    };
  }
} 