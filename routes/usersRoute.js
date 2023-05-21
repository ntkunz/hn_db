const router = require('express').Router();
const usersController = require('../controllers/usersController.js');
const multer  = require('multer')

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

//newEmail to check if email exists in database
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