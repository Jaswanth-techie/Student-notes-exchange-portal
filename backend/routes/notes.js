const express = require('express');
const {
  createNote, getNotes, getNoteById, updateNote, deleteNote,
  downloadNote, rateNote, reportNote, toggleBookmark, getMyNotes,
} = require('../controllers/notesController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getNotes);
router.get('/my-notes', protect, getMyNotes);
router.get('/:id', getNoteById);
router.post('/', protect, upload.single('file'), createNote);
router.put('/:id', protect, updateNote);
router.delete('/:id', protect, deleteNote);
router.post('/:id/download', protect, downloadNote);
router.post('/:id/rate', protect, rateNote);
router.post('/:id/report', protect, reportNote);
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
