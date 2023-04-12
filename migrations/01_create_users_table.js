/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('users', (table) => {
      table.uuid('user_id').primary().notNullable();
      // table.uuid('user_id').primary().notNullable().onUpdate('CASCADE').onDelete('CASCADE');
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('email').notNullable();
      table.string('password').notNullable();
      table.string('image_url').nullable();
      table.string('status').notNullable();
      table.string('home').notNullable();
      table.string('city').notNullable();
      table.string('province').notNullable();
      table.string('address').notNullable();
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



  //================================================================
//   DROP TABLE IF EXISTS places;
// CREATE TABLE places (title VARCHAR(255), address TEXT, lat DOUBLE, lng DOUBLE);
// INSERT INTO places (title, address, lat, lng) VALUES ('Houses of Parliament', 'Westminster, London SW1A 0AA', 51.4995, 0.1248);
// INSERT INTO places (title, address, lat, lng) VALUES ('Buckingham Palace', 'Westminster, London SW1A 1AA', 51.5014, 0.1419);
// INSERT INTO places (title, address, lat, lng) VALUES ('10 Downing Street', 'Westminster, London SW1A 2AA', 51.5034, 0.1276);

//==============================================================
// SELECT *,
//        ACOS(SIN(RADIANS(51.5007)) * SIN(RADIANS(lat)) + COS(RADIANS(51.5007)) * COS(RADIANS(lat))
//        * COS(RADIANS(lng - 0.1246))) * 3959 AS `Distance in miles from Big Ben`
// FROM places
// WHERE  ACOS(SIN(RADIANS(51.5007)) * SIN(RADIANS(lat)) + COS(RADIANS(51.5007)) * COS(RADIANS(lat))
//        * COS(RADIANS(lng - 0.1246))) * 3959 < 10
// ORDER BY `Distance in miles from Big Ben`;

//==============================================================
  //how to seed lat and long locations into mysql with knex
//   return knex.raw(`
      //   INSERT INTO your_table (latitude, longitude, location)
      //   VALUES 
      //     (51.5074, -0.1278, ST_GeomFromText('POINT(-0.1278 51.5074)')),
      //     (40.7128, -74.0060, ST_GeomFromText('POINT(-74.0060 40.7128)')),
      //     (48.8566, 2.3522, ST_GeomFromText('POINT(2.3522 48.8566)'))
      // `);
//==============================================================
//       //or this to add to a table
//       ALTER TABLE your_table ADD COLUMN location POINT;
// UPDATE your_table SET location = ST_GeomFromText(CONCAT('POINT(', longitude, ' ', latitude, ')'));
// ALTER TABLE your_table ADD SPATIAL INDEX(location);
//--------------------------------------------------------------

//ask jim about this... using json and these methods
// $formatDatabaseJson(json) {
//     const location = json.location;
//     const formattedJson = super.$formatDatabaseJson(json);
//     const rawLocation = raw("ST_PointFromText('POINT(? ?)')", [location.lat, location.lng]);
//     formattedJson.location = rawLocation;
//     return formattedJson;
// }