const router = require("express").Router();
import { loginUser, verifyLogin } from "../controllers/usersControllerV2.js";
import { validate, loginSchema } from "../modules/validation.js";

router.route("/").get(loginUser).post(validate(loginSchema), verifyLogin);
