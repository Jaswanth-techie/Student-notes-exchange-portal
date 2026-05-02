const User = require('../models/User');
const Note = require('../models/Note');
const Report = require('../models/Report');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalNotes, totalReports, pendingReports] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    const recentNotes = await Note.find().sort({ createdAt: -1 }).limit(5).populate('uploader', 'name');
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');

    res.json({
      success: true,
      stats: { totalUsers, totalNotes, totalReports, pendingReports },
      recentNotes,
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, users, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot deactivate an admin account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Promote/demote user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `User role updated to ${role}`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notes (admin)
// @route   GET /api/admin/notes
// @access  Admin
const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isReported } = req.query;
    const query = {};
    if (isReported === 'true') query.isReported = true;

    const total = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('uploader', 'name email');

    res.json({ success: true, notes, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete any note
// @route   DELETE /api/admin/notes/:id
// @access  Admin
const adminDeleteNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    // Close related reports
    await Report.updateMany({ note: req.params.id }, { status: 'resolved', resolvedBy: req.user._id, resolvedAt: new Date() });

    res.json({ success: true, message: 'Note deleted by admin' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Admin
const getReports = async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const query = status !== 'all' ? { status } : {};

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('note', 'title subject')
      .populate('reportedBy', 'name email');

    res.json({ success: true, reports, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve a report
// @route   PUT /api/admin/reports/:id
// @access  Admin
const resolveReport = async (req, res, next) => {
  try {
    const { status } = req.body; // 'resolved' or 'dismissed'
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, resolvedBy: req.user._id, resolvedAt: new Date() },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, message: `Report ${status}`, report });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getAllUsers, toggleUserStatus, updateUserRole, getAllNotes, adminDeleteNote, getReports, resolveReport };
