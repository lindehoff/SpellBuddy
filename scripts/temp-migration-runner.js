
    // Temporary file to run migrations
    async function main() {
      try {
        const { runMigrations } = require('../.next/server/chunks/app/lib/db/migrations/index.js');
        await runMigrations();
        console.log('Migrations completed successfully');
        process.exit(0);
      } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
      }
    }
    
    main();
  