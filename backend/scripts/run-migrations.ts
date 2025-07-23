const strapi = require("@strapi/strapi");
import path from "path";
import fs from "fs";

async function runMigrations() {
  try {
    // Initialize Strapi
    const app = strapi({ dir: process.cwd() });
    await app.load();
    await app.compile();

    // Get all migration files
    const migrationsDir = path.join(process.cwd(), "src/database/migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".ts"))
      .sort();

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(migrationsDir, file));
      await migration.up(app.db.connection);
      console.log(`Completed migration: ${file}`);
    }

    console.log("All migrations completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
}

runMigrations();
