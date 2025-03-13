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
    
    // Challenge achievements
    {
      name: 'Challenge Accepted',
      description: 'Complete your first daily challenge',
      icon: '🎯',
      requiredValue: 1,
      achievementType: 'challenges',
    },
    {
      name: 'Challenge Master',
      description: 'Complete 10 daily challenges',
      icon: '🎯',
      requiredValue: 10,
      achievementType: 'challenges',
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