/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('users', (table) => {
      table.uuid('user_id').primary().notNullable();
      // table.uuid('user_id').references('user_id').onUpdate('CASCADE').onDelete('CASCADE');
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('email').notNullable();
      table.string('status').notNullable();
      table.string('address').notNullable();
      table.string('about').notNullable();
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

//   DROP TABLE IF EXISTS places;
// CREATE TABLE places (title VARCHAR(255), address TEXT, lat DOUBLE, lng DOUBLE);
// INSERT INTO places (title, address, lat, lng) VALUES ('Houses of Parliament', 'Westminster, London SW1A 0AA', 51.4995, 0.1248);
// INSERT INTO places (title, address, lat, lng) VALUES ('Buckingham Palace', 'Westminster, London SW1A 1AA', 51.5014, 0.1419);
// INSERT INTO places (title, address, lat, lng) VALUES ('10 Downing Street', 'Westminster, London SW1A 2AA', 51.5034, 0.1276);

// SELECT *,
//        ACOS(SIN(RADIANS(51.5007)) * SIN(RADIANS(lat)) + COS(RADIANS(51.5007)) * COS(RADIANS(lat))
//        * COS(RADIANS(lng - 0.1246))) * 3959 AS `Distance in miles from Big Ben`
// FROM places
// WHERE  ACOS(SIN(RADIANS(51.5007)) * SIN(RADIANS(lat)) + COS(RADIANS(51.5007)) * COS(RADIANS(lat))
//        * COS(RADIANS(lng - 0.1246))) * 3959 < 10
// ORDER BY `Distance in miles from Big Ben`;

  