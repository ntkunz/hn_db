const router = require('express').Router();
const usersController = require('../controllers/usersController.js');
const multer  = require('multer');

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

  //post request to get all nearby users
router
.route('/')
//get all neighbbors route based off of email in auth header and location
.get(usersController.getNeighbors)
//edit user route
.put(usersController.editUser)
//new user post request route
.post(usersController.newUser);

//change to .post/login instead of .post/users/login
router
.route('/login')
.post(usersController.login);

router
.route('/verify')
.get(usersController.verifyUser);

//newEmail to check if email exists in database
//can I do this as a function in auth.js instead of it being a route?
router
.route('/newemail')
.post(usersController.newEmail);

//add image to user route
router
.route("/image")
.post(upload.single('file'), usersController.addImage); 

module.exports = router;