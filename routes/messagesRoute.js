const router = require('express').Router();
const messagesController = require('../controllers/messagesController.js');

router
.route('/')
.put(messagesController.index)
.post(messagesController.newMessage);

module.exports = router;