require("dotenv").config({ path: "../shhh/.env" });

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
	//below used for local--------
	// 	client: "mysql2",
	// 	connection: {
	// 		host: "127.0.0.1",
	// 		database: process.env.DB_LOCAL_DBNAME,
	// 		user: process.env.DB_LOCAL_USER,
	// 		password: process.env.DB_LOCAL_PASSWORD,
	// 	},
	// };

	// below used for deployment----------
	client: "mysql2",
	connection: {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DBNAME,
		port: 3306,
	},
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
};
