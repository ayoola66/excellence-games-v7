import { Strapi } from "@strapi/strapi";
import { resolve } from "path";
import { Umzug } from "umzug";
import { KnexUmzug } from "knex-umzug";

export default async ({ strapi }: { strapi: Strapi }) => {
  console.log("Running migrations...");

  const umzug = new Umzug({
    migrations: { glob: resolve(__dirname, "../database/migrations/*.js") },
    context: strapi.db.connection,
    storage: new KnexUmzug({
      connection: strapi.db.connection,
      tableName: "strapi_migrations",
    }),
    logger: console,
  });

  try {
    const pendingMigrations = await umzug.pending();
    if (pendingMigrations.length === 0) {
      console.log("No pending migrations to run.");
      return;
    }

    await umzug.up();
    console.log("Migrations applied successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};
