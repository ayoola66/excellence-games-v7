import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create case-insensitive collation if it doesn't exist
  await knex.raw(`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM pg_collation WHERE collname = 'case_insensitive') THEN
        CREATE COLLATION case_insensitive (
          provider = icu,
          locale = 'und-u-ks-level2',
          deterministic = false
        );
      END IF;
    END $$;
  `);

  // Update the games table to use case-insensitive collation
  await knex.raw(`
    ALTER TABLE games 
    ALTER COLUMN name TYPE varchar COLLATE case_insensitive,
    ALTER COLUMN type TYPE varchar COLLATE case_insensitive;
  `);

  // Update the unique index to be case-insensitive
  await knex.raw(`
    DROP INDEX IF EXISTS games_name_type_unique;
    CREATE UNIQUE INDEX games_name_type_unique ON games (name COLLATE case_insensitive, type COLLATE case_insensitive);
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Revert the collation changes
  await knex.raw(`
    ALTER TABLE games 
    ALTER COLUMN name TYPE varchar COLLATE "default",
    ALTER COLUMN type TYPE varchar COLLATE "default";
  `);

  // Recreate the original index
  await knex.raw(`
    DROP INDEX IF EXISTS games_name_type_unique;
    CREATE UNIQUE INDEX games_name_type_unique ON games (name, type);
  `);
}
