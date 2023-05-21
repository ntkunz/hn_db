const knex = require("knex")(require("../knexfile"));
const bcrypt = require("bcryptjs");

let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//return user who logged in and all neighbors and skills for those neighbors
exports.index = async (req, res) => {
	// const whereClause = { email: req.body.email };
	const whereClause = { email: req.body.email };
	const joinClause = {
		table: "userskills",
		joinCondition: function () {
			this.on("users.user_id", "=", "userskills.user_id");
		},
	};
	try {
		//find user who logged in
		const foundUser = await knex("users").where(whereClause);

		if (foundUser.length === 0) {
			// Do not return 404, because that would leak information about whether a given email is registered or not.
			return res.status(404).send(`Credentials Wrong`);
		} 
			//if found user, find all neighbors within 1/2 km as neighbors
			const neighbors = await knex("users")
				.join(joinClause.table, joinClause.joinCondition)
				//select all columns from users table and select all skills and offers from userskills table labeled as barters

			//============NEED TO UPDATE THIS QUERY BELOW THIS LINE TO TAKE VARIABLES AS OPPOSED TO HARD CODED VALUES================

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
					"users.address",
					"users.created_at"
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
		
	} catch (err) {
		return res.status(404).send(`Error getting user ${err}`);
	}
};

exports.newEmail = async (req, res) => {
	//check if email exists in database
	const whereClause = { email: req.body.email };
	try {
		const foundUser = await knex("users").where(whereClause);
		//if email not in use, send 200 status, if email in use, send 202 status
		if (foundUser.length === 0) {
			return res.status(200).send(`No user found with email ${req.body.email}`);
		} else {
			return res.status(202).send(`User found with email ${req.body.email}`);
		}
	} catch (err) {
		return res.status(400).send(`Error confirming user ${err}`);
	}
};

//create a new user
exports.newUser = async (req, res) => {

	// Confirm passwords match
	if (req.body.password !== req.body.passwordConfirm) {
		return res.status(404).send(`Passwords do not match`);
	}

	// Confirm password meets requirements
	if (req.body.password.length < 8 || !regex.test(req.body.password)) {
		return res.status(404).send(`Password must be at least 8 characters and contain 
		at least one uppercase letter, one lowercase letter, one number and one special character`);
	}

	const newUserData = {
		user_id: req.body.user_id,
		about: req.body.about,
		email: req.body.email,
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		location: knex.raw("POINT(?, ?)", [req.body.coords[0], req.body.coords[1]]),
		// password: hashedPassword,
		password: req.body.password,
		image_url: req.body.image_url,
		status: req.body.status,
		home: req.body.home,
		city: req.body.city,
		province: req.body.province,
		address: req.body.address,
	};

	//CAN CHECK HERE IF USER EXISTS... INSTEAD OF EARLIER IN THE FUNCTION, THOUGH IT WILL 
	// STILL CALL THE LOCATION API UNNECESSARILY BEFORE THIS STEP IF I DO IT HERE AND IT FAILS

	try {
		await knex("users").insert(newUserData);

		const whereClause = { email: req.body.email};
		const newUser = await knex("users").where(whereClause).first();
		
		// const pwCheck = await bcrypt.compareSync(req.body.password, newUser.password)

		// console.log('new user: ',newUser)
		res.json(newUser);
	} catch (err) {
		console.error(err);
		return res.status(400).send(`Error adding new user ${err}`);
	}
};

//edit a user's information
exports.editUser = async (req, res) => {

	const whereClause = { user_id: req.body.user_id };
	const updateData = {
		user_id: req.body.user_id,
		about: req.body.about,
		email: req.body.email,
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		location: knex.raw("POINT(?, ?)", [req.body.coords[0], req.body.coords[1]]),
		password: req.body.password,
		image_url: req.body.image_url,
		status: req.body.status,
		home: req.body.home,
		city: req.body.city,
		province: req.body.province,
		address: req.body.address,
	};

	try {
		await knex("users").where(whereClause).first().update(updateData);
		const editedUser = await knex("users")
			.where("user_id", req.body.user_id)
			.first();
		res.json(editedUser);
	} catch (err) {
		console.error(err);
		return res.status(400).send(`Error editing user ${err}`);
	}
};

exports.addImage = async (req, res) => {
	//match user_id to user_id in database
	const whereClause = { user_id: req.body.user_id };
	//create object with image_url for update
	const updateData = { image_url: req.file.filename };
	try {
		await knex("users").where(whereClause).update(updateData); // Insert the image data into the database
		res.status(200).json({ message: "Image uploaded successfully" }); // Send a success response back to the client
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message }); // Send an error response back to the client if unsuccessful
	}
};
