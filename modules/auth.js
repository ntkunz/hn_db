const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

// Create jwt token based off of user including email
const createJWT = (email) => {
	const token = jwt.sign(
		{
			email: email,
		},
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES_IN }
	);
	return token;
};

//protect routes from unauthorized users
const protect = (req, res, next) => {
	//allow access without bearer token for routes that are before user is logged in
	if (
		req.originalUrl === "/users/login" ||
		req.originalUrl === "/users/newemail" ||
		req.originUrl === "/users/verify" ||
		(req.method === "POST" && req.originalUrl.startsWith("/users"))
	) {
		next();
		return;
	}

	const bearer = req.headers.authorization;

	if (!bearer) {
		res.status(401).json({ message: "not authorized" });
		return;
	}

	const [, token] = bearer.split(" ");
	const tokenObject = JSON.parse(token);
	const userToken = tokenObject.userToken;

	if (!userToken) {
		res.status(401);
		res.json({ message: "invalid token" });
		return;
	}

	try {
		//Confirm token is not expired
		const user = jwt.verify(userToken, process.env.JWT_SECRET);
		if (user.exp < Date.now() / 1000) {
			res.status(401);
			res.json({ message: "token expired" });
			return;
		}
		req.user = user;
		next();
	} catch (e) {
		console.error(e);
		res.status(401);
		res.json({ message: "bad token" });
		return;
	}
};

//hash password
const hashPassword = (password) => {
	const salt = bcrypt.genSaltSync(10);
	return bcrypt.hash(password, salt);
};

//compare passwords
const comparePasswords = (password, hash) => {
	// return bcrypt.compare(password, hash);
	let isItTrue = bcrypt.compare(password, hash);
	console.log("isItTrue?: ", isItTrue);
};

// retrieve email from token when user returns to site and valid token is present
const getInfoFromToken = (token) => {
	try {
		//TODO: re-evaluate below 2 lines and their purpose, may be slightly unnecessary
		const tokenObject = JSON.parse(token); // Parse the JSON string into an object
		const tokenValue = tokenObject.userToken; // Access the 'userToken' property from the object

		try {
			const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
			return decoded;
		} catch (error) {
			// Check for the specific error indicating an invalid signature
			if (
				error instanceof jwt.JsonWebTokenError &&
				error.message === "invalid signature"
			) {
				return { error: "Invalid token signature" };
			} else {
				throw error; // Re-throw the error if it's not the expected error
			}
		}
	} catch (err) {
		console.error("Error decoding token:", err);
		return { error: "Invalid token format" };
	}
};

//export all modules
module.exports = {
	createJWT,
	protect,
	comparePasswords,
	hashPassword,
	getInfoFromToken,
};
