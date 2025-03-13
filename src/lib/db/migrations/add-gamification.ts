import { sql } from 'drizzle-orm';
import { db } from '../index';

export async function addGamificationTables() {
  console.log('Adding gamification tables and columns...');

  // Add columns to users table
  await db.run(sql`
    ALTER TABLE users 
    ADD COLUMN experience_points INTEGER NOT NULL DEFAULT 0;
  `);
  
  await db.run(sql`
    ALTER TABLE users 
    ADD COLUMN level INTEGER NOT NULL DEFAULT 1;
  `);

  // Update user_preferences table
  await db.run(sql`
    ALTER TABLE user_preferences 
    ADD COLUMN adaptive_difficulty INTEGER NOT NULL DEFAULT 1;
  `);
  
  await db.run(sql`
    ALTER TABLE user_preferences 
    ADD COLUMN current_difficulty_score INTEGER NOT NULL DEFAULT 1;
  `);

  // Add columns to words table
  await db.run(sql`
    ALTER TABLE words 
    ADD COLUMN difficulty_rating INTEGER DEFAULT 50;
  `);

  // Add columns to exercises table
  await db.run(sql`
    ALTER TABLE exercises 
    ADD COLUMN exercise_difficulty INTEGER DEFAULT 1;
  `);
  
  await db.run(sql`
    ALTER TABLE exercises 
    ADD COLUMN experience_awarded INTEGER DEFAULT 0;
  `);

  // Add columns to progress table
  await db.run(sql`
    ALTER TABLE progress 
    ADD COLUMN perfect_exercises INTEGER NOT NULL DEFAULT 0;
  `);
  
  await db.run(sql`
    ALTER TABLE progress 
    ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0;
  `);
  
  await db.run(sql`
    ALTER TABLE progress 
    ADD COLUMN total_experience_points INTEGER NOT NULL DEFAULT 0;
  `);

  // Create achievements table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      required_value INTEGER NOT NULL,
      achievement_type TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Create user_achievements table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_id INTEGER NOT NULL,
      unlocked_at INTEGER NOT NULL DEFAULT (unixepoch()),
      is_new INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (achievement_id) REFERENCES achievements(id)
    );
  `);

  // Create daily_challenges table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS daily_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      experience_reward INTEGER NOT NULL,
      target_count INTEGER NOT NULL,
      challenge_type TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      expires_at INTEGER NOT NULL
    );
  `);

  // Create user_challenges table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS user_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      current_count INTEGER NOT NULL DEFAULT 0,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at INTEGER,
      is_reward_claimed INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id)
    );
  `);

  console.log('Gamification tables and columns added successfully.');
} 