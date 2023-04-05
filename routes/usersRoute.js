const router = require('express').Router();
const usersController = require('../controllers/usersController.js');

router
.route('/')
// .get(usersController.index);
.post(usersController.index);

router
.route("/skills/:id")
.get(usersController.getUserSkills);

// router
// .route("/neighbors/:id")
// .get(usersController.getNeighbors);

module.exports = router;