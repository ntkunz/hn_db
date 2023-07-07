require("dotenv").config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
	// client: "mysql2",
	// connection: {
	// 	host: "127.0.0.1",
	// 	database: process.env.DB_LOCAL_DBNAME,
	// 	user: process.env.DB_LOCAL_USER,
	// 	password: process.env.DB_LOCAL_PASSWORD,
	// },
  client: "mysql2",
	production: {
		client: "mysql2",
		connection: process.env.DATABASE_URL + '?ssl=true',
    pool: {
      min: 2,
      max: 10
    },
    // connection: {
    //   host : 'process.env.DATABASE_URL',
    //   port : 'process.env.DB_PORT',
    //   user : 'process.env.DB_USER',
    //   password : 'process.env.DB_PASSWORD',
    //   database : 'process.env.DB_DBNAME',
    // },
		migrations: {
			directory: __dirname + "/migrations",
		},
		seeds: {
			directory: __dirname + "/seeds",
		},
	},
};
