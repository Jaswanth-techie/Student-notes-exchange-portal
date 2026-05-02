const express = require('express');
const {
  getStats, getAllUsers, toggleUserStatus, updateUserRole,
  getAllNotes, adminDeleteNote, getReports, resolveReport,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);
router.get('/notes', getAllNotes);
router.delete('/notes/:id', adminDeleteNote);
router.get('/reports', getReports);
router.put('/reports/:id', resolveReport);

module.exports = router;
