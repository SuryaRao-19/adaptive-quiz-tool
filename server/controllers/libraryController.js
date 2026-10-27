const LibraryResource = require('../models/LibraryResource');

// @desc Get all library resources with optional filtering
// @route GET /api/library
const getResources = async (req, res, next) => {
  try {
    const { subject, topic, difficulty, search } = req.query;
    const filter = {};

    if (subject && subject !== 'All') {
      filter.subject = subject;
    }
    if (topic && topic !== 'All') {
      filter.topic = topic;
    }
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { summary: { $regex: search.trim(), $options: 'i' } },
        { topic: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const resources = await LibraryResource.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc Add new library resource (Teacher / Admin)
// @route POST /api/library
const addResource = async (req, res, next) => {
  try {
    const { title, subject, topic, difficulty, type, readTime, summary, body, videoUrl } = req.body;

    if (!title || !subject || !topic || !summary || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, topic, summary, and body content are required.'
      });
    }

    const resource = await LibraryResource.create({
      title: title.trim(),
      subject,
      topic: topic.trim(),
      difficulty: difficulty || 'Foundational',
      type: type || 'Article',
      readTime: readTime || '5 min read',
      summary: summary.trim(),
      body: body.trim(),
      videoUrl: videoUrl ? videoUrl.trim() : undefined,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Resource published to Reference Library successfully.',
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete library resource (Teacher / Admin)
// @route DELETE /api/library/:id
const deleteResource = async (req, res, next) => {
  try {
    const resource = await LibraryResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  addResource,
  deleteResource
};
