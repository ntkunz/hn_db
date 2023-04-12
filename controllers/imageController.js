const knex = require("knex")(require("../knexfile"));

//get all messages from two users	
exports.index = async (req, res) => {
	try {
		console.log(req.body)
		// const foundMessages = await knex("messages")
        // .where({ sender_id: req.body.senderId, receiver_id: req.body.receiverId })
        // .orWhere({ sender_id: req.body.receiverId, receiver_id: req.body.senderId })
		// if (foundMessages) {
		// 	// console.log(foundMessages);
		// 	res.status(200).json(foundMessages);
		// }
	} catch (err) {
		console.error(err);
		res.status(400).send(`Error getting messages ${err}`);
	}
} 