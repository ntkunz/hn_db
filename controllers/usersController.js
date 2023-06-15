const knex = require("knex")(require("../knexfile"));

const {
	createJWT,
	comparePasswords,
	hashPassword,
	getInfoFromToken,
} = require("../modules/auth");

const {
	updateUser,
	getUser,
	whereClause,
	joinClause,
	userData,
} = require("../modules/userService");

let emailRregex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

//NEED TO CREATE A LOGIN ROUTE TO LOG IN A USER, WHICH WOULD BE DONE WITH EMAIL AND PASSWORD
//AND INCLUDE PASSWORD VERIFICATION AND SEND BACK A NEW TOKEN

//THEN NEED TO UPDATE .index TO ONLY REQUIRE EMAIL FROM THE TOKEN THAT IS SET IN LOGIN

//function that gets all neighbors and skills for those neighbors
exports.getNeighbors = async (req, res) => {
	//check token sent in header to make sure user authorized
	const token = req.headers.authorization;
	// split token to remove bearer
	const splitToken = token.split(" ")[1];
	//decode token to get email
	const info = getInfoFromToken(splitToken);

	//if info returns an error, return 401
	if (info.error) {
		return res.status(401).json({ error: info.error });
	}

	const whereClause = { email: info.email };
	const joinClause = {
		table: "userskills",
		joinCondition: function () {
			this.on("users.user_id", "=", "userskills.user_id");
		},
	};
	try {
		//find user who logged in
		const foundUser = await knex("users")
			.where(whereClause)
			.join(joinClause.table, joinClause.joinCondition)
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
			.groupBy("users.user_id");

		//if no user found, return error
		if (foundUser.length === 0) {
			return res.status(404).send(`No user found with email ${email}`);
		}
		//if found user, find all neighbors within 1/2 km as neighbors
		const neighbors = await knex("users")
			.join(joinClause.table, joinClause.joinCondition)
			.whereNot("users.user_id", foundUser[0].user_id)
			//select all columns from users table and select all skills and offers from userskills table labeled as barters
			.select(
				"users.user_id",
				"users.about",
				// "users.email",
				"users.first_name",
				// "users.last_name",
				// "users.location",
				"users.image_url",
				"users.status",
				// "users.home",
				// "users.city",
				// "users.province",
				// "users.address",
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
		res.status(200).json({ neighbors: neighbors });
	} catch (err) {
		console.log("1 something went wrong!", err);
		return res.status(404).send(`Error getting user ${err}`);
	}
};

//function that check that a new email is not already in use
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

//verify user from browser token
exports.verifyUser = async (req, res) => {
	const token = req.headers.authorization;

	if (token) {
		// split token to remove bearer
		const splitToken = token.split(" ")[1];
		//get the information from the token
		const info = getInfoFromToken(splitToken);
		//if info returns an error, return 401
		if (info.error) {
			return res.status(401).json({ error: info.error });
		}

		//make sure token is not expired
		const currentTimestamp = Math.floor(Date.now() / 1000); // Get the current timestamp in seconds
		if (info.exp && info.exp < currentTimestamp) {
			// The token has expired, return 401
			return res.status(401).json({ error: "Token expired" });
		}

		const loggedInUserEmail = info.email;
		//login the user based on the email

		//throw error if invalid token
		if (!loggedInUserEmail) {
			return res.status(401).json({ error: "Invalid token" });
		}
		const whereClause = { email: loggedInUserEmail };
		//join userskills table to users table
		const joinClause = {
			table: "userskills",
			joinCondition: function () {
				this.on("users.user_id", "=", "userskills.user_id");
			},
		};

		try {
			//get user and userskills from database from token email
			const foundUser = await knex("users")
				.where(whereClause)
				.join(joinClause.table, joinClause.joinCondition)
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
				.groupBy("users.user_id");
			//if email not in use, send 200 status, if email in use, send 202 status
			if (foundUser.length === 0) {
				return res
					.status(200)
					.send(`No user found with email ${req.body.email}`);
			} else {
				//remove password from user object
				const { password, ...userWithoutPassword } = foundUser;
				//returning the found user may be the error here
				res.json(userWithoutPassword);
			}
		} catch (err) {
			return res.status(400).send(`Error confirming user ${err}`);
		}
	}
};

// Edit a user's information
exports.editUser = async (req, res) => {
	const userEmail = req.body.email;
	const updateData = userData(req);

	try {
		await updateUser(whereClause(userEmail), updateData);
		const editedUser = await getUser(whereClause(userEmail), joinClause);
		res.json(editedUser.user);
	} catch (err) {
		// console.error(err);
		return res.status(400).send(`Error editing user`);
	}
};

// Login a user
exports.login = async (req, res) => {
	const email = req.body.email;

	try {
		// Find user who logged in
		const foundUser = await getUser(whereClause(email), joinClause);
		if (!foundUser) {
			return res.status(404).send(`Credentials Wrong`);
		}
		// Check password against user inputed password
		const pwCheck = await comparePasswords(
			req.body.password,
			foundUser.password
		);
		if (!pwCheck) {
			return res.status(404).send(`Credentials Wrong`);
		}

		// Create token and send it to the client along with the user
		const token = createJWT(foundUser.user.email);
		res.status(200).json({ token, user: foundUser.user });
	} catch (err) {
		console.error(err);
		return res.status(400).send(`Error logging in`);
	}
};

//create a new user
exports.newUser = async (req, res) => {
	// Confirm password meets requirements
	if (req.body.password.length < 8 || !passwordRegex.test(req.body.password)) {
		return res.status(404)
			.send(`Password must be at least 8 characters and contain 
		at least one uppercase letter, one lowercase letter, one number and one special character`);
	}

	const hashedPassword = await hashPassword(req.body.password);

	const newUserData = {
		user_id: req.body.user_id,
		about: req.body.about,
		email: req.body.email,
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		location: knex.raw("POINT(?, ?)", [req.body.coords[0], req.body.coords[1]]),
		password: hashedPassword,
		image_url: req.body.image_url,
		status: req.body.status,
		home: req.body.home,
		city: req.body.city,
		province: req.body.province,
		address: req.body.address,
	};

	try {
		await knex("users").insert(newUserData);
		// Create and assign a token
		const token = createJWT(req.body.email);
		// return user and auth token with user_id to client
		// res.status(200).json({ token: token, user: newUser });
		res.status(200).json({ token: token, userId: req.body.user_id });
		// res.status(200).json({ token: token, user: newUser});
	} catch (err) {
		console.error(err);
		return res.status(400).send(`Error adding new user ${err}`);
	}
};

/**
 * Add an image to a user's profile
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @returns {Object} The HTTP response object
 */
exports.addImage = async (req, res) => {
	// Extract the user_id and image_url from the request body and file
	const { user_id } = req.body;
	const image_url = req.file.filename;
	try {
		// Update the user's image_url in the database
		const result = await knex("users").where({ user_id }).update({ image_url });
		// If no user was found, return a 404 error
		if (result.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}
		// If the update was successful, return a success message
		return res.status(200).json({ message: "Image uploaded successfully" });
	} catch (err) {
		// If an error occurred, log it and return a 500 error with the error message
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};
