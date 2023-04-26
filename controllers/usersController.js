const knex = require("knex")(require("../knexfile"));

//return user who logged in and all neighbors and skills for those neighbors
exports.index = async (req, res) => {
	try {
		//find user who logged in
		const foundUser = await knex("users").where({ email: req.body.email });
		if (foundUser) {
			//if found user, find all neighbors within 1/2 km as neighbors
			const neighbors = await knex("users")
				//join userskills table and users table on user_id
				.join("userskills", "users.user_id", "=", "userskills.user_id")
				//select all columns from users table and select all skills and offers from userskills table labeled as barters
				.select(
					"users.user_id",
					"users.about",
					"users.email",
					"users.first_name",
					"users.last_name",
					"users.location",
					"users.image_url",
					"users.status",
					"users.home",
					"users.city",
					"users.province",
					"users.address"
				)
				.select(
					knex.raw(
						"JSON_OBJECTAGG(userskills.skill, userskills.offer) as barters"
					)
				)
				.whereRaw(
					"st_distance_sphere(st_geomfromtext(st_aswkt(location), 0), st_geomfromtext('POINT(" +
						foundUser[0].location.x +
						" " +
						foundUser[0].location.y +
						")', 0)) < 500"
				)
				.groupBy("users.user_id");
			res.status(200).json(neighbors);
		}
	} catch (err) {
		console.error(err);
		res.status(400).send(`Error getting user ${err}`);
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
			location: knex.raw("POINT(?, ?)", [
				req.body.coords[0],
				req.body.coords[1],
			]),
			password: req.body.password,
			image_url: req.body.image_url,
			status: req.body.status,
			home: req.body.home,
			city: req.body.city,
			province: req.body.province,
			address: req.body.address,
		});
		const newUser = await knex("users")
			.where("user_id", req.body.user_id)
			.first();
		res.json(newUser);
	} catch (err) {
		console.error(err);
		res.status(400).send(`Error adding new user ${err}`);
	}
};

//edit a user's information
exports.editUser = async (req, res) => {
	try {
		await knex("users")
			.where("user_id", req.body.user_id)
			.first()
			.update({
				user_id: req.body.user_id,
				about: req.body.about,
				email: req.body.email,
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				location: knex.raw("POINT(?, ?)", [
					req.body.coords[0],
					req.body.coords[1],
				]),
				password: req.body.password,
				image_url: req.body.image_url,
				status: req.body.status,
				home: req.body.home,
				city: req.body.city,
				province: req.body.province,
				address: req.body.address,
			});
		const editedUser = await knex("users")
			.where("user_id", req.body.user_id)
			.first();
		res.json(editedUser);
	} catch (err) {
		console.error(err);
		res.status(400).send(`Error editing user ${err}`);
	}
};

exports.addImage = async (req, res) => {
	const imageData = req.body.imageData; // Extract the image data from the request body
	try {
		await knex("users")
			.where("user_id", req.body.user_id)
			.update({ image_url: req.file.filename }); // Insert the image data into the database using Knex
		res.status(200).json({ message: "Image uploaded successfully" }); // Send a success response back to the client
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message }); // Send an error response back to the client
	}
};
