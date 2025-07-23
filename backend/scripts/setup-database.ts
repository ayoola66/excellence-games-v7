import { Client } from "pg";

async function setupDatabase() {
  const client = new Client({
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    user: process.env.DATABASE_USERNAME || "postgres",
    password: process.env.DATABASE_PASSWORD || "postgres",
    database: "postgres", // Connect to default database first
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    // Drop connections to the target database
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'targeted_v2'
      AND pid <> pg_backend_pid();
    `);
    console.log("Terminated existing connections");

    // Drop and recreate database
    await client.query("DROP DATABASE IF EXISTS targeted_v2;");
    await client.query("CREATE DATABASE targeted_v2;");
    console.log("Database recreated successfully");

    await client.end();
    console.log("Setup completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during database setup:", error);
    process.exit(1);
  }
}

setupDatabase();
