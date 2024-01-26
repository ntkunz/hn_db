const { Server } = require("socket.io");
const knex = require("knex")(require("./knexfile"));
const SOCKET_PORT = process.env.SOCKET_PORT || 8000; 

// Socket server
function startSocketServer(httpServer, allowedOrigins) {

    const io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true
        }
    });

    httpServer.listen(SOCKET_PORT, () => {
        console.log(`Socket server is running on port: ${SOCKET_PORT}`);

		 io.on('connection', (socket) => {
			console.log('A user connected');
			
			socket.on('sendMessageToApi', (messageData) => {
					//add message data to database
					knex("messages").insert({
						sender_id: messageData.senderId,
						receiver_id: messageData.receiverId,
						message: messageData.message,
						unix_timestamp: Math.floor(Date.now() / 1000),
					}) .then (() => {
						// then respond with all messages
						const getConversation = knex("messages")
						.where({ sender_id: messageData.senderId, receiver_id: messageData.receiverId })
						.orWhere({ receiver_id: messageData.senderId, sender_id: messageData.receiverId });
						getConversation.then((messages) => {
							socket.emit('conversation', messages);
						})
				})
					.catch((error) => {
						console.log('Error in sendMessageToApi:', error);
					});
			});
			
			socket.on('joinRoom', (senderId, receiverId) => {
				const getConversation = knex("messages")
				.where({ sender_id: senderId, receiver_id: receiverId })
				.orWhere({ receiver_id: senderId, sender_id: receiverId });
				getConversation.then((messages) => {
					socket.emit('conversation', messages);
				})
				.catch((error) => {
					console.log('Error in joinRoom:', error);
				})
			})
	
			socket.on('disconnect', () => {
			  console.log('A user disconnected');
			  
			});
		 });
    })
};

module.exports = startSocketServer;