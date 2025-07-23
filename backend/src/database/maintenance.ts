import {
  checkForeignKeyConstraints,
  backupTable,
  validateTableStructure,
  createDatabaseSnapshot,
  restoreDatabaseSnapshot,
  cleanupOldSnapshots,
  monitorTableGrowth
} from './utils/db-utils';
import {
  performHealthCheck,
  suggestOptimizations,
  generateMaintenancePlan
} from './utils/health-check';

export default {
  name: 'database-maintenance',
  register({ strapi }) {
    const runMaintenanceChecks = async () => {
      try {
        // 1. Create a snapshot before maintenance
        await createDatabaseSnapshot(strapi);
        console.log('Created database snapshot before maintenance');

        // 2. Perform health check
        const healthCheck = await performHealthCheck(strapi);
        console.log('Health check results:', healthCheck);

        // 3. Get optimization suggestions
        const suggestions = await suggestOptimizations(strapi);
        console.log('Optimization suggestions:', suggestions);

        // 4. Generate maintenance plan
        const plan = await generateMaintenancePlan(strapi);
        console.log('Maintenance plan:', plan);

        // 5. Monitor table growth
        const tables = await strapi.db.connection.raw(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE';
        `);

        for (const table of tables.rows) {
          const growth = await monitorTableGrowth(strapi, table.table_name);
          console.log(`Table ${table.table_name} stats:`, growth);
        }

        // 6. Clean up old snapshots
        await cleanupOldSnapshots(strapi);
        console.log('Cleaned up old snapshots');

        return {
          status: 'success',
          message: 'Maintenance checks completed successfully',
          healthCheck,
          suggestions,
          plan
        };
      } catch (error) {
        console.error('Error during maintenance checks:', error);
        return {
          status: 'error',
          message: 'Maintenance checks failed',
          error: error.message
        };
      }
    };

    const validateForeignKeys = async () => {
      try {
        const tables = await strapi.db.connection.raw(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE';
        `);

        const results = {};
        for (const table of tables.rows) {
          const constraints = await checkForeignKeyConstraints(strapi, table.table_name);
          if (constraints.length > 0) {
            results[table.table_name] = constraints;
          }
        }

        return {
          status: 'success',
          foreignKeys: results
        };
      } catch (error) {
        console.error('Error checking foreign keys:', error);
        return {
          status: 'error',
          message: 'Foreign key check failed',
          error: error.message
        };
      }
    };

    const validateDatabase = async () => {
      try {
        const tables = await strapi.db.connection.raw(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE';
        `);

        const results = {};
        for (const table of tables.rows) {
          results[table.table_name] = await validateTableStructure(strapi, table.table_name);
        }

        return {
          status: 'success',
          validation: results
        };
      } catch (error) {
        console.error('Error validating database:', error);
        return {
          status: 'error',
          message: 'Database validation failed',
          error: error.message
        };
      }
    };

    strapi.db.maintenance = {
      runMaintenanceChecks,
      validateForeignKeys,
      validateDatabase,
      createSnapshot: () => createDatabaseSnapshot(strapi),
      restoreSnapshot: (snapshotName) => restoreDatabaseSnapshot(strapi, snapshotName),
      backupTable: (tableName) => backupTable(strapi, tableName),
      monitorGrowth: (tableName) => monitorTableGrowth(strapi, tableName)
    };
  }
};
