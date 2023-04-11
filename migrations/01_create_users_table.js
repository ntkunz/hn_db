/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('users', (table) => {
      table.uuid('user_id').primary().notNullable();
      table.string('first_name', 30).notNullable();
      table.string('last_name', 30).notNullable();
      table.string('email', 30).notNullable();
      table.string('password', 16).notNullable();
      table.string('image_url').nullable();
      table.string('status', 10).notNullable();
      table.string('home', 30).notNullable();
      table.string('city', 20).notNullable();
      table.string('province', 20).notNullable();
      table.string('address', 70).notNullable();
      table.string('about', 300).notNullable();
      table.point('location').notNullable();
      table.timestamps(true, true);
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema.dropTable('users');
  };