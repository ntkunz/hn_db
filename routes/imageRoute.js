const router = require('express').Router();
const imageController = require('../controllers/imageController.js');

router
.route('/')
.put(imageController.index);

module.exports = router;