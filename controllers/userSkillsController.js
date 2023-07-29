const knex = require("knex")(require("../knexfile"));

/**
 * Inserts a new or edited user's skills into the database
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @returns {Object} The HTTP response object
 */
exports.newUser = async (req, res) => {
	const skillsArray = req.body.skills;

	// Map each skill, desire, and user_id
	const userSkills = skillsArray.map((skill) => ({
		user_id: req.body.userId,
		skill: skill.skill,
		offer: skill.offer,
	}));

	try {
		await knex("userskills").insert(userSkills);
		return res.status(200).send("User skills added");
	} catch (err) {
		console.log("error adding new user skills: ", err);
		return res.status(400).send(`Error adding new user skills`);
	}
};

/**
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 * @returns {Object} - The HTTP response with a status code and message
 */
exports.removeSkills = async (req, res) => {
	try {
		await knex("userskills").where("user_id", req.params.id).del();
		return res.status(200).send("User skills removed");
	} catch (err) {
		console.log("Error removing user skills: ", err);
		return res.status(400).send(`Error removing user skills`);
	}
};
