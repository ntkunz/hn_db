const knex = require("knex")(require("../knexfile"));

//GET WAREHOUSES
exports.index = (_req, res) => {
	knex("users")
		.then((data) => {
			res.status(200).json(data);
			console.log('users retrieved successfully: ', data)
		})
		.catch((err) =>
			res.status(400).send(`Error retrieving users: ${err}`)
		);
};
