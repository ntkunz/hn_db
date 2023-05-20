const router = require('express').Router();
const usersController = require('../controllers/usersController.js');
const multer  = require('multer')

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
// .put(usersController.getNeighbors)
.post(usersController.index);

//post request to add new user
router
.route('/newuser')
.post(usersController.newUser);

//post request to edit user information
router
.route('/edituser')
.post(usersController.editUser);

//emailcheck to check if email exists in database
//DISABLED TO SHOW NOAH DEMO
router
.route('/newemail')
.post(usersController.newEmail);


// router
// .route("/skills/:id")
// .get(usersController.getUserSkills);


// router
// .route("/skills/")
// .post(usersController.getUserSkills);

router
.route("/image")
.post(upload.single('file'), usersController.addImage); 

module.exports = router;