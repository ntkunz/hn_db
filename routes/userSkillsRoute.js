const router = require('express').Router();
const userSkillsController = require('../controllers/userSkillsController.js');

router
.route('/userskills')
.get(userSkillsController.index);

module.exports = router;