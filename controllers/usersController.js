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

// Login a user
exports.login = async (req, res) => {
	// Extract email from request body
	const email = req.body.email;

	try {
		// Find user who logged in
		const foundUser = await getUser(whereClause(email), joinClause);

		// If user not found, return 404 error
		if (!foundUser) {
			return res.status(404).send(`Credentials Wrong`);
		}

		// Check password against user inputed password
		const pwCheck = await comparePasswords(
			req.body.password,
			foundUser.password
		);

		// If password incorrect, return 404 error
		if (!pwCheck) {
			return res.status(404).send(`Credentials Wrong`);
		}

		// Create token and send it to the client along with the user
		const token = createJWT(foundUser.user.email);
		return res.status(200).json({ token, user: foundUser.user });
	} catch (err) {
		// If an error occurs, return 400 error
		return res.status(400).send(`Error logging in`);
	}
};

/**
 * Verify user from browser token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.verifyUser = async (req, res) => {
	// Get token from request headers
	const token = req.headers.authorization;

	if (token) {
		// Split token to remove "bearer" and get info from token values
		const splitToken = token.split(" ")[1];
		const info = getInfoFromToken(splitToken);

		// If info returns an error, return 401
		if (info.error) {
			return res.status(401).json({ error: "token error" });
		}

		// Make sure token is not expired
		const currentTimestamp = Math.floor(Date.now() / 1000); // Get the current timestamp in seconds
		if (info.exp && info.exp < currentTimestamp) {
			// The token has expired, return 401
			return res.status(401).json({ error: "token error" });
		}

		// Store email from token then retrieve user info if all is valid
		const email = info.email;

		// Throw error if invalid token
		if (!email) {
			return res.status(401).json({ error: "token error" });
		}

		try {
			// Get user and userskills from database from token email
			const foundUser = await getUser(whereClause(email), joinClause);
			// If no found user, return 200 and 'token error' else return found user info
			if (foundUser.length === 0) {
				console.log('oh no')
				return res.status(400).send("token error");
			} else {
				// Return user info to frontend with a 200 status code
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
	// Check token sent in header to make sure user authorized
	const token = req.headers.authorization;
	// Split token to remove bearer
	const splitToken = token.split(" ")[1];
	// Decode token to get email
	const info = getInfoFromToken(splitToken);

	// If info returns an error, return 401
	if (info.error) {
		return res.status(401).json({ error: info.error });
	}

	try {
		// Get user and userskills from database from token email
		const foundUser = await getUser(whereClause(info.email), joinClause);

		if (foundUser.length === 0) {
			// If no user found, return 404 error
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
			//select all skills and offers from userskills table labeled as barters
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

		// Return neighbors and their associated skills and offers
		return res.status(200).json({ neighbors: neighbors });
	} catch (err) {
		// If something goes wrong, return 404 error
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
	// Check if email exists in database
	try {
		const foundUser = await knex("users").where(whereClause(req.body.email));

		//if no found user, return status 200 and message (200 so error doesn't stop request)
		if (!foundUser || foundUser.length === 0) {
			return res.status(200).send(`No user found with email ${req.body.email}`);

			// If email in use, send 202 status and message (202 so error doesn't stop request)
		} else {
			return res.status(202).send(`User found with email ${req.body.email}`);
		}
	} catch (err) {
		// If error occurs, send 400 status and error message
		return res.status(400).send(`Error confirming user ${err}`);
	}
};

/**
 * Creates a new user and adds them to the database
 * @param {Object} req - The HTTP request object containing user data
 * @param {Object} res - The HTTP response object
 * @returns {Object} The HTTP response object containing a JSON Web Token and the user's ID
 */
exports.newUser = async (req, res) => {
	// Confirm password meets requirements
	if (req.body.password.length < 8 || !passwordRegex.test(req.body.password)) {
		return res.status(404)
			.send(`Password must be at least 8 characters and contain 
				at least one uppercase letter, one lowercase letter, one 
				number and one special character`);
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
		return res.status(200).json({ token: token, userId: req.body.user_id });
	} catch (err) {
		console.error(err);
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
	// Get the user's email from the request body.
	const userEmail = req.body.email;

	// Get the user data to update from the request body.
	const updateData = userData(req);

	try {
		// Update the user based on the email and update data.
		await updateUser(whereClause(userEmail), updateData);
		// Get the updated user with additional data from the join clause.
		const editedUser = await getUser(whereClause(userEmail), joinClause);
		// Send the edited user object in the response.
		return res.json(editedUser.user);
	} catch (err) {
		// If there was an error, return a 400 status code with an error message.
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
	// If no file was uploaded, just return
	if (!req.file) {
		return;
	}

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

exports.deleteUser = async (req, res) => {
	const userEmail = req.body.email;
	const userId = req.body.userId;
	const userPassword = req.body.password;

	//retrieve user's password from the database
	const userDbPassword = await getUserPassword(whereClause(userEmail));

	// Check password against user inputed password
	const pwCheck = await comparePasswords(
		userPassword,
		userDbPassword.password
	);

	// If password incorrect, return 404 error
	if (!pwCheck) {
		//return 400 if password incorrect
		return res.status(400).send(`Credentials Wrong`);
	}

	//confirm received userId matches database userId
	if (userId !== userDbPassword.user_id) {
		//return 401 if userId does not match
		return res.status(401).send(`Credentials Wrong`);
	}

	try {
		// Delete the user from the database
		const result = await knex("users").where(whereClause(userEmail)).del();

		// If the delete was successful, return a success message
		return res.status(200).json({ message: "User deleted successfully" });
	} catch (err) {
		// return res.status(500).json({ error: err.message });
		return res.status(500).json({ error: "Unable to delete user" });
	}
};
