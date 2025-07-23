import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  // await knex('table_name').del();

  // Inserts seed entries
  // await knex('table_name').insert([
  //   { id: 1, column: 'value' },
  //   { id: 2, column: 'value2' },
  // ]);
}
