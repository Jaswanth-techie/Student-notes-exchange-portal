const path = require('path');
const Note = require('../models/Note');
const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const { title, description, subject, branch, semester, tags } = req.body;
    const ext = path.extname(req.file.originalname).toLowerCase().slice(1);
    const fileType = ['pdf'].includes(ext) ? 'pdf' : ['jpg', 'jpeg', 'png', 'gif'].includes(ext) ? 'image' : 'doc';

    const note = await Note.create({
      title,
      description,
      subject,
      branch,
      semester: parseInt(semester),
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      fileUrl: req.file.path && req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`,
      fileType,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploader: req.user._id,
    });

    await note.populate('uploader', 'name email');
    res.status(201).json({ success: true, message: 'Note uploaded successfully', note });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notes with search, filter, sort, pagination
// @route   GET /api/notes
// @access  Public
const getNotes = async (req, res, next) => {
  try {
    const {
      search,
      branch,
      semester,
      subject,
      sort = 'latest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isApproved: true };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (branch) query.branch = branch;
    if (semester) query.semester = parseInt(semester);
    if (subject) query.subject = new RegExp(subject, 'i');

    // Sorting
    let sortObj = {};
    if (sort === 'latest') sortObj = { createdAt: -1 };
    else if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'most_downloaded') sortObj = { downloadCount: -1 };
    else if (sort === 'highest_rated') sortObj = { averageRating: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('uploader', 'name branch');

    res.json({
      success: true,
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Public
const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploader', 'name email branch semester');
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private (owner or admin)
const updateNote = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this note' });
    }

    const { title, description, subject, branch, semester, tags } = req.body;
    note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        subject,
        branch,
        semester: parseInt(semester),
        tags: tags ? tags.split(',').map((t) => t.trim()) : note.tags,
      },
      { new: true, runValidators: true }
    ).populate('uploader', 'name email');

    res.json({ success: true, message: 'Note updated', note });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private (owner or admin)
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Download note (increment download counter)
// @route   POST /api/notes/:id/download
// @access  Private
const downloadNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } }, { new: true });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { downloadCount: 1 } });

    res.json({ success: true, message: 'Download tracked', fileUrl: note.fileUrl });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate a note
// @route   POST /api/notes/:id/rate
// @access  Private
const rateNote = async (req, res, next) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Prevent self-rating
    if (note.uploader.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot rate your own note' });
    }

    const existingRating = note.ratings.find((r) => r.user.toString() === req.user._id.toString());
    if (existingRating) {
      existingRating.value = parseInt(rating);
    } else {
      note.ratings.push({ user: req.user._id, value: parseInt(rating) });
    }

    note.updateAverageRating();
    await note.save();

    res.json({
      success: true,
      message: 'Rating submitted',
      averageRating: note.averageRating,
      ratingCount: note.ratingCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report a note
// @route   POST /api/notes/:id/report
// @access  Private
const reportNote = async (req, res, next) => {
  try {
    const { reason, description } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const existingReport = await Report.findOne({ note: req.params.id, reportedBy: req.user._id });
    if (existingReport) {
      return res.status(409).json({ success: false, message: 'You have already reported this note' });
    }

    await Report.create({ note: req.params.id, reportedBy: req.user._id, reason, description });
    await Note.findByIdAndUpdate(req.params.id, { isReported: true });

    res.status(201).json({ success: true, message: 'Note reported successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark
// @route   POST /api/notes/:id/bookmark
// @access  Private
const toggleBookmark = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const noteId = req.params.id;

    const isBookmarked = user.bookmarks.includes(noteId);
    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter((b) => b.toString() !== noteId);
    } else {
      user.bookmarks.push(noteId);
    }

    await user.save();
    res.json({
      success: true,
      message: isBookmarked ? 'Bookmark removed' : 'Note bookmarked',
      isBookmarked: !isBookmarked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's uploaded notes
// @route   GET /api/notes/my-notes
// @access  Private
const getMyNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ uploader: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  downloadNote,
  rateNote,
  reportNote,
  toggleBookmark,
  getMyNotes,
};
