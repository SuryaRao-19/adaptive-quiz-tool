module.exports = {
  SUBJECTS: ['Math', 'Science'],
  DIFFICULTIES: ['easy', 'medium', 'hard'],
  QUIZ_TYPES: ['pre_test', 'practice', 'post_test'],
  MASTERY_STATUS: {
    NEEDS_FOCUS: 'needs_focus',
    IN_PROGRESS: 'in_progress',
    MASTERED: 'mastered'
  },
  THRESHOLDS: {
    WEAK_TOPIC_ACCURACY: 60.0,    // < 60% = needs_focus
    MASTERED_TOPIC_ACCURACY: 80.0, // >= 80% = mastered
    PRACTICE_BATCH_SIZE: 10,
    PRE_TEST_QUESTION_COUNT: 15,
    POST_TEST_QUESTION_COUNT: 15,
    POST_TEST_UNLOCK_REQUIREMENT: 50 // questions attempted
  }
};
