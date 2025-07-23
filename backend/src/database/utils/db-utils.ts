import { Strapi } from '@strapi/strapi';

export const checkForeignKeyConstraints = async (strapi: Strapi, tableName: string): Promise<string[]> => {
  const knex = strapi.db.connection;
  const constraints = await knex.raw(`
    SELECT
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM
      information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = ?;
  `, [tableName]);

  return constraints.rows;
};

export const backupTable = async (strapi: Strapi, tableName: string): Promise<void> => {
  const knex = strapi.db.connection;
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
  const backupTableName = `${tableName}_backup_${timestamp}`;

  await knex.raw(`CREATE TABLE ?? AS SELECT * FROM ??`, [backupTableName, tableName]);
};

export const validateTableStructure = async (strapi: Strapi, tableName: string): Promise<boolean> => {
  const knex = strapi.db.connection;
  try {
    await knex(tableName).first();
    return true;
  } catch (error) {
    console.error(`Table structure validation failed for ${tableName}:`, error);
    return false;
  }
};

export const createDatabaseSnapshot = async (strapi: Strapi): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
  const snapshotName = `db_snapshot_${timestamp}`;
  
  // Get all tables
  const tables = await strapi.db.connection.raw(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
  `);

  // Create a schema for the snapshot
  await strapi.db.connection.raw(`CREATE SCHEMA ??`, [snapshotName]);

  // Copy all tables to the new schema
  for (const table of tables.rows) {
    await strapi.db.connection.raw(
      `CREATE TABLE ??.?? AS SELECT * FROM public.??`,
      [snapshotName, table.table_name, table.table_name]
    );
  }
};

export const restoreDatabaseSnapshot = async (strapi: Strapi, snapshotName: string): Promise<void> => {
  const tables = await strapi.db.connection.raw(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = ? 
    AND table_type = 'BASE TABLE';
  `, [snapshotName]);

  // Restore each table
  for (const table of tables.rows) {
    await strapi.db.connection.raw(
      `TRUNCATE TABLE public.?? CASCADE; 
       INSERT INTO public.?? SELECT * FROM ??.??`,
      [table.table_name, table.table_name, snapshotName, table.table_name]
    );
  }
};

export const cleanupOldSnapshots = async (strapi: Strapi, daysToKeep: number = 7): Promise<void> => {
  const schemas = await strapi.db.connection.raw(`
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name LIKE 'db_snapshot_%';
  `);

  const now = new Date();
  for (const schema of schemas.rows) {
    const timestamp = schema.schema_name.split('_').pop();
    const snapshotDate = new Date(
      parseInt(timestamp.slice(0, 4)),
      parseInt(timestamp.slice(4, 6)) - 1,
      parseInt(timestamp.slice(6, 8))
    );

    if ((now.getTime() - snapshotDate.getTime()) > daysToKeep * 24 * 60 * 60 * 1000) {
      await strapi.db.connection.raw(`DROP SCHEMA ?? CASCADE`, [schema.schema_name]);
    }
  }
};

export const monitorTableGrowth = async (strapi: Strapi, tableName: string): Promise<any> => {
  const stats = await strapi.db.connection.raw(`
    SELECT
      pg_size_pretty(pg_total_relation_size(?)) as total_size,
      pg_size_pretty(pg_table_size(?)) as table_size,
      pg_size_pretty(pg_indexes_size(?)) as index_size,
      (SELECT count(*) FROM ??) as row_count
  `, [tableName, tableName, tableName, tableName]);

  return stats.rows[0];
};
