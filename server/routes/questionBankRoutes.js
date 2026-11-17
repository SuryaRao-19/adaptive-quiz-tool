const express = require('express');
const router = express.Router();
const questionBankController = require('../controllers/questionBankController');

router.get('/', questionBankController.getQuestionsHandler);
router.post('/', questionBankController.createQuestionHandler);
router.put('/:id/review', questionBankController.reviewQuestionHandler);
router.get('/coverage', questionBankController.getCoverageReportHandler);
router.post('/import', questionBankController.importQuestionsHandler);

module.exports = router;
