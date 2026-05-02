import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { notesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FiDownload, FiStar, FiBookmark, FiTrash2, FiEdit2, FiFlag,
  FiArrowLeft, FiUser, FiCalendar, FiFile, FiTag,
} from 'react-icons/fi';

const NoteDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: 'spam', description: '' });

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await notesAPI.getById(id);
        setNote(res.data.note);
        setBookmarked(user?.bookmarks?.includes(id));
      } catch {
        toast.error('Note not found');
        navigate('/notes');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleDownload = async () => {
    if (!user) return navigate('/login');
    try {
      await notesAPI.download(note._id);
      const fileUrl = note.fileUrl.startsWith('http') 
        ? note.fileUrl 
        : `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}${note.fileUrl}`;
      window.open(fileUrl, '_blank');
      setNote((n) => ({ ...n, downloadCount: n.downloadCount + 1 }));
      toast.success('Download started!');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleRate = async (rating) => {
    if (!user) return navigate('/login');
    if (note.uploader?._id === user._id) return toast.error("You can't rate your own note");
    try {
      const res = await notesAPI.rate(note._id, rating);
      setUserRating(rating);
      setNote((n) => ({ ...n, averageRating: res.data.averageRating, ratingCount: res.data.ratingCount }));
      toast.success('Rating submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rate');
    }
  };

  const handleBookmark = async () => {
    if (!user) return navigate('/login');
    try {
      const res = await notesAPI.bookmark(note._id);
      setBookmarked(res.data.isBookmarked);
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to bookmark');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this note permanently?')) return;
    try {
      await notesAPI.delete(note._id);
      toast.success('Note deleted');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      await notesAPI.report(note._id, reportForm);
      toast.success('Note reported. Our team will review it.');
      setShowReport(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-slate-800 rounded-lg w-1/4 mb-8" />
        <div className="card p-8">
          <div className="h-8 bg-slate-700 rounded-lg mb-4 w-2/3" />
          <div className="flex gap-2 mb-6">
            <div className="h-6 w-20 bg-slate-700 rounded-full" />
            <div className="h-6 w-20 bg-slate-700 rounded-full" />
          </div>
          <div className="h-32 bg-slate-700/50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!note) return null;

  const isOwner = user?._id === note.uploader?._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors group">
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Notes
      </button>

      <div className="card overflow-hidden animate-fade-in">
        {/* Color strip */}
        <div className="h-2 bg-gradient-to-r from-primary-600 via-violet-600 to-primary-400" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge badge-blue">{note.branch}</span>
                <span className="badge badge-purple">Semester {note.semester}</span>
                {note.isReported && <span className="badge badge-red">Reported</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{note.title}</h1>
              <p className="text-primary-400 font-medium">{note.subject}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={handleBookmark} className={`p-2.5 rounded-xl border transition-all ${bookmarked ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-slate-700 text-slate-400 hover:border-amber-500/40 hover:text-amber-400'}`}>
                <FiBookmark className={bookmarked ? 'fill-amber-400' : ''} />
              </button>
              {(isOwner || isAdmin) && (
                <>
                  <Link to={`/notes/${note._id}/edit`} className="p-2.5 rounded-xl border border-slate-700 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400 transition-all">
                    <FiEdit2 />
                  </Link>
                  <button onClick={handleDelete} className="p-2.5 rounded-xl border border-slate-700 text-slate-400 hover:border-red-500/40 hover:text-red-400 transition-all">
                    <FiTrash2 />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {note.description && (
            <div className="mb-6 p-4 rounded-xl bg-dark-900 border border-slate-700">
              <p className="text-slate-300 leading-relaxed">{note.description}</p>
            </div>
          )}

          {/* Meta Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <FiUser size={14} className="text-slate-500" />
              <div>
                <p className="text-xs text-slate-600">Uploaded by</p>
                <p className="text-slate-300">{note.uploader?.name || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <FiCalendar size={14} className="text-slate-500" />
              <div>
                <p className="text-xs text-slate-600">Date</p>
                <p className="text-slate-300">{new Date(note.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <FiDownload size={14} className="text-slate-500" />
              <div>
                <p className="text-xs text-slate-600">Downloads</p>
                <p className="text-slate-300">{note.downloadCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <FiFile size={14} className="text-slate-500" />
              <div>
                <p className="text-xs text-slate-600">Type</p>
                <p className="text-slate-300 uppercase">{note.fileType}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <FiTag size={14} className="text-slate-500" />
              {note.tags.map((tag) => (
                <span key={tag} className="badge badge-blue">#{tag}</span>
              ))}
            </div>
          )}

          {/* Rating Section */}
          <div className="p-4 rounded-xl bg-dark-900 border border-slate-700 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-4xl font-bold text-amber-400">{note.averageRating?.toFixed(1) || '0.0'}</p>
                  <div>
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <FiStar key={s} size={16} className={s <= Math.round(note.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">{note.ratingCount} ratings</p>
                  </div>
                </div>
              </div>
              {user && !isOwner && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Rate this note</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleRate(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <FiStar size={22} className={s <= (hoverRating || userRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleDownload} className="btn-primary flex-1 py-3.5 text-base gap-2">
              <FiDownload size={18} /> Download Note
            </button>
            {user && !isOwner && (
              <button
                onClick={() => setShowReport(!showReport)}
                className="btn-secondary py-3.5 px-6 gap-2 text-slate-400"
              >
                <FiFlag size={16} /> Report
              </button>
            )}
          </div>

          {/* Report Form */}
          {showReport && (
            <form onSubmit={handleReport} className="mt-4 p-4 rounded-xl border border-red-700/30 bg-red-900/10 space-y-3 animate-fade-in">
              <h3 className="font-semibold text-red-400">Report this note</h3>
              <select
                value={reportForm.reason}
                onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                className="input"
              >
                <option value="spam">Spam</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="copyright">Copyright Violation</option>
                <option value="wrong_info">Wrong Information</option>
                <option value="other">Other</option>
              </select>
              <textarea
                placeholder="Additional details (optional)"
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                rows={3}
                className="input resize-none"
              />
              <div className="flex gap-3">
                <button type="submit" className="btn-danger flex-1">Submit Report</button>
                <button type="button" onClick={() => setShowReport(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteDetailPage;
