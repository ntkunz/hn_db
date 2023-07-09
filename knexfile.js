require("dotenv").config();
// dotenv.load();

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

	//SOMETHING TO TRY ON SUNDAY:
	// module.exports = {
	// 	development: {
	// 	  client: 'mysql2',
	// 	  connection: {
	// 		 connectionString: process.env.DATABASE_URL,
	// 		 ssl: {
	// 			ca: process.env.SSL_CA,
	// 			cert: process.env.SSL_CERT,
	// 			key: process.env.SSL_KEY,
	// 			passphrase: process.env.SSL_PASSPHRASE,
	// 			rejectUnauthorized: true,
	// 		 },
	// 	  },
	// 	},
	// 	// ... other environment configurations
	//  };

	// below used for deployment
	// client: "mysql2",
	production: {
		client: "mysql2",
		connection: {
			host: process.env.DATABASE_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DBNAME,
			charset: 'utf8'
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
	},
};
		
		
		// connection: process.env.CLEARDB_DATABASE_URL + "?ssl=true",
		// connection: process.env.DATABASE_URL,



		// connection: {
		//   host : 'process.env.JAWSDB_URL',
		//   host : 'process.env.DATABASE_URL',
		//   port : 'process.env.DB_PORT',
		//   user : 'process.env.DB_USER',
		//   password : 'process.env.DB_PASSWORD',
		//   database : 'process.env.DB_DBNAME',
		// },
// 		pool: {
// 			min: 2,
// 			max: 10,
// 		},
// 		migrations: {
// 			directory: __dirname + "/migrations",
// 		},
// 		seeds: {
// 			directory: __dirname + "/seeds",
// 		},
// 	},
// };

//below came out of production object above
// connection: {
//   host : 'process.env.CLEARDB_DATABASE_URL',
//   port : 'process.env.DB_PORT',
//   user : 'process.env.DB_USER',
//   password : 'process.env.DB_PASSWORD',
//   database : 'process.env.DB_DBNAME',
// },
