module.exports = {
  async bootstrap({ strapi }) {
    try {
      // Create case-insensitive collation if it doesn't exist
      await strapi.db.connection.raw(`
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
      await strapi.db.connection.raw(`
        ALTER TABLE games 
        ALTER COLUMN name TYPE varchar COLLATE case_insensitive,
        ALTER COLUMN type TYPE varchar COLLATE case_insensitive;
      `);

      // Update the unique index to be case-insensitive
      await strapi.db.connection.raw(`
        DROP INDEX IF EXISTS games_name_type_unique;
        CREATE UNIQUE INDEX games_name_type_unique ON games (name COLLATE case_insensitive, type COLLATE case_insensitive);
      `);

      console.log("Successfully updated database collation");
    } catch (error) {
      console.error("Error updating database collation:", error);
      throw error;
    }
  },
};
