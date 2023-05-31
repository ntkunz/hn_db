const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Create jwt token based off of user including email
const createJWT = (email, location) => {
	const token = jwt.sign(
		{
			email: email,
			location: location,
		},
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES_IN }
	);
	return token;
};

const protect = (req, res, next) => {
	const bearer = req.headers.authorization;

	if (!bearer) {
		res.status(401);
		res.json({ message: "not authorized" });
		return;
	}

	const [, token] = bearer.split(" ");

	if (!token) {
		res.status(401);
		res.json({ message: "invalid token" });
		return;
	}

	try {
		const user = jwt.verify(token, process.env.JWT_SECRET);
		req.user = user;
		next();
	} catch (e) {
		console.error(e);
		res.status(401);
		res.json({ message: "bad token" });
		return;
	}
};

const hashPassword = (password) => {
	const salt = bcrypt.genSaltSync(10);
	return bcrypt.hash(password, salt);
};

const comparePasswords = (password, hash) => {
	return bcrypt.compare(password, hash);
};

// retrieve email from token when user returns to site and token present

const getInfoFromToken = (token) => {
	try {
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

module.exports = {
	createJWT,
	protect,
	comparePasswords,
	hashPassword,
	getInfoFromToken,
};
