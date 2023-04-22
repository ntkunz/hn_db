const knex = require("knex")(require("../knexfile"));

//get a user's skills	
exports.index = (_req, res) => {
	knex("userskills")
		.then((data) => {
			res.status(200).json(data);
		})
		.catch((err) =>
			res.status(400).send(`Error retrieving users: ${err}`)
		);
};

//add new user's skills to userskills table
exports.newUser = async (req, res) => {
	try {
		await knex("userskills").insert({
			user_id: req.body.user_id,
			skill: req.body.skill,
			offer: req.body.offer,
		});
		res.status(200).send("User skills added");
	} catch (err) {
		res.status(400).send(`Error adding new user skills ${err}`);
	}
};

//remove a user's skills from userskills table
exports.removeSkills = async (req, res) => {
	try {
		await knex("userskills").where("user_id", req.params.id).del();
		res.status(200).send("User skills removed");
	} catch (err) {
		res.status(400).send(`Error removing user skills ${err}`);
	}
}










