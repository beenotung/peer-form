import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('questionnaire'))) {
    await knex.schema.createTable('questionnaire', table => {
      table.increments('id')
      table.text('title').notNullable()
      table.text('short_desc').notNullable()
      table.integer('user_id').unsigned().notNullable().references('user.id')
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('question'))) {
    await knex.schema.createTable('question', table => {
      table.increments('id')
      table.integer('questionnaire_id').unsigned().notNullable().references('questionnaire.id')
      table.text('question').notNullable()
      table.json('choices').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('response'))) {
    await knex.schema.createTable('response', table => {
      table.increments('id')
      table.integer('question_id').unsigned().notNullable().references('question.id')
      table.integer('user_id').unsigned().notNullable().references('user.id')
      table.timestamps(false, true)
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('response')
  await knex.schema.dropTableIfExists('question')
  await knex.schema.dropTableIfExists('questionnaire')
}
