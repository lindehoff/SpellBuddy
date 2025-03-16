import * as fs from 'fs';
import * as path from 'path';

/**
 * This script generates the SQL schema for the database
 * It's used by the db:generate command
 */
async function generateSchema() {
  console.log('Generating schema...');
  
  try {
    // Ensure drizzle directory exists
    const drizzleDir = path.join(process.cwd(), 'drizzle');
    if (!fs.existsSync(drizzleDir)) {
      console.log('Creating drizzle directory...');
      fs.mkdirSync(drizzleDir, { recursive: true });
    }
    
    // Create migrations directory
    const migrationDir = path.join(drizzleDir, 'migrations');
    if (!fs.existsSync(migrationDir)) {
      console.log('Creating migrations directory...');
      fs.mkdirSync(migrationDir, { recursive: true });
    }
    
    // Create meta directory
    const metaDir = path.join(drizzleDir, 'meta');
    if (!fs.existsSync(metaDir)) {
      console.log('Creating meta directory...');
      fs.mkdirSync(metaDir, { recursive: true });
    }
    
    // Create a timestamp for the migration
    const timestamp = new Date().getTime();
    const migrationFile = path.join(migrationDir, `${timestamp}_initial_schema.sql`);
    
    // Generate the schema SQL for all tables
    const schemaSQL = `
-- Initial schema migration
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

CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);`;
    
    // Write the schema to the migration file
    fs.writeFileSync(migrationFile, schemaSQL);
    
    // Create or update the journal file
    const journalPath = path.join(metaDir, '_journal.json');
    const journalContent = {
      version: '5',
      entries: [{
        tag: '1',
        id: timestamp,
        name: 'initial_schema',
        hash: `${timestamp}_initial_schema`,
        created_at: timestamp
      }]
    };
    
    fs.writeFileSync(journalPath, JSON.stringify(journalContent, null, 2));
    
    console.log('Schema generated successfully.');
  } catch (error) {
    console.error('Schema generation failed:', error);
    throw error;
  }
}

// Run schema generation if this file is executed directly
if (require.main === module) {
  generateSchema();
}

export { generateSchema }; 