const knex = require("knex")(require("../knexfile"));
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv").config();
const { createLoginJWT } = require("../modules/auth.js");
const { comparePasswords } = require("../modules/auth.js");

// WORK IN PROGRESS
// ===== version 2 of usersController =======

exports.verifyLogin = async (req, res) => {
	// TODO : Validate email and password
	// TODO : Sanitize user input
	try {
		const userCredentialsFromDb = await knex("users")
			.select("users.user_id", "users.password")
			.where("users.email", req.body.email).first();

		if (!userCredentialsFromDb.user_id) return res.status(401).json({ message: "Invalid credentails" });

		const passwordValid = await comparePasswords(req.body.password, userCredentialsFromDb.password);
		if (!passwordValid) {
			console.log(`Invalid Password attempted for req.body.email: ${req.body.email}`);
			return res.status(401).json({ message: "Invalid credentials" });
		}
		const userId = userCredentialsFromDb.user_id;

		// #3 - get user and userSkills
	const user = await knex("users")
		.join("userskills", "users.user_id", "userskills.user_id")
		// .select("users.*")
		.select(
			{ userId: "users.user_id" },
			{ about: "users.about" },
			{ email: "users.email" },
			{ firstName: "users.first_name" },
			{ lastName: "users.last_name" },
			{ location: "users.location" },
			{ imageUrl: "users.image_url" },
			{ status: "users.status" },
			// { password: "users.password" },
			{ home: "users.home" },
			{ city: "users.city" },
			{ province: "users.province" },
			{ address: "users.address" },
			{ createdAt: "users.created_at" }
		)
		.select(
			knex.raw(
				"JSON_OBJECTAGG(userskills.skill, userskills.offer) as barters"
			)
		)
		.groupBy("users.user_id")
		.where("users.user_id", userId)
		.first();

		// TODO : move get user and get neighbors into separate files

			const neighbors = await knex("users")
			.join("userskills", "users.user_id", "userskills.user_id")
			.select(
				{ userId: "users.user_id" },
				{ about: "users.about" },
				{ firstName: "users.first_name" },
				{ imageUrl: "users.image_url" },
				{ status: "users.status" },
				{ createdAt: "users.created_at" }
			)
			.select(
				knex.raw(
					"JSON_OBJECTAGG(userskills.skill, userskills.offer) as barters"
				)
			)
			.whereRaw(
				"st_distance_sphere(st_geomfromtext(st_aswkt(location), 0), st_geomfromtext('POINT(" +
					user.location.x +
					" " +
					user.location.y +
					")', 0)) < 500"
			)
			.groupBy("users.user_id");

			const sortedNeighbors = 
			neighbors.sort((a, b) => {
				if (a.userId === user.user_id) {
					return -1; // a comes before b
				} else {
					return 0; // maintain the original order
			}});


		const loginToken = createLoginJWT(userCredentialsFromDb.user_id);
		return res.status(202).json({ loginToken: loginToken, user: user, neighbors: sortedNeighbors });
	} catch (error) {
		console.log("verifyLoginError: ", error);
		return res.status(401).json({ message: "Invalid credentails" });
	}
	//validate email and password formats, handle errors => maybe done in middleware by yup?

	//    - find user and return user and password (error if no user)
	//    - compare paswords (error if incorrect match)
	//    - return status okay if all okay
};

exports.loginUserWithToken = async (req, res) => {
	const userToken = req.headers.authorization.split(" ")[1];

	if (!userToken) {
		return res.status(401).json({ message: "Invalid credentails" });
	}
	// async await
	// #2 - error if no user in system or if passwords don't match
	try {
		const userCredentials = jwt.verify(userToken, process.env.JWT_SECRET);

	if (userCredentials.exp < Date.now() / 1000) {
		console.log("token expired for user: ", userCredentials);
		return res.status(401).json({ message: "Invalid credentials" });
	}
	const userId = userCredentials.userId;

		// #3 - get user and userSkills
	const user = await knex("users")
		.join("userskills", "users.user_id", "userskills.user_id")
		// .select("users.*")
		.select(
			{ userId: "users.user_id" },
			{ about: "users.about" },
			{ email: "users.email" },
			{ firstName: "users.first_name" },
			{ lastName: "users.last_name" },
			{ location: "users.location" },
			{ imageUrl: "users.image_url" },
			{ status: "users.status" },
			// { password: "users.password" },
			{ home: "users.home" },
			{ city: "users.city" },
			{ province: "users.province" },
			{ address: "users.address" },
			{ createdAt: "users.created_at" }
		)
		.select(
			knex.raw(
				"JSON_OBJECTAGG(userskills.skill, userskills.offer) as barters"
			)
		)
		.groupBy("users.user_id")
		.where("users.user_id", userId)
		.first();

		// #4 - get neighbors for that user
		const neighbors = await knex("users")
			// .join("userskills", function () {
			// 	this.on("users.user_id", "=", "userskills.user_id");
			// })
			.join("userskills", "users.user_id", "userskills.user_id")
			.select(
				{ userId: "users.user_id" },
				{ about: "users.about" },
				{ firstName: "users.first_name" },
				{ imageUrl: "users.image_url" },
				{ status: "users.status" },
				{ createdAt: "users.created_at" }
			)
			.select(
				knex.raw(
					"JSON_OBJECTAGG(userskills.skill, userskills.offer) as barters"
				)
			)
			.whereRaw(
				"st_distance_sphere(st_geomfromtext(st_aswkt(location), 0), st_geomfromtext('POINT(" +
					user.location.x +
					" " +
					user.location.y +
					")', 0)) < 500"
			)
			.groupBy("users.user_id");

			const sortedNeighbors = 
			neighbors.sort((a, b) => {
				if (a.userId === user.user_id) {
					return -1; // a comes before b
				} else if (b.userId === user.user_id) {
					return 1; // b comes before a
				} else {
					return 0; // maintain the original order
			}});
			//sort neighbors here where user is first neighbor

		// #5 - return user and neighbors
		return res.status(202).json({ user: user, neighbors: sortedNeighbors });
	// const userId = jwt.verify(, process.env.JWT_SECRET)
	// console.log('userId: ', userId);
	} catch (error) {
		console.log("loginUserWithTokenError: ", error);
		return res.status(401).json({ message: "Invalid credentails" });
	}



};



// misguided attempt below at getting user data... loginUser is better
exports.getUserData = async (req, res) => {

	function validateToken(token) {

	}

	const userId = validateToken(req.body.loginToken);

	// const getUser= (req.body.)
	// const userId = validateToken(req.body.loginToken);
	// handle erros if no userId, or if it returns an error

	//get user, userSkills, and neighbors from userId

	try {
		
	} catch (error) {
		
	}
}