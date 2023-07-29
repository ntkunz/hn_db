const knex = require("knex")(require("../knexfile"));

/**
 * Get all messages between two users.
 * @param {Object} req - The request object from Express.
 * @param {Object} res - The response object from Express.
 * @returns {Promise} - A Promise that resolves to the response object.
 */
exports.index = async (req, res) => {
	const sender_id = req.body.senderId;
	const receiver_id = req.body.receiverId;
	if (sender_id == undefined || receiver_id == undefined) {
		return res.status(400).send("Missing sender or receiver id");
	}
	try {
		const foundMessages = await knex("messages")
			.where({ sender_id: sender_id, receiver_id: receiver_id })
			.orWhere({ receiver_id: sender_id, sender_id: receiver_id });
		if (foundMessages) {
			return res.status(200).json(foundMessages);
		} else {
			console.log("no messages found");
			return res.status(200).send("No messages found");
		}
	} catch (err) {
		console.error(`Error getting messages: `, err);
		return res.status(400).send(`Error getting messages`);
	}
};

/**
 * Add a new message to the messages table
 * @param {Object} req - The request object containing the senderId, receiverId, message, and unix_timestamp
 * @param {Object} res - The response object
 * @returns {Object} - The newly inserted message object
 */
exports.newMessage = async (req, res) => {
	try {
		const newMessage = await knex("messages").insert({
			sender_id: req.body.senderId,
			receiver_id: req.body.receiverId,
			message: req.body.message,
			unix_timestamp: Math.floor(Date.now() / 1000),
		});
		return res.status(200).send(newMessage);
	} catch (err) {
		console.log("Error adding new messages: ", err);
		return res.status(400).send(`Error adding new message`);
	}
};
