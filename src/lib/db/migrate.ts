import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index";

console.log("Running migrations...");

// This will run all the migrations
migrate(db, { migrationsFolder: "./drizzle" });

console.log("Migrations complete!"); 