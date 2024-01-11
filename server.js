const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
// const http = require("http");
// const socketIO = require("socket.io");

const app = express();
const httpServer = createServer(app);
// const io = socketIO(server);
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:3000",
		// allowedHeaders: ["my-custom-header"],
		credentials: true
	}
});
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const { protect } = require("./modules/auth");
const allowedOrigins = process.env.ALLOWED_ORIGINS;
// const allowedOrigins = [process.env.ALLOWED_ORIGINS]; // trying out codeium suggestion

// my version below, which works in production
const corsOptions = {
	// TODO : Add test environment to origin
	origin: process.env.CLIENT_URL,
	allowedOrigins
};

// TESTING: codeium version / v2... testing
// doesn't seem to work as env variables brought in not as an array in a weird way
// const corsOptions = {
// 	origin: (origin, callback) => {
// 		console.log("origin", origin);
// 		console.log('allowedOrigins', allowedOrigins);
// 	  if (allowedOrigins.includes(origin)) {
// 		 callback(null, true);
// 	  } else {
// 		 callback(new Error("Not allowed by CORS"));
// 	  }
// 	},
//  };

// TODO : Move rateLimit variables to utils file
const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 60, // Limit each IP to 60 requests per `window` (here, per 1 minute)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// app.use(cors({
// 	origin: allowedOrigins,
// }));
app.use(cors(corsOptions));
// app.use(cors());
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

//catch-all to make sure all routes work since frontend is single page application
// TODO : test that this is not necessary, I think all of my routes are covered above
app.get("*", (_req, res) => {
	// console.log('req', _req);
	res.sendFile("index.html", { root: __dirname + "./../build" });
});

// app.listen(PORT, () => {
httpServer.listen(PORT, () => {
	console.log(`Server is running on port: ${PORT}`);

	 // Socket connection
	 io.on('connection', (socket) => {
		console.log('A user connected');
		
		// Handle socket events
		socket.on('sendMessage', (messageData) => {
		  // Handle event logic
		  console.log('messageData:', messageData);
		  io.emit('receiveMessage', messageData);

		});
		
		// Disconnect event
		socket.on('disconnect', () => {
		  console.log('A user disconnected');
		  
		});
	 });
});
