const express = require('express');
const router = express.Router();
const curriculumController = require('../controllers/curriculumController');

// Standard curriculum lookups
router.get('/grades', curriculumController.getGradesHandler);
router.get('/grades/:grade/subjects', curriculumController.getSubjectsByGradeHandler);
router.get('/structure', curriculumController.getCurriculumByGradeAndSubjectHandler);
router.get('/questions', curriculumController.getQuestionsHandler);
router.get('/courses', curriculumController.getCoursesHandler);
router.get('/lessons', curriculumController.getLessonsHandler);

// Official NCERT Source References & Citations
router.get('/sources', curriculumController.getOfficialSourcesHandler);
router.get('/citations', curriculumController.getTextbookCitationsHandler);
router.get('/versions', curriculumController.getCurriculumVersionsHandler);
router.post('/versions', curriculumController.updateCurriculumProfileHandler);

// Official Curriculum Ingestion Pipeline (Classes I-XII)
router.post('/ingest', curriculumController.ingestDocumentHandler);
router.get('/ingest/batches', curriculumController.getIngestionBatchesHandler);
router.put('/ingest/batches/:id/review', curriculumController.reviewIngestionBatchHandler);
router.post('/ingest/batches/:id/publish', curriculumController.publishIngestionBatchHandler);

module.exports = router;
