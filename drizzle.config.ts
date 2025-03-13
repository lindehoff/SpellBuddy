import type { Config } from 'drizzle-kit';

// Define database path - use data directory in production
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/app/data/sqlite.db'
  : 'sqlite.db';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: dbPath,
  },
} satisfies Config; 