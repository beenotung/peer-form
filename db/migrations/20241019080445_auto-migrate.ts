import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `questionnaire` add column `slug` text null')
  await knex.schema.alterTable(`questionnaire`, table => table.unique([`slug`]))
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(`questionnaire`, table => table.dropUnique([`slug`]))
  await knex.raw('alter table `questionnaire` drop column `slug`')
}
