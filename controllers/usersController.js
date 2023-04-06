const knex = require("knex")(require("../knexfile"));

exports.index = async (req, res) => {
	try {
		// console.log(req.body.email)
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
// exports.getNeighbors = (_req, res) => {
// 	knex("users")
// 		.then((data) => {
// 			res.status(200).json(data);
// 			// console.log('users retrieved successfully: ', data)
// 		})
// 		.catch((err) =>
// 			res.status(400).send(`Error retrieving users: ${err}`)
// 		);
// };

//how to retrieve local users in mysql command line
// select * from users where st_distance(st_geomfromtext(st_aswkt(location), 0), st_geomfromtext('POINT(-123.11466013373249 49.28510303821817)', 0)) < 0.001;

//working on getting all neighbors based off of logged in user location
exports.getNeighbors = async (req, res) => {
	try {
		console.log(req.body);
		let userLocation = req.body;

		//anther super sql injection prone attempt
		const neighbors = await knex("users")
		// .fromRaw('users where st_distance_sphere(st_geomfromtext(st_aswkt(location), 0), st_geomfromtext("POINT(-123.11466013373249 49.28510303821817)", 0)) < 100;')
		.fromRaw('users where st_distance_sphere(st_geomfromtext(st_aswkt(location), 0), st_geomfromtext(st_aswkt('+userLocation+')), 0)) < 100;')

		if (neighbors) {
			console.log(neighbors);
			res.status(200).json(neighbors);
		}
	} catch (err) {
		console.error(err);
		res.status(400).send(`Error getting neighbors ${err}`);
	}
};

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

