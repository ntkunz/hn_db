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
	getUserPassword,
} = require("../modules/userService");

let emailRregex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

exports.login = async (req, res) => {
	console.log("req.body: ", req.body);
	const email = req.body.email;
	console.log("req.body.email: ", email);

	try {
		// const foundUser = await getUser(whereClause(email), joinClause);
		const foundUser = await getUser(email, joinClause);
		console.log("foundUser: ", foundUser);
		if (!foundUser || foundUser.length === 0) {
			console.log("No user found during login");
			return res.status(404).send(`Credentials Wrong`);
		}
		console.log("req.body.password: ", req.body.password);
		const pwCheck = await comparePasswords(
			req.body.password,
			foundUser.password
		);

		if (!pwCheck) {
			console.log("Password failed check at login");
			return res.status(404).send(`Credentials Wrong`);
		}

		const token = createJWT(foundUser.user.email);
		return res.status(200).json({ token, user: foundUser.user });
	} catch (err) {
		console.log(err);
		return res.status(400).send(`Error logging in`);
	}
};

/**
 * Verify user from browser token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.verifyUser = async (req, res) => {
	const token = req.headers.authorization;

	if (token) {
		// Split token to remove "bearer" and get info from token values
		const splitToken = token.split(" ")[1];
		const info = getInfoFromToken(splitToken);

		if (info.error) {
			return res.status(401).json({ error: "token error" });
		}

		// Check token is not expired
		const currentTimestamp = Math.floor(Date.now() / 1000); // Get the current timestamp in seconds
		if (info.exp && info.exp < currentTimestamp) {
			return res.status(401).json({ error: "token error" });
		}

		const email = info.email;

		if (!email) {
			return res.status(401).json({ error: "token error" });
		}

		try {
			const foundUser = await getUser(whereClause(email), joinClause);
			if (foundUser.length === 0) {
				return res.status(400).send("token error");
			} else {
				return res.status(200).json(foundUser.user);
			}
		} catch (err) {
			return res.status(400).json({ error: "token error" });
		}
	}
};

/**
 * Get all neighbors within 1/2 km and their associated skills and offers
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @return {Object} JSON object containing neighbors and their associated skills and offers
 */
exports.getNeighbors = async (req, res) => {
	const token = req.headers.authorization;
	// Split token to remove bearer
	const splitToken = token.split(" ")[1];
	// Decode token to get email
	const info = getInfoFromToken(splitToken);

	if (info.error) {
		return res.status(401).json({ error: info.error });
	}

	try {
		// Get user and userskills from database from token email
		const foundUser = await getUser(whereClause(info.email), joinClause);

		if (foundUser.length === 0) {
			return res.status(404).send(`No user found with email ${email}`);
		}

		// If found user, find all neighbors within 1/2 km as neighbors
		const neighbors = await knex("users")
			.join(joinClause.table, joinClause.joinCondition)
			.whereNot("users.user_id", foundUser.user.user_id)
			// Select only necessary columns from users table
			.select(
				"users.user_id",
				"users.about",
				"users.first_name",
				"users.image_url",
				"users.status",
				"users.created_at"
			)
			//select all skills and offers from userskills table
			.select(
				knex.raw(
					"JSON_OBJECTAGG(userskills.skill, userskills.offer) as barters"
				)
			)
			//where the location is within 1/2 km of the found user
			.whereRaw(
				"st_distance_sphere(st_geomfromtext(st_aswkt(location), 0), st_geomfromtext('POINT(" +
					foundUser.user.location.x +
					" " +
					foundUser.user.location.y +
					")', 0)) < 500"
			)
			.groupBy("users.user_id");

		return res.status(200).json({ neighbors: neighbors });
	} catch (err) {
		console.log("error getting neighbors");
		return res.status(404).send(`Error getting user ${err}`);
	}
};

