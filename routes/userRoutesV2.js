const router = require("express").Router();
const usersControllerV2 = require("../controllers/usersControllerV2.js");
const multer = require("multer");

router
.route("/")
// .post(usersControllerV2.getUserData);
.get(usersControllerV2.loginUserWithToken)
.post(usersControllerV2.verifyLogin);

module.exports = router;