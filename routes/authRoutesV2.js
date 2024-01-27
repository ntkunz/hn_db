// WORK IN PROGRESS
// TODO : Declare new routes for v2 server refactor

const router = require("express").Router();
const usersControllerV2 = require("../controllers/usersControllerV2.js");

// const { validate, loginSchema } = require("../modules/validation.js");

// router.route("/").get(loginUser).post(validate(loginSchema), verifyLogin);
router
  .route("/")
  // .get(usersControllerV2.loginUser)
  .post(usersControllerV2.verifyLogin);

module.exports = router;
