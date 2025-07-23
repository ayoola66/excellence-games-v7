import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add your migration logic here
  // Example:
  // await knex.schema.createTable('example', (table) => {
  //   table.increments('id').primary();
  //   table.string('name').notNullable();
  //   table.timestamps(true, true);
  // });
}

export async function down(knex: Knex): Promise<void> {
  // Add your rollback logic here
  // Example:
  // await knex.schema.dropTable('example');
}
