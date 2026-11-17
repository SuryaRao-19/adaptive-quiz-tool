const express = require('express');
const router = express.Router();
const controller = require('../controllers/curriculumCoverageController');

router.get('/overview', controller.getOverview);
router.get('/grades', controller.getGradeWiseCoverage);
router.get('/grades/:grade/subjects', controller.getSubjectWiseCoverage);
router.get('/chapters', controller.getChapterLevelCoverage);
router.get('/gaps', controller.getContentGaps);
router.get('/teacher-accountability', controller.getTeacherAccountability);
router.post('/assign-responsibility', controller.assignResponsibility);

module.exports = router;
