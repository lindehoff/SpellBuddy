import { db } from '../index';
import { achievements } from '../schema';

export async function seedAchievements() {
  console.log('Seeding achievements...');

  // Check if achievements already exist
  const existingAchievements = await db.select().from(achievements);
  if (existingAchievements.length > 0) {
    console.log('Achievements already seeded, skipping...');
    return;
  }

  // Define default achievements
  const defaultAchievements = [
    // Streak achievements
    {
      name: 'First Steps',
      description: 'Practice for 3 days in a row',
      icon: '🔥',
      requiredValue: 3,
      achievementType: 'streak',
    },
    {
      name: 'Consistent Learner',
      description: 'Practice for 7 days in a row',
      icon: '🔥',
      requiredValue: 7,
      achievementType: 'streak',
    },
    {
      name: 'Dedicated Student',
      description: 'Practice for 14 days in a row',
      icon: '🔥',
      requiredValue: 14,
      achievementType: 'streak',
    },
    {
      name: 'Spelling Champion',
      description: 'Practice for 30 days in a row',
      icon: '🏆',
      requiredValue: 30,
      achievementType: 'streak',
    },
    {
      name: 'Spelling Warrior',
      description: 'Practice for 60 days in a row',
      icon: '⚔️',
      requiredValue: 60,
      achievementType: 'streak',
    },
    {
      name: 'Spelling Legend',
      description: 'Practice for 100 days in a row',
      icon: '👑',
      requiredValue: 100,
      achievementType: 'streak',
    },
    
    // Exercise count achievements
    {
      name: 'Getting Started',
      description: 'Complete 5 exercises',
      icon: '📝',
      requiredValue: 5,
      achievementType: 'exercises',
    },
    {
      name: 'Practice Makes Perfect',
      description: 'Complete 25 exercises',
      icon: '📝',
      requiredValue: 25,
      achievementType: 'exercises',
    },
    {
      name: 'Exercise Expert',
      description: 'Complete 100 exercises',
      icon: '📚',
      requiredValue: 100,
      achievementType: 'exercises',
    },
    {
      name: 'Spelling Master',
      description: 'Complete 500 exercises',
      icon: '🎓',
      requiredValue: 500,
      achievementType: 'exercises',
    },
    {
      name: 'Spelling Virtuoso',
      description: 'Complete 1000 exercises',
      icon: '🏅',
      requiredValue: 1000,
      achievementType: 'exercises',
    },
    
    // Perfect exercise achievements
    {
      name: 'Perfect Beginner',
      description: 'Complete 3 exercises with no spelling mistakes',
      icon: '✨',
      requiredValue: 3,
      achievementType: 'perfect_exercises',
    },
    {
      name: 'Perfect Intermediate',
      description: 'Complete 10 exercises with no spelling mistakes',
      icon: '✨',
      requiredValue: 10,
      achievementType: 'perfect_exercises',
    },
    {
      name: 'Perfect Advanced',
      description: 'Complete 25 exercises with no spelling mistakes',
      icon: '💯',
      requiredValue: 25,
      achievementType: 'perfect_exercises',
    },
    {
      name: 'Perfect Expert',
      description: 'Complete 50 exercises with no spelling mistakes',
      icon: '🌟',
      requiredValue: 50,
      achievementType: 'perfect_exercises',
    },
    {
      name: 'Perfect Master',
      description: 'Complete 100 exercises with no spelling mistakes',
      icon: '🌠',
      requiredValue: 100,
      achievementType: 'perfect_exercises',
    },
    
    // Word count achievements
    {
      name: 'Word Collector',
      description: 'Learn 50 words correctly',
      icon: '📖',
      requiredValue: 50,
      achievementType: 'correct_words',
    },
    {
      name: 'Vocabulary Builder',
      description: 'Learn 200 words correctly',
      icon: '📖',
      requiredValue: 200,
      achievementType: 'correct_words',
    },
    {
      name: 'Word Master',
      description: 'Learn 500 words correctly',
      icon: '📖',
      requiredValue: 500,
      achievementType: 'correct_words',
    },
    {
      name: 'Word Wizard',
      description: 'Learn 1000 words correctly',
      icon: '🧙',
      requiredValue: 1000,
      achievementType: 'correct_words',
    },
    {
      name: 'Lexicon Legend',
      description: 'Learn 2000 words correctly',
      icon: '📚',
      requiredValue: 2000,
      achievementType: 'correct_words',
    },
    
    // Level achievements
    {
      name: 'Level 5 Reached',
      description: 'Reach level 5',
      icon: '⭐',
      requiredValue: 5,
      achievementType: 'level',
    },
    {
      name: 'Level 10 Reached',
      description: 'Reach level 10',
      icon: '⭐',
      requiredValue: 10,
      achievementType: 'level',
    },
    {
      name: 'Level 25 Reached',
      description: 'Reach level 25',
      icon: '🌟',
      requiredValue: 25,
      achievementType: 'level',
    },
    {
      name: 'Level 50 Reached',
      description: 'Reach level 50',
      icon: '👑',
      requiredValue: 50,
      achievementType: 'level',
    },
    {
      name: 'Level 75 Reached',
      description: 'Reach level 75',
      icon: '🏆',
      requiredValue: 75,
      achievementType: 'level',
    },
    {
      name: 'Level 100 Reached',
      description: 'Reach level 100',
      icon: '🔱',
      requiredValue: 100,
      achievementType: 'level',
    },
    
    // Challenge achievements
    {
      name: 'Challenge Accepted',
      description: 'Complete your first daily challenge',
      icon: '🎯',
      requiredValue: 1,
      achievementType: 'challenges',
    },
    {
      name: 'Challenge Enthusiast',
      description: 'Complete 5 daily challenges',
      icon: '🎯',
      requiredValue: 5,
      achievementType: 'challenges',
    },
    {
      name: 'Challenge Master',
      description: 'Complete 10 daily challenges',
      icon: '🎯',
      requiredValue: 10,
      achievementType: 'challenges',
    },
    {
      name: 'Challenge Champion',
      description: 'Complete 25 daily challenges',
      icon: '🏹',
      requiredValue: 25,
      achievementType: 'challenges',
    },
    {
      name: 'Challenge Legend',
      description: 'Complete 50 daily challenges',
      icon: '🏆',
      requiredValue: 50,
      achievementType: 'challenges',
    },
    
    // Accuracy achievements
    {
      name: 'Accuracy Novice',
      description: 'Achieve 70% accuracy in an exercise',
      icon: '🎯',
      requiredValue: 70,
      achievementType: 'accuracy',
    },
    {
      name: 'Accuracy Apprentice',
      description: 'Achieve 80% accuracy in an exercise',
      icon: '🎯',
      requiredValue: 80,
      achievementType: 'accuracy',
    },
    {
      name: 'Accuracy Expert',
      description: 'Achieve 90% accuracy in an exercise',
      icon: '🎯',
      requiredValue: 90,
      achievementType: 'accuracy',
    },
    {
      name: 'Accuracy Master',
      description: 'Achieve 95% accuracy in an exercise',
      icon: '🎯',
      requiredValue: 95,
      achievementType: 'accuracy',
    },
    {
      name: 'Perfect Accuracy',
      description: 'Achieve 100% accuracy in an exercise',
      icon: '💯',
      requiredValue: 100,
      achievementType: 'accuracy',
    },
    
    // Time-based achievements
    {
      name: 'Quick Learner',
      description: 'Complete an exercise in under 2 minutes',
      icon: '⏱️',
      requiredValue: 2,
      achievementType: 'time',
    },
    {
      name: 'Speed Demon',
      description: 'Complete an exercise in under 1 minute',
      icon: '⏱️',
      requiredValue: 1,
      achievementType: 'time',
    },
    {
      name: 'Lightning Fast',
      description: 'Complete an exercise in under 30 seconds',
      icon: '⚡',
      requiredValue: 0.5,
      achievementType: 'time',
    },
    
    // Difficulty achievements
    {
      name: 'Beginner Mastery',
      description: 'Complete 10 beginner difficulty exercises',
      icon: '🔰',
      requiredValue: 10,
      achievementType: 'difficulty_beginner',
    },
    {
      name: 'Intermediate Mastery',
      description: 'Complete 10 intermediate difficulty exercises',
      icon: '🔰',
      requiredValue: 10,
      achievementType: 'difficulty_intermediate',
    },
    {
      name: 'Advanced Mastery',
      description: 'Complete 10 advanced difficulty exercises',
      icon: '🔰',
      requiredValue: 10,
      achievementType: 'difficulty_advanced',
    },
    {
      name: 'Expert Mastery',
      description: 'Complete 10 expert difficulty exercises',
      icon: '🔰',
      requiredValue: 10,
      achievementType: 'difficulty_expert',
    },
  ];

  // Insert achievements
  for (const achievement of defaultAchievements) {
    await db.insert(achievements).values({
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      requiredValue: achievement.requiredValue,
      achievementType: achievement.achievementType,
      createdAt: Math.floor(Date.now() / 1000),
    });
  }

  console.log('Achievements seeded successfully.');
} 