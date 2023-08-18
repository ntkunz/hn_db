const knex = require("knex")(require("../knexfile"));

exports.newUser = async (req, res) => {
	const skillsArray = req.body.skills;

	// Map skillsArray to decipher offer from desire
	const userSkills = skillsArray.map((skill) => ({
		user_id: req.body.user_id,
		skill: skill.skill,
		offer: skill.offer,
	}));

	try {
		await knex("userskills").insert(userSkills);
		return res.status(200).send("User skills added");
	} catch (err) {
		return res.status(400).send(`Error adding new user skills: ${err}`);
	}
};

exports.removeSkills = async (req, res) => {
	try {
		await knex("userskills").where("user_id", req.params.id).del();
		return res.status(200).send("User skills removed");
	} catch (err) {
		console.log("Error deleting userskills", err);
		return res.status(400).send(`Error removing user skills`);
	}
};
