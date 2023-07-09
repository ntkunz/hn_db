require("dotenv").config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
	//below used for local
	// 	client: "mysql2",
	// 	connection: {
	// 		host: "127.0.0.1",
	// 		database: process.env.DB_LOCAL_DBNAME,
	// 		user: process.env.DB_LOCAL_USER,
	// 		password: process.env.DB_LOCAL_PASSWORD,
	// 	},
	// };

	// below used for deployment
	client: "mysql2",
	production: {
		client: "mysql2",
		// connection: process.env.CLEARDB_DATABASE_URL + "?ssl=true",
		connection: process.env.DATABASE_URL,
		// connection: {
//   host : 'process.env.JAWSDB_URL',
//   host : 'process.env.DATABASE_URL',
//   port : 'process.env.DB_PORT',
//   user : 'process.env.DB_USER',
//   password : 'process.env.DB_PASSWORD',
//   database : 'process.env.DB_DBNAME',
// },
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			directory: __dirname + "/migrations",
		},
		seeds: {
			directory: __dirname + "/seeds",
		},
	},
};

//below came out of production object above
// connection: {
//   host : 'process.env.CLEARDB_DATABASE_URL',
//   port : 'process.env.DB_PORT',
//   user : 'process.env.DB_USER',
//   password : 'process.env.DB_PASSWORD',
//   database : 'process.env.DB_DBNAME',
// },
