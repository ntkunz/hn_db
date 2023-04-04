const router = require('express').Router();
const usersController = require('../controllers/usersController.js');

router
.route('/')
.get(usersController.index);

router
.route("/:id")
.get(usersController.getUserSkills)

module.exports = router;