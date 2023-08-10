const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const { protect } = require("./modules/auth");
const whitelist = process.env.WHITELISTED_CLIENTS.split(",");
const corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};

const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 60, // Limit each IP to 60 requests per `window` (here, per 1 minute)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(function (req, res, next) {
	// if (whitelist.indexOf(req.headers.origin) !== -1) {
	// 	res.header("Access-Control-Allow-Origin", req.headers.origin);
	// 	res.header(
	// 		"Access-Control-Allow-Headers",
	// 		"Origin, X-Requested-With, Content-Type, Accept"
	// 	);
	// }

	res.header("Access-Control-Allow-Origin", process.env_CLIENT_URL);
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public/images"));
app.use(express.static(__dirname + "./../build"));
app.use(helmet());
app.use(limiter);
app.use(
	express.urlencoded({
		extended: true,
	})
);

const userRoutes = require("./routes/usersRoute");
const userSkillsRoutes = require("./routes/userSkillsRoute");
const messageRoutes = require("./routes/messagesRoute");

app.use("/messages", protect, messageRoutes);
app.use("/users", protect, userRoutes);
app.use("/userskills", protect, userSkillsRoutes);

//catch-all to make sure all routes work since frontend is single page application
app.get("*", (_req, res) => {
	res.sendFile("index.html", { root: __dirname + "./../build" });
});

app.listen(PORT, () => {
	console.log(`Server is running on port: ${PORT}`);
});
