const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Create jwt token based off of user
const createJWT = (user) => {
	const token = jwt.sign(
		{
			id: user.user_id,
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
}

const comparePasswords = (password, hash) => {
	return bcrypt.compare(password, hash);
};

module.exports = {
	createJWT,
	protect,
   comparePasswords,
	hashPassword
};
