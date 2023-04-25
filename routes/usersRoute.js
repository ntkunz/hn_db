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

router
.route('/')
// .put(usersController.getNeighbors)
.post(usersController.index);

router
.route('/newuser')
.post(usersController.newUser);

router
.route('/edituser')
.post(usersController.editUser);

// router
// .route("/skills/:id")
// .get(usersController.getUserSkills);

router
.route("/image")
.post(upload.single('file'), usersController.addImage); 

module.exports = router;