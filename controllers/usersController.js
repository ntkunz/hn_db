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

		//THIS WORKS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!	
		const neighbors = await knex("users")
		// .fromRaw("users where st_distance_sphere(st_geomfromtext(st_aswkt(location), 0), st_geomfromtext('POINT("+req.body.x+" "+req.body.y+")', 0)) < 100;")
		.fromRaw("users where st_distance_sphere(st_geomfromtext(st_aswkt(location), 0), st_geomfromtext('POINT("+req.body.userLocation.x+" "+req.body.userLocation.y+")', 0)) < 500;")
		if (neighbors) {
			// console.log(neighbors);
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
			// maybe change out this where query with getNeighbors query?!
			//and remove user_id query, to return all skills within 1/2 km of user
			.where("users.user_id", req.params.id);
		res.json(userSkills);
	} catch (err) {
		console.error(err);
		res.status(400).send(`Error finding item ${req.params.id} ${err}`);
	}
};

//create a new user
exports.newUser = async (req, res) => {
	try {
		await knex("users").insert({
			user_id: req.body.user_id,
			about: req.body.about,
			email: req.body.email,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			location: knex.raw('POINT(?, ?)', [req.body.coords[0], req.body.coords[1]]),
			password: req.body.password,
			image_url: req.body.image_url,
			status: req.body.status,
			home: req.body.home,
			city: req.body.city,
			province: req.body.province,
			address: req.body.address,
		});
		const newUser = await knex("users").where("user_id", req.body.user_id).first();
		res.json(newUser);
	} catch (err) {
		console.error(err);
		res.status(400).send(`Error adding new user ${err}`);
	}
}

//edit a user's information
exports.editUser = async (req, res) => {
	try {
		await knex("users").where("user_id", req.body.user_id).first().update({
			user_id: req.body.user_id,
			about: req.body.about,
			email: req.body.email,
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			location: knex.raw('POINT(?, ?)', [req.body.coords[0], req.body.coords[1]]),
			password: req.body.password,
			image_url: req.body.image_url,
			status: req.body.status,
			home: req.body.home,
			city: req.body.city,
			province: req.body.province,
			address: req.body.address,
		})
		const editedUser = await knex("users").where("user_id", req.body.user_id).first();
		res.json(editedUser);
	} catch (err) {
		console.error(err);
		res.status(400).send(`Error editing user ${err}`);
	}
}

exports.addImage = async (req, res) => {
	const imageData = req.body.imageData; // Extract the image data from the request body
	try {
	  await knex("users").where("user_id", req.body.user_id).update({ image_url: req.file.filename }); // Insert the image data into the database using Knex
	  res.status(200).json({ message: 'Image uploaded successfully' }); // Send a success response back to the client
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message }); // Send an error response back to the client
	}
};