const router = require('express').Router();
const usersController = require('../controllers/usersController.js');
const multer  = require('multer');

router
.route('/')
//get all neighbbors route based off of email in auth header and location
.get(usersController.getNeighbors)
//edit user route
.put(usersController.editUser)
//new user post request route
.post(usersController.newUser);

//route to login user
router
.route('/login')
.post(usersController.login);

//route to verify user
router
.route('/verify')
.get(usersController.verifyUser);

//route to check if email exists in database
router
.route('/newemail')
.post(usersController.newEmail);

//all multer file upload route settings and route
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
    limits: { fileSize: maxSize }
  });

//add image to user route
router
.route("/image")
.post(upload.single('file'), usersController.addImage); 

module.exports = router;