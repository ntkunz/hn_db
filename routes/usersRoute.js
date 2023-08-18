const router = require("express").Router();
const usersController = require("../controllers/usersController.js");
const multer = require("multer");

router
	.route("/")
	.get(usersController.getNeighbors)
	.put(usersController.editUser)
	.post(usersController.newUser)
	.delete(usersController.deleteUser);

router.route("/login").post(usersController.login);

router.route("/verify").get(usersController.verifyUser);

router
	.route("/newemail")
	.get(usersController.wakeup)
	.post(usersController.newEmail);

//multer maximum upload size configuration
const maxSize = 1000000;

//multer storage configuration
let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/images/");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

//multer upload configuration
const upload = multer({
	storage: storage,
	limits: { fileSize: maxSize },
});

//add image to user route
router.route("/image").post(upload.single("file"), usersController.addImage);

module.exports = router;
