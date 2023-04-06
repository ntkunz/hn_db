const knex = require("knex")(require("../knexfile"));

// //get all users
// exports.index = (_req, res) => {
// 	knex("users")
// 		.then((data) => {
// 			res.status(200).json(data);
// 			// console.log('users retrieved successfully: ', data)
// 		})
// 		.catch((err) =>
// 			res.status(400).send(`Error retrieving users: ${err}`)
// 		);
// };

exports.index = async (req, res) => {
	try {
		console.log(req.body.email)
		const foundUser = await knex("users").where({ email: req.body.email });
		if (foundUser) {
			// console.log(foundUser);
			res.status(200).json(foundUser);
		}
	} catch (err) {
		console.error(err);
		res.status(400).send(`Error getting user ${err}`);
	}
};

//get all users when a user is logged in
exports.getNeighbors = (_req, res) => {
	knex("users")
		.then((data) => {
			res.status(200).json(data);
			// console.log('users retrieved successfully: ', data)
		})
		.catch((err) =>
			res.status(400).send(`Error retrieving users: ${err}`)
		);
};


//working on getting all neighbors based off of logged in user location
// exports.getNeighbors = async (req, res) => {
// 	try {
// 		const neighbors = await knex("users").whereRaw(
// 			ST_Distance_Sphere({ location: req.body.location }, location) < 100000000
// 		);
// 		if (neighbors) {
// 			console.log(neighbors);
// 			// res.status(200).json(neighbors);
// 		}
// 	} catch (err) {
// 		console.error(err);
// 		res.status(400).send(`Error getting neighbors ${err}`);
// 	}
// };

exports.getUserSkills = async (req, res) => {
	try {
		const userSkills = await knex("users")
			.innerJoin("userskills", "users.user_id", "=", "userskills.user_id")
			.select("userskills.skill", "userskills.offer")
			.where("users.user_id", req.params.id);
		res.json(userSkills);
	} catch (err) {
		console.error(err);
		res.status(400).send(`Error finding item ${req.params.id} ${err}`);
	}
};

