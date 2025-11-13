const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/', questionController.getAllQuestions);
router.post('/', questionController.createQuestion);
router.get('/:id', questionController.getQuestionById);    
router.put('/:id', questionController.updateQuestion);

module.exports = router;