const router = require('express').Router();
const usersController = require('../controllers/usersController.js');

router
.route('/')
.put(usersController.getNeighbors)
.post(usersController.index);

router
.route('/newuser')
.post(usersController.newUser);

router
.route('/edituser')
.post(usersController.editUser)

router
.route("/skills/:id")
.get(usersController.getUserSkills);

module.exports = router;