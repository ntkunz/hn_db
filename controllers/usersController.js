const knex = require("knex")(require("../knexfile"));

const {
	createJWT,
	comparePasswords,
	hashPassword,
	getInfoFromToken,
} = require("../modules/auth");

// TODO : Remake getUser and joinClause modules as one module
// old getUser and joinClause modules currently disabled

const {
	updateUser,
	// getUser,
	whereClause,
	// joinClause,
	userData,
	getUserPassword,
} = require("../modules/userService");

// TODO : Use JS to validate password and email rather than regex, or yup validation like server V2

let emailRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

exports.login = async (req, res) => {
	const userEmail = req.body.email;

	// TODO : Validate email with javascript utility
	// TODO : Validate password with javascript utility

	// TODO : Replace foundUser below with getUser once updated
	try {
		const foundUser = await knex("users")
			.select(
				"users.user_id",
				"users.about",
				"users.email",
				"users.first_name",
				"users.last_name",
				"users.location",
				"users.image_url",
				"users.status",
				"users.password",
				"users.home",
				"users.city",
				"users.province",
				"users.address",
				"users.created_at"
			)
			.where("users.email", userEmail)
			.first();

		if (!foundUser || foundUser.length === 0) {
			console.log("No user found during login");
			return res.status(401).send(`Credentials Wrong`);
		}

		const passwordValid = await comparePasswords(
			req.body.password,
			foundUser.password
		);
		if (!passwordValid) {
			console.log("Invalid Password");
			return res.status(401).send("Invalid password");
		}

		const loggedInUserSkills = await knex("userskills")
			.select("skill", "offer")
			.where("user_id", foundUser.user_id);

		// add user skills to user and remove password before returning
		foundUser.barters = loggedInUserSkills;
		delete foundUser.password;

		const token = createJWT(foundUser.email);
		return res.status(200).json({ token, user: foundUser });
	} catch (error) {
		console.log("Error logging in user", error);
		return res.status(404).send(`Error logging in`);
	}
};

exports.verifyUser = async (req, res) => {
	const token = req.headers.authorization;

	if (token) {
		const splitToken = token.split(" ")[1];
		const info = getInfoFromToken(splitToken);

		if (info.error) {
			console.log("Error getting info from token", info.error);
			return res.status(401).send("Token error");
		}

		// Check token is not expired
		const currentTimestamp = Math.floor(Date.now() / 1000); // Get the current timestamp in seconds
		if (info.exp && info.exp < currentTimestamp) {
			console.log("token expired");
			return res.status(401).send("Token expired");
		}

		const email = info.email;

		if (!email) {
			return res.status(401).send("Improper token");
		}

		try {
			// TODO : Replace foundUser below with getUser once updated
			const foundUser = await knex("users")
				.select(
					"users.user_id",
					"users.about",
					"users.email",
					"users.first_name",
					"users.last_name",
					"users.location",
					"users.image_url",
					"users.status",
					"users.password",
					"users.home",
					"users.city",
					"users.province",
					"users.address",
					"users.created_at"
				)
				.where("users.email", email)
				.first();

			const loggedInUserSkills = await knex("userskills")
				.select("skill", "offer")
				.where("user_id", foundUser.user_id);

			foundUser.barters = loggedInUserSkills;
			delete foundUser.password;

			return res.status(200).json(foundUser);
		} catch (error) {
			console.log("error validating user", error);
			return res
				.status(401)
				.send("Error logging in from token, please relogin");
		}
	}
};

exports.getNeighbors = async (req, res) => {
	const token = req.headers.authorization;
	const splitToken = token.split(" ")[1];
	const info = getInfoFromToken(splitToken);

	if (info.error) {
		console.log("error getting neighbors from token", info.error);
		return res.status(401).send("Token error");
	}

	try {
		// TODO: JUST SEND LOCATION AND USER ID IN THE REQUEST rather than needing to make another call below =====
		const loggedInUser = await knex("users")
			.select("users.user_id", "users.location")
			.where("users.email", info.email)
			.first();

		// TODO : Handle specific error if unable to get user location and id off of email above
		// if (loggedInUser.length === 0) {
		// 	return res.status(404).send(`No user found with email ${email}`);
		// }

		// If found user, find all neighbors within 1/2 km as neighbors
		const neighbors = await knex("users")
			.join("userskills", function () {
				this.on("users.user_id", "=", "userskills.user_id");
			})
			.select(
				"users.user_id",
				"users.about",
				"users.first_name",
				"users.image_url",
				"users.status",
				"users.created_at"
			)
			.select(
				knex.raw(
					"JSON_OBJECTAGG(userskills.skill, userskills.offer) as barters"
				)
			)
			.whereRaw(
				"st_distance_sphere(st_geomfromtext(st_aswkt(location), 0), st_geomfromtext('POINT(" +
					loggedInUser.location.x +
					" " +
					loggedInUser.location.y +
					")', 0)) < 500"
			)
			.groupBy("users.user_id");

			const sortedNeighbors = neighbors.sort((a, b) => {
				if (a.user_id === loggedInUser.user_id) {
					return -1; // a comes before b
				} else if (b.user_id === loggedInUser.user_id) {
					return 1; // b comes before a
				} else {
					return 0; // maintain the original order
				}
			});
		return res.status(200).json({ neighbors: sortedNeighbors });
	} catch (error) {
		console.log("error getting neighbors", error);
		return res.status(404).send(`Error getting neighbors`);
	}
};

