const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const knex = require("knex")(require("./knexfile"));
const app = express();
const httpServer = createServer(app);
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
const io = new Server(httpServer, {
	cors: {
		origin: allowedOrigins,
		credentials: true
	}
});
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const { protect } = require("./modules/auth");

const corsOptions = {
	// TODO : Add test environment to origin
	origin: allowedOrigins
};

// TODO : Move rateLimit variables to utils file
const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 60, // Limit each IP to 60 requests per `window` (here, per 1 minute)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(express.static("public/images"));
app.use(helmet());
app.use(
	express.urlencoded({
		extended: true,
	})
);

const userRoutes = require("./routes/usersRoute");
const userSkillsRoutes = require("./routes/userSkillsRoute");
const messageRoutes = require("./routes/messagesRoute");

// IN PROGRESS : v2 routes for routes and controllers refactor
// const userRoutesV2 = require("./routes/usersRouteV2");
const authRoutesV2 = require("./routes/authRoutesV2");

app.use("/messages", protect, messageRoutes);
app.use("/users", protect, userRoutes);
app.use("/userskills", protect, userSkillsRoutes);
// app.use("/users/v2", protect, userRoutesV2);
app.use("/v2/auth", authRoutesV2);

app.get("*", (_req, res) => {
	// catchall to catch any undefined routes, but not serving serverside html so blank for now
	// res.sendFile("index.html", { root: __dirname + "./../build" });
});

// TODO: Add error handling responses to update frontend on message error
// TODO: Extract "getConversation" to utils file
// TODO: Move socket events to messagesController 
// TODO: Add socket events for logging in/returning neighbors, creating user, deleting user, etc

httpServer.listen(PORT, () => {
	console.log(`Server is running on port: ${PORT}`);

	 // Socket connection
	 io.on('connection', (socket) => {
		console.log('A user connected');
		
		// Handle socket events
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

		// Disconnect event
		socket.on('disconnect', () => {
		  console.log('A user disconnected');
		  
		});
	 });
});
