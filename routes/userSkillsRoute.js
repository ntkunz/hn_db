const router = require('express').Router();
const userSkillsController = require('../controllers/userSkillsController.js');

router
.route('/')
.get(userSkillsController.index)
.post(userSkillsController.newUser);

router
.route('/:id')
.delete(userSkillsController.removeSkills);

module.exports = router;