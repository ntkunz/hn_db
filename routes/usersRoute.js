const router = require('express').Router();
const usersController = require('../controllers/usersController.js');

router
.route('/')
.get(usersController.index);

module.exports = router;