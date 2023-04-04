const knex = require("knex")(require("../knexfile"));

//get a user's skills	
exports.index = (_req, res) => {
	knex("userskills")
		.then((data) => {
			res.status(200).json(data);
			// console.log(`users' skills retrieved successfully: `, data)
		})
		.catch((err) =>
			res.status(400).send(`Error retrieving users: ${err}`)
		);
};