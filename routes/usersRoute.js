const router = require('express').Router();
const usersController = require('../controllers/usersController.js');

router
.route('/users')
.get(usersController.index)