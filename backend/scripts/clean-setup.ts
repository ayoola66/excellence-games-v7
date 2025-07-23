import { Client } from "pg";

async function cleanSetup() {
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

    // Drop the database if it exists
    await client.query("DROP DATABASE IF EXISTS targeted_v2;");
    await client.query("CREATE DATABASE targeted_v2;");
    console.log("Database recreated");

    // Connect to the new database to set up schemas
    await client.end();

    const targetClient = new Client({
      host: process.env.DATABASE_HOST || "127.0.0.1",
      port: parseInt(process.env.DATABASE_PORT || "5432"),
      user: process.env.DATABASE_USERNAME || "postgres",
      password: process.env.DATABASE_PASSWORD || "postgres",
      database: "targeted_v2",
    });

    await targetClient.connect();

    // Drop public schema and recreate it
    await targetClient.query("DROP SCHEMA IF EXISTS public CASCADE;");
    await targetClient.query("CREATE SCHEMA public;");

    // Drop strapi schema if it exists
    await targetClient.query("DROP SCHEMA IF EXISTS strapi_new CASCADE;");
    await targetClient.query("CREATE SCHEMA strapi_new;");

    // Set the search path
    await targetClient.query("SET search_path TO strapi_new, public;");

    console.log("Schemas reset successfully");

    await targetClient.end();
    console.log("Setup completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during database setup:", error);
    process.exit(1);
  }
}

cleanSetup();
