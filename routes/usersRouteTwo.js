const router = require('express').Router();
const usersController = require('../controllers/usersControllerTwo.js');
const multer  = require('multer');

// post request to login user
router
.route('/login')
.post(usersController.login);


// post request to get all nearby users
// router
// .route('/neighbors')
// .post(usersController.index);


// post request to add new user
router
.route('/newuser')
.post(usersController.newUser);

//multer maximum upload size configuration
const maxSize = 1000000;

//multer storage configuration
const storage = multer.diskStorage({
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
   limits: { fileSize: maxSize }
 });


router
.route("/image")
.post(upload.single('file'), usersController.addImage); 

module.exports = router;