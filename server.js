const express = require("express");
const { createServer } = require("http");
const app = express();
const httpServer = createServer(app);
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
const startSocketServer = require('./socketServer.js');

const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const { protect } = require("./modules/auth");

// TODO : Move rateLimit variables to utils file
const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 60, // Limit each IP to 60 requests per `window` (here, per 1 minute)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const corsOptions = {
	// TODO : Add test environment to origin
	origin: allowedOrigins
};

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

// Start the separate socket server
startSocketServer(httpServer, allowedOrigins);

// Start the main server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Main server is running on port: ${PORT}`);
});

