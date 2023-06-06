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
// router
// .route('/')
// // .put(usersController.getNeighbors)
// .post(usersController.index);


//change to just .get/users
router
.route('/getneighbors')
.get(usersController.getNeighbors);


//change to .post/login instead of .post/users/login
router
.route('/login')
.post(usersController.login);

//post request to add new user
//change to .post/users instead of .post/users/newuser
router
.route('/newuser')
.post(usersController.newUser);

router
.route('/verify')
.get(usersController.verifyUser);

//post request to edit user information
//change to .put/users instead of .post/users/edituser
router
.route('/edituser')
.post(usersController.editUser);

//newEmail to check if email exists in database
//can I do this as a function in auth.js instead of it being a route?
router
.route('/newemail')
.post(usersController.newEmail);


// router
// .route("/skills/:id")
// .get(usersController.getUserSkills);


// router
// .route("/skills/")
// .post(usersController.getUserSkills);

//add image to user route
router
.route("/image")
.post(upload.single('file'), usersController.addImage); 

module.exports = router;