/**
 * Checks if a new email is already in use by searching for it in the database.
 * If the email is not in use, returns a 200 status and a message indicating that no user was found.
 * If the email is already in use, returns a 202 status and a message indicating that a user was found.
 * If an error occurs during the search, returns a 400 status and an error message.
 * @param {Object} req - The request object containing the email to be checked in the body.
 * @param {Object} res - The response object to be returned.
 * @returns {Object} - The response object with the appropriate status and message.
 */
exports.newEmail = async (req, res) => {
	try {
		const foundUser = await knex("users").where(whereClause(req.body.email));

		if (!foundUser || foundUser.length === 0) {
			return res.status(200).send(`No user found with email ${req.body.email}`);
		} else {
			return res.status(202).send(`User found with email ${req.body.email}`);
		}
	} catch (err) {
		console.log("error checking for new email", err);
		return res.status(400).send(`Error confirming user ${err}`);
	}
};

/**
 * Creates a new user after validating input and adds them to the database
 * @param {Object} req - The HTTP request object containing user data	// Check if email exists in database
 * @param {Object} res - The HTTP response object
 * @returns {Object} The HTTP response object containing a JSON Web Token and the user's ID
 */
exports.newUser = async (req, res) => {
	if (req.body.password.length < 8 || !passwordRegex.test(req.body.password)) {
		return res.status(404)
			.send(`Password must be at least 8 characters and contain 
				at least one uppercase letter, one lowercase letter, one 
				number and one special character`);
	}

	const hashedPassword = await hashPassword(req.body.password);

	const newUserData = {
		user_id: req.body.userId,
		about: req.body.about,
		email: req.body.email,
		first_name: req.body.firstName,
		last_name: req.body.lastName,
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
		// Create and assign a new token
		const token = createJWT(req.body.email);
		// return user and auth token with user_id to client
		return res.status(200).json({ token: token, userId: req.body.user_id });
	} catch (err) {
		console.error(err);
		console.log("error adding new user", err);
		return res.status(400).send(`Error adding new user ${err}`);
	}
};

/**
 * Edit a user's information
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} Returns the edited user object.
 */
exports.editUser = async (req, res) => {
	const userEmail = req.body.email;

	//format req to be sent to database
	const updateData = userData(req);

	try {
		await updateUser(whereClause(userEmail), updateData);
		const editedUser = await getUser(whereClause(userEmail), joinClause);
		return res.json(editedUser.user);
	} catch (err) {
		console.log("error editing user", err);
		return res.status(400).send(`Error editing user` + err);
	}
};

/**
 * Add an image to a user's profile
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @returns {Object} The HTTP response object
 */
exports.addImage = async (req, res) => {
	// If no file was uploaded, do nothing.
	if (!req.file) {
		return;
	}

	const { user_id } = req.body;
	const image_url = req.file.filename;

	try {
		const result = await knex("users").where({ user_id }).update({ image_url });
		if (result.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}
		return res.status(200).json({ message: "Image uploaded successfully" });
	} catch (err) {
		console.error("error adding image: ", err);
		return res.status(500).json({ error: err.message });
	}
};

exports.deleteUser = async (req, res) => {
	const userEmail = req.body.email;
	const userId = req.body.userId;
	const userPassword = req.body.password;

	const userDbPassword = await getUserPassword(whereClause(userEmail));

	const pwCheck = await comparePasswords(userPassword, userDbPassword.password);

	if (!pwCheck) {
		return res.status(400).send(`Credentials Wrong`);
	}

	if (userId !== userDbPassword.user_id) {
		return res.status(401).send(`Credentials Wrong`);
	}

	try {
		await knex("users").where(whereClause(userEmail)).del();
		return res.status(200).json({ message: "User deleted successfully" });
	} catch (err) {
		console.log("error deleting user", err);
		return res.status(401).json({ error: "Unable to delete user" });
	}
};

exports.wakeup = async (_req, res) => {
	try {
		return res.status(200).json({ message: "Waking up" });
	} catch (err) {
		console.error(err);
		console.log("error waking up", err);
		return res.send("error waking up the server");
	}
};
