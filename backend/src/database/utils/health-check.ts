import { Strapi } from "@strapi/strapi";

interface HealthCheckResults {
  connection: boolean;
  tables: any[];
  indexes: any[];
  constraints: any[];
  performance: any[];
}

export const performHealthCheck = async (strapi: Strapi) => {
  const knex = strapi.db.connection;
  const results: HealthCheckResults = {
    connection: false,
    tables: [],
    indexes: [],
    constraints: [],
    performance: [],
  };

  try {
    // Test connection
    await knex.raw("SELECT 1");
    results.connection = true;

    // Check table statistics
    const tableStats = await knex.raw(`
      SELECT
        schemaname,
        relname,
        n_live_tup,
        n_dead_tup,
        last_vacuum,
        last_autovacuum
      FROM pg_stat_user_tables
      WHERE schemaname = 'public';
    `);
    results.tables = tableStats.rows;

    // Check index health
    const indexStats = await knex.raw(`
      SELECT
        schemaname,
        tablename,
        indexrelname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public';
    `);
    results.indexes = indexStats.rows;

    // Check foreign key constraints
    const constraintStats = await knex.raw(`
      SELECT
        tc.table_schema,
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public';
    `);
    results.constraints = constraintStats.rows;

    // Check query performance
    const performanceStats = await knex.raw(`
      SELECT
        relname,
        seq_scan,
        seq_tup_read,
        idx_scan,
        n_tup_ins,
        n_tup_upd,
        n_tup_del
      FROM pg_stat_user_tables
      WHERE schemaname = 'public';
    `);
    results.performance = performanceStats.rows;

    return {
      status: "success",
      message: "Health check completed successfully",
      results,
    };
  } catch (error) {
    return {
      status: "error",
      message: "Health check failed",
      error: error.message,
      results,
    };
  }
};

export const suggestOptimizations = async (strapi: Strapi) => {
  const healthCheck = await performHealthCheck(strapi);
  const suggestions = [];

  if (healthCheck.status === "success") {
    // Analyze table statistics
    healthCheck.results.tables.forEach((table) => {
      if (table.n_dead_tup > table.n_live_tup * 0.1) {
        suggestions.push({
          type: "maintenance",
          table: table.relname,
          suggestion:
            "Consider running VACUUM on this table due to high number of dead tuples",
        });
      }

      const lastVacuum = new Date(table.last_vacuum || table.last_autovacuum);
      if (Date.now() - lastVacuum.getTime() > 7 * 24 * 60 * 60 * 1000) {
        suggestions.push({
          type: "maintenance",
          table: table.relname,
          suggestion: "Table has not been vacuumed in over a week",
        });
      }
    });

    // Analyze index usage
    healthCheck.results.indexes.forEach((index) => {
      if (index.idx_scan === "0") {
        suggestions.push({
          type: "index",
          table: index.tablename,
          index: index.indexrelname,
          suggestion:
            "Unused index detected. Consider removing if not required for constraints",
        });
      }
    });

    // Analyze query performance
    healthCheck.results.performance.forEach((perf) => {
      if (perf.seq_scan > perf.idx_scan * 10) {
        suggestions.push({
          type: "performance",
          table: perf.relname,
          suggestion:
            "High number of sequential scans detected. Consider adding indexes",
        });
      }
    });
  }

  return suggestions;
};

export const generateMaintenancePlan = async (strapi: Strapi) => {
  const suggestions = await suggestOptimizations(strapi);
  const plan = {
    immediate: [],
    scheduled: [],
    optional: [],
  };

  suggestions.forEach((suggestion) => {
    switch (suggestion.type) {
      case "maintenance":
        plan.scheduled.push({
          action: `VACUUM ANALYZE ${suggestion.table};`,
          reason: suggestion.suggestion,
        });
        break;
      case "index":
        plan.optional.push({
          action: `DROP INDEX IF EXISTS ${suggestion.index};`,
          reason: suggestion.suggestion,
          warning:
            "Verify this index is not needed for constraints or unique checks",
        });
        break;
      case "performance":
        plan.immediate.push({
          action: "Review query patterns and add appropriate indexes",
          reason: suggestion.suggestion,
          table: suggestion.table,
        });
        break;
    }
  });

  return plan;
};
