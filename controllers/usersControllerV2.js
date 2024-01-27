const knex = require("knex")(require("../knexfile"));
const { createLoginJWT } = require("../modules/auth.js");
const { comparePasswords } = require("../modules/auth.js");

// WORK IN PROGRESS
// ===== version 2 of usersController =======

exports.verifyLogin = async (req, res) => {
  // const email = req.body.email;
  // const password = req.body.password;

  try {
    const doesUserExist = await knex("users")
      .select("users.user_id")
      .where("users.email", req.body.email);
    console.log("doesUserExist: ", doesUserExist);
    // .where("users.email", email);

    if (!doesUserExist)
      return res.status(401).json({ message: "Invalid credentails" });

    // const passwordValid = comparePasswords(password, doesUserExist);
    const passwordValid = comparePasswords(req.body.password, doesUserExist);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const loginToken = createLoginJWT(doesUserExist.userId);
    return res.status(202).json({ loginToken: loginToken });
  } catch (error) {
    console.log("verifyLoginError: ", error);
    return res.status(401).json({ message: "Invalid credentails" });
  }
  //validate email and password formats, handle errors => maybe done in middleware by yup?

  //    - find user and return user and password (error if no user)
  //    - compare paswords (error if incorrect match)
  //    - return status okay if all okay
};

// exports.login = async (req, res) => {
// 	// async await
// 	// #2 - error if no user in system or if passwords don't match
// 	// #3 - get user and userSkills
// 	// #4 - create JWT with user info
// 	// #5 - return the JWT
// };
