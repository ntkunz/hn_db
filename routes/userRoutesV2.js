const router = require("express").Router();
const usersControllerV2 = require("../controllers/usersControllerV2.js");
const multer = require("multer");

router
.route("/")
.post(usersControllerV2.getUserData);

module.exports = router;