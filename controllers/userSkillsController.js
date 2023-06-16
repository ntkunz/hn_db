const knex = require("knex")(require("../knexfile"));

/**
 * Inserts a new user and their skills into the database
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @returns {Object} The HTTP response object
 */
exports.newUser = async (req, res) => {
	// Get the array of skills from the request body
	const skillsArray = req.body.skills;

	// Map each skill, desire, and user_id
	const userSkills = skillsArray.map((skill) => ({
		user_id: req.body.user_id,
		skill: skill.skill,
		offer: skill.offer,
	}));

	try {
		// Insert the user skills into the database
		await knex("userskills").insert(userSkills);
		//return a successful HTTP response with a 200 status code
		return res.status(200).send("User skills added");
	} catch (err) {
		// Return an error message if there was a problem inserting the user skills
		return res.status(400).send(`Error adding new user skills: ${err}`);
	}
};

/**
 * Remove a user's skills from the userskills table
 *
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @returns {Object} - The HTTP response with a status code and message
 */
exports.removeSkills = async (req, res) => {
	try {
		// Delete all rows from the userskills table where the user_id matches the id in the request parameters
		await knex("userskills").where("user_id", req.params.id).del();
		// Return a successful HTTP response with a 200 status code and message
		return res.status(200).send("User skills removed");
	} catch (err) {
		// Return an HTTP response with a 400 status code and error message if there was an error deleting the rows
		return res.status(400).send(`Error removing user skills ${err}`);
	}
};
