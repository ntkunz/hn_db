const knex = require("knex")(require("../knexfile"));
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

let passwordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Find user function to check for user in database
async function findUser(userEmail) {
   const emailWhereClause = { email: userEmail };
	const results = await knex("users").where(emailWhereClause);
	if (results.length === 0) return undefined;
	return results[0];
}

//return user who logged in with jwt token
exports.login = async (req, res) => {
	//check for user email in database
};

exports.neighbors = async (req, res) => {};

exports.newUser = async (req, res) => {
	//check email and password are valid
	if (!emailRegex.test(req.body.email)) {
		return res.status(400).send("Invalid Email");
   }
	if (!passwordRegex.test(req.body.password)) {
		return res.status(400).send("Invalid Password");
   }

	const salt = bcrypt.genSaltSync(10);
	const hashedPass = bcrypt.hashSync(req.body.password, salt);

	const user = {
		email: req.body.email,
		password: hashedPass,
      user_id: req.body.user_id,
		about: req.body.about,
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		location: knex.raw("POINT(?, ?)", [req.body.coords[0], req.body.coords[1]]),
		// image_url: req.body.image_url,
		status: req.body.status,
		home: req.body.home,
		city: req.body.city,
		province: req.body.province,
		address: req.body.address,
	};

   const userFound = await findUser(user.email);
	if (userFound) {
		// User already exists
      return res.status(400).send("User already exists");
	} else {
		// User is new

      //create jwt token and pass to user along with user data
      const token = jwt.sign({ user_id: user.user_id, first_name: user.first_name }, process.env.JWT_SECRET, {
         expiresIn: process.env.JWT_EXPIRES_IN,
      });

      try {
         await knex("users").insert(user);
         // res.json({ ok: true, token: token, user: user });
         //return user data and jwt token
         res.json({ ok: true , token: token })
      } catch (err) {
         console.error(err);
         return res.status(400).send(`Error adding new user ${err}`);
      }
	}
};

exports.addImage = async (req, res) => {
	//match user_id to user_id in database
	const whereClause = { user_id: req.body.user_id };
	//create object with image_url for update
	const updateData = { image_url: req.file.filename };
	try {
		await knex("users").where(whereClause).update(updateData); // Insert the image data into the database
		res.status(200).json({ message: "Image uploaded successfully" }); // Send a success response back to the client
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message }); // Send an error response back to the client if unsuccessful
	}
};