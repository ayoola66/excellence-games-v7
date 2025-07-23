import { Client } from "pg";

async function cleanDatabase() {
  const client = new Client({
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    user: process.env.DATABASE_USERNAME || "postgres",
    password: process.env.DATABASE_PASSWORD || "postgres",
    database: process.env.DATABASE_NAME || "targeted_v2",
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    // First, terminate all other connections to the database
    await client.query(
      `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1
      AND pid <> pg_backend_pid();
    `,
      ["targeted_v2"]
    );
    console.log("Terminated existing connections");

    // Drop dependent tables first
    await client.query(`
      DROP TABLE IF EXISTS orders_user_links CASCADE;
      DROP TABLE IF EXISTS music_uploads_user_links CASCADE;
      DROP TABLE IF EXISTS user_profiles_user_links CASCADE;
      DROP TABLE IF EXISTS activities_user_links CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log("Dropped dependent tables");

    // Drop and recreate the public schema
    await client.query("DROP SCHEMA IF EXISTS public CASCADE;");
    await client.query("CREATE SCHEMA public;");
    await client.query("GRANT ALL ON SCHEMA public TO postgres;");
    await client.query("GRANT ALL ON SCHEMA public TO public;");
    console.log("Reset public schema");

    // Drop and recreate the strapi schema if it exists
    await client.query("DROP SCHEMA IF EXISTS strapi_new CASCADE;");
    await client.query("CREATE SCHEMA strapi_new;");
    await client.query("GRANT ALL ON SCHEMA strapi_new TO postgres;");
    await client.query("GRANT ALL ON SCHEMA strapi_new TO public;");
    console.log("Reset strapi schema");

    console.log("Database cleaned successfully");
  } catch (error) {
    console.error("Error cleaning database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

cleanDatabase().catch(console.error);
