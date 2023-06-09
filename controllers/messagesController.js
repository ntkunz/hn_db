const knex = require("knex")(require("../knexfile"));

/**
 * Get all messages between two users.
 * @param {Object} req - The request object from Express.
 * @param {Object} res - The response object from Express.
 * @returns {Promise} - A Promise that resolves to the response object.
 */
exports.index = async (req, res) => {
	const senderId = req.body.senderId;
	const receiverId = req.body.receiverId; 
	if (senderId == undefined || receiverId == undefined) {
		return res.status(400).send("Missing sender or receiver id");
	}
	try {
		// Get all messages between the two users
		const foundMessages = await knex("messages")
			.where({ sender_id: senderId, receiver_id: receiverId })
			.orWhere({ receiver_id: senderId, sender_id: receiverId }); 
		if (foundMessages) {
			return res.status(200).json(foundMessages); 
		} else {
			console.log("no messages found");
			return res.status(200).send("No messages found");
		}
	} catch (err) {
		console.error(err);
		return res.status(400).send(`Error getting messages ${err}`);
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
			sender_id: req.body.senderId, // The sender's ID
			receiver_id: req.body.receiverId, // The receiver's ID
			message: req.body.message, // The message text
			unix_timestamp: Math.floor(Date.now() / 1000), // The timestamp in Unix format
		});
		return res.status(200).send(newMessage); // Return the newly inserted message object
	} catch (err) {
		return res.status(400).send(`Error adding new message ${err}`); // Return an error message if there was an error adding the message
	}
};
