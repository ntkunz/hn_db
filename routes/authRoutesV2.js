const router = require("express").Router();
const {
	loginUser,
	verifyLogin,
} = require("../controllers/usersControllerV2.js");
const { validate, loginSchema } = require("../modules/validation.js");

router.route("/").get(loginUser).post(validate(loginSchema), verifyLogin);
