import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';
import * as fs from 'fs';
import * as path from 'path';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { DrizzleDB } from './types';
import Database from 'better-sqlite3';

async function runMigrations() {
  console.log('Running migrations...');
  
  try {
    // Ensure drizzle directory exists
    const drizzleDir = path.join(process.cwd(), 'drizzle');
    if (!fs.existsSync(drizzleDir)) {
      console.log('Creating drizzle directory...');
      fs.mkdirSync(drizzleDir, { recursive: true });
    }
    
    // Ensure migrations directory exists
    const migrationsDir = path.join(drizzleDir, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('Creating migrations directory...');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Ensure meta directory exists
    const metaDir = path.join(drizzleDir, 'meta');
    if (!fs.existsSync(metaDir)) {
      console.log('Creating meta directory...');
      fs.mkdirSync(metaDir, { recursive: true });
      
      // Create empty journal file if it doesn't exist
      const journalPath = path.join(metaDir, '_journal.json');
      if (!fs.existsSync(journalPath)) {
        fs.writeFileSync(journalPath, JSON.stringify({ version: '5', entries: [] }, null, 2));
      }
    }

    // Run migrations
    try {
      await migrate(db as DrizzleDB, { migrationsFolder: './drizzle/migrations' });
      console.log('Migrations completed successfully.');
    } catch (migrateError) {
      console.error('Migration error:', migrateError);
      
      // If migration fails, try to create tables directly
      console.log('Attempting to create tables directly...');
      
      // Create a new direct connection to the database
      const dbPath = process.env.NODE_ENV === 'production' 
        ? '/app/data/sqlite.db'
        : 'sqlite.db';
      
      try {
        const sqlite = new Database(dbPath);
        
        // Create tables if they don't exist
        sqlite.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (unixepoch()),
            last_login_at INTEGER,
            experience_points INTEGER NOT NULL DEFAULT 0,
            level INTEGER NOT NULL DEFAULT 1
          );

          CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            age INTEGER,
            interests TEXT,
            difficulty_level TEXT DEFAULT 'beginner',
            topics_of_interest TEXT,
            created_at INTEGER NOT NULL DEFAULT (unixepoch()),
            updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
            adaptive_difficulty INTEGER NOT NULL DEFAULT 1,
            current_difficulty_score INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id)
          );

          CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            correct_count INTEGER DEFAULT 0,
            incorrect_count INTEGER DEFAULT 0,
            last_practiced INTEGER,
            created_at INTEGER NOT NULL DEFAULT (unixepoch()),
            difficulty_rating INTEGER DEFAULT 50
          );

          CREATE TABLE IF NOT EXISTS exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            original_text TEXT NOT NULL,
            translated_text TEXT,
            user_translation TEXT,
            spoken_translation TEXT,
            created_at INTEGER NOT NULL DEFAULT (unixepoch()),
            completed_at INTEGER,
            exercise_difficulty INTEGER DEFAULT 1,
            experience_awarded INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
          );

          CREATE TABLE IF NOT EXISTS word_exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exercise_id INTEGER NOT NULL,
            word_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            is_correct INTEGER NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL DEFAULT (unixepoch()),
            FOREIGN KEY (exercise_id) REFERENCES exercises(id),
            FOREIGN KEY (word_id) REFERENCES words(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
          );

          CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_exercises INTEGER NOT NULL DEFAULT 0,
            correct_words INTEGER NOT NULL DEFAULT 0,
            incorrect_words INTEGER NOT NULL DEFAULT 0,
            streak_days INTEGER NOT NULL DEFAULT 0,
            last_exercise_date INTEGER,
            updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
            perfect_exercises INTEGER NOT NULL DEFAULT 0,
            longest_streak INTEGER NOT NULL DEFAULT 0,
            total_experience_points INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
          );

          CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            icon TEXT NOT NULL,
            required_value INTEGER NOT NULL,
            achievement_type TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (unixepoch())
          );

          CREATE TABLE IF NOT EXISTS user_achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            achievement_id INTEGER NOT NULL,
            unlocked_at INTEGER NOT NULL DEFAULT (unixepoch()),
            is_new INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (achievement_id) REFERENCES achievements(id)
          );

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
        
        console.log('Tables created successfully.');
        
        // Close the database connection
        sqlite.close();
      } catch (sqliteError) {
        console.error('Error creating tables directly:', sqliteError);
        throw sqliteError;
      }
    }
  } catch (error) {
    console.error('Migration setup failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations }; 