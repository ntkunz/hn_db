const router = require('express').Router();
const userSkillsController = require('../controllers/userSkillsController.js');

router
.route('/')
.post(userSkillsController.newUser);

router
.route('/:id')
.delete(userSkillsController.removeSkills);

module.exports = router;