/**
 * Checks if a new email is already in use by searching for it in the database.
 * If the email is not in use, returns a 200 status and a message indicating that no user was found.
 * If the email is already in use, returns a 202 status and a message indicating that a user was found.
 * If an error occurs during the search, returns a 400 status and an error message.
 */
exports.newEmail = async (req, res) => {
	try {
		const foundUser = await knex("users").where(whereClause(req.body.email));

		// TODO : Update status codes below, and modify frontend accordingly

		if (!foundUser || foundUser.length === 0) {
			return res.status(200).send(`No user found with email ${req.body.email}`);
		} else {
			return res.status(202).send(`User found with email ${req.body.email}`);
		}
	} catch (error) {
		console.log("error checking for new email", error);
		return res.status(400).send(`Error confirming user email`);
	}
};

exports.newUser = async (req, res) => {
	// TODO : Validate email
	// TODO : Update password validation to use JS (library or not)
	if (req.body.password.length < 8 || !passwordRegex.test(req.body.password)) {
		console.log("New user password invalid");
		return res.status(400)
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
		const token = createJWT(req.body.email);
		return res.status(200).json({ token: token, userId: req.body.userId });
	} catch (error) {
		console.log("error adding new user", error);
		return res.status(400).send(`Error adding new user`);
	}
};

exports.editUser = async (req, res) => {
	const userEmail = req.body.email;

	// Format req to be sent to database with userData module
	const updateData = userData(req);

	try {
		await updateUser(whereClause(userEmail), updateData);

		// TODO : Replace editedUser below with getUser once updated
		const editedUser = await knex("users")
			.select(
				"users.user_id",
				"users.about",
				"users.email",
				"users.first_name",
				"users.last_name",
				"users.location",
				"users.image_url",
				"users.status",
				"users.password",
				"users.home",
				"users.city",
				"users.province",
				"users.address",
				"users.created_at"
			)
			.where("users.email", userEmail)
			.first();

		const editedUserSkills = await knex("userskills")
			.select("skill", "offer")
			.where("user_id", editedUser.user_id);

		editedUser.barters = editedUserSkills;
		delete editedUser.password;

		return res.status(200).json(editedUser);
	} catch (error) {
		console.log("error editing user", error);
		return res.status(400).send(`Error editing user`);
	}
};

exports.addImage = async (req, res) => {
	// If no file was uploaded, do nothing.
	if (!req.file) {
		return res.status(204);
	}

	const { userId } = req.body;
	const image_url = req.file.filename;

	try {
		const result = await knex("users")
			.where("user_id", "=", userId)
			.update({ image_url });
		if (result.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}
		return res.status(200).json({ message: "Image uploaded successfully" });
	} catch (error) {
		console.error("Error adding image: ", error);
		return res.status(400).json({ error: "Error adding image" });
	}
};

exports.deleteUser = async (req, res) => {
	const userEmail = req.body.email;
	const userId = req.body.userId;
	const userPassword = req.body.password;

	const userDbPassword = await getUserPassword(whereClause(userEmail));

	const pwCheck = await comparePasswords(userPassword, userDbPassword.password);

	if (!pwCheck) {
		return res.status(401).send(`Credentials Wrong`);
	}

	if (userId !== userDbPassword.user_id) {
		return res.status(401).send(`Credentials Wrong`);
	}

	try {
		await knex("users").where(whereClause(userEmail)).del();
		return res.status(200).json({ message: "User deleted successfully" });
	} catch (error) {
		console.log("error deleting user", error);
		return res.status(401).json({ error: "Unable to delete user" });
	}
};

exports.wakeup = async (_req, res) => {
	try {
		return res.status(200).json({ message: "Waking up" });
	} catch (error) {
		console.log("error waking up", error);
		return res.status(404).send("Error waking up the server");
	}
};
