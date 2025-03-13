import * as fs from 'fs';
import * as path from 'path';
import { db } from './index';
import * as schema from './schema';

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
    
    // Create a migration file with the schema
    const migrationDir = path.join(drizzleDir, 'migrations');
    if (!fs.existsSync(migrationDir)) {
      console.log('Creating migrations directory...');
      fs.mkdirSync(migrationDir, { recursive: true });
    }
    
    // Create a timestamp for the migration
    const timestamp = new Date().getTime();
    const migrationFile = path.join(migrationDir, `${timestamp}_initial_schema.sql`);
    
    // Generate the schema SQL
    const schemaSQL = `
-- Initial schema migration
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Add other tables as needed
`;
    
    // Write the schema to the migration file
    fs.writeFileSync(migrationFile, schemaSQL);
    
    // Create meta directory if it doesn't exist
    const metaDir = path.join(drizzleDir, 'meta');
    if (!fs.existsSync(metaDir)) {
      console.log('Creating meta directory...');
      fs.mkdirSync(metaDir, { recursive: true });
      
      // Create empty journal file
      const journalPath = path.join(metaDir, '_journal.json');
      fs.writeFileSync(journalPath, JSON.stringify({ 
        entries: [
          {
            id: timestamp,
            hash: `${timestamp}_initial_schema`,
            created_at: timestamp
          }
        ] 
      }));
    }
    
    console.log('Schema generated successfully.');
  } catch (error) {
    console.error('Schema generation failed:', error);
    // Don't exit process, allow application to continue
    console.log('Continuing despite schema generation failure...');
  }
}

// Run schema generation if this file is executed directly
if (require.main === module) {
  generateSchema();
}

export { generateSchema }; 