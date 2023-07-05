require("dotenv").config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
	client: "mysql2",
	connection: {
		host: process.env.DB_HOST,
		database: process.env.DB_LOCAL_DBNAME,
		user: process.env.DB_LOCAL_USER,
		password: process.env.DB_LOCAL_PASSWORD,
	},
};

// development: {
//   client: 'sqlite3',
//   connection: {
//     filename: './dev.sqlite3'
//   }
// },

// staging: {
//   client: 'postgresql',
//   connection: {
//     database: 'my_db',
//     user:     'username',
//     password: 'password'
//   },
//   pool: {
//     min: 2,
//     max: 10
//   },
//   migrations: {
//     tableName: 'knex_migrations'
//   }
// },

// production: {
//   client: 'postgresql',
//   connection: {
//     database: 'my_db',
//     user:     'username',
//     password: 'password'
//   },
//   pool: {
//     min: 2,
//     max: 10
//   },
//   migrations: {
//     tableName: 'knex_migrations'
//   }
// }
