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


// exports.getUserSkills = async (req, res) => {
// 	try {
// 	  const userSkills = await knex('users')
// 	  .innerJoin('userskills', 'users.user_id', '=', 'userskills.user_id')
// 		.select('userskills.skill', 'userskills.offer')
// 		.where('users.user_id', req.params.id);
// 	  res.json(userSkills);
// 	} catch (err) {
// 	  console.error(err);
// 	  res.status(400).send(`Error finding item ${req.params.id} ${err}`);
// 	}
//   };