const knex = require("knex")(require("../knexfile"));

//get all messages from two users	
exports.index = async (req, res) => {
	try {
		// console.log(req.body.email)
		const foundMessages = await knex("messages")
        .where({ sender_id: req.body.senderId, receiver_id: req.body.receiverId })
        .orWhere({ sender_id: req.body.receiverId, receiver_id: req.body.senderId })
		if (foundMessages) {
			// console.log(foundMessages);
			res.status(200).json(foundMessages);
		}
	} catch (err) {
		console.error(err);
		res.status(400).send(`Error getting messages ${err}`);
	}
} 

//add new message to messages table
exports.newMessage = async (req, res) => {
	try {
		const newMessage = await knex("messages").insert({
			user_id: req.body.user_id,
			other_id: req.body.other_id,
			message: req.body.message,
		});
		res.status(200).send(newMessage);
	} catch (err) {
		res.status(400).send(`Error adding new message ${err}`);
	}
};


