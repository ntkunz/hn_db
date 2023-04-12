const router = require('express').Router();
const usersController = require('../controllers/usersController.js');
const multer  = require('multer')


let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/images/");
    },
    filename: function (req, file, cb) {
    //   let extArray = file.mimetype.split("/");
    //   let extension = extArray[extArray.length - 1];
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage: storage });

router
.route('/')
.put(usersController.getNeighbors)
.post(usersController.index);

router
.route('/newuser')
.post(usersController.newUser);

router
.route('/edituser')
.post(usersController.editUser);

router
.route("/skills/:id")
.get(usersController.getUserSkills);

router
.route("/image")
.post(upload.single('file'), usersController.addImage); 

module.exports = router;