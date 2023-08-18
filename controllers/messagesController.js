const knex = require("knex")(require("../knexfile"));

exports.index = async (req, res) => {
	const senderId = req.body.senderId;
	const receiverId = req.body.receiverId;
	if (senderId == undefined || receiverId == undefined) {
		return res.status(400).send("Missing sender or receiver id");
	}
	try {
		const foundMessages = await knex("messages")
			.where({ sender_id: senderId, receiver_id: receiverId })
			.orWhere({ receiver_id: senderId, sender_id: receiverId });
		if (foundMessages) {
			return res.status(200).json(foundMessages);
		} else {
			console.log("no messages found");
			return res.status(204).send("No messages found");
		}
	} catch (error) {
		console.log("Error getting messages: ", error);
		return res.status(404).send(`Error getting messages`);
	}
};

exports.newMessage = async (req, res) => {
	try {
		const newMessage = await knex("messages").insert({
			sender_id: req.body.senderId,
			receiver_id: req.body.receiverId,
			message: req.body.message,
			unix_timestamp: Math.floor(Date.now() / 1000),
		});
		return res.status(200).send(newMessage);
	} catch (error) {
		console.log("Error adding new message: ", error);
		return res.status(404).send(`Error adding new message`);
	}
};
