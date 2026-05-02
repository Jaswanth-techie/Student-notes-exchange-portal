import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiDownload, FiStar, FiBookmark, FiTrash2, FiEdit2, FiFlag, FiFile, FiImage, FiFileText } from 'react-icons/fi';
import { notesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const branchColors = {
  CSE: 'badge-blue', ECE: 'badge-purple', EEE: 'badge-yellow',
  ME: 'badge-green', CE: 'badge-red', IT: 'badge-blue',
  AIDS: 'badge-purple', AIML: 'badge-green', Other: 'badge-yellow',
};

const FileIcon = ({ type }) => {
  if (type === 'image') return <FiImage className="text-emerald-400" />;
  if (type === 'doc') return <FiFileText className="text-amber-400" />;
  return <FiFile className="text-primary-400" />;
};

const StarRating = ({ rating, count, onRate, userRating }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => onRate && setHover(star)}
          onMouseLeave={() => onRate && setHover(0)}
          className={`transition-all duration-100 ${onRate ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
        >
          <FiStar
            size={14}
            className={`${
              star <= (hover || userRating || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-600'
            }`}
          />
        </button>
      ))}
      <span className="text-xs text-slate-500 ml-1">({count || 0})</span>
    </div>
  );
};

const NoteCard = ({ note, onDelete, onUpdate, showActions = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(user?.bookmarks?.includes(note._id));
  const [downloads, setDownloads] = useState(note.downloadCount || 0);
  const [avgRating, setAvgRating] = useState(note.averageRating || 0);
  const [ratingCount, setRatingCount] = useState(note.ratingCount || 0);
  const [userRating, setUserRating] = useState(0);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!user) { navigate('/login'); return; }
      await notesAPI.download(note._id);
      setDownloads((d) => d + 1);
      const fileUrl = note.fileUrl?.startsWith('http') 
        ? note.fileUrl 
        : `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}${note.fileUrl}`;
      window.open(fileUrl, '_blank');
      toast.success('Download started!');
    } catch {
      toast.error('Failed to download');
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!user) { navigate('/login'); return; }
      const res = await notesAPI.bookmark(note._id);
      setBookmarked(res.data.isBookmarked);
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to bookmark');
    }
  };

  const handleRate = async (rating) => {
    try {
      if (!user) { navigate('/login'); return; }
      const res = await notesAPI.rate(note._id, rating);
      setAvgRating(res.data.averageRating);
      setRatingCount(res.data.ratingCount);
      setUserRating(rating);
      toast.success('Rating submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rate');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this note? This action cannot be undone.')) return;
    try {
      await notesAPI.delete(note._id);
      toast.success('Note deleted');
      onDelete?.(note._id);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const isOwner = user?._id === note.uploader?._id || user?._id === note.uploader;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="card-hover group flex flex-col h-full animate-fade-in">
      {/* Header strip */}
      <div className="h-1.5 rounded-t-2xl bg-gradient-to-r from-primary-600 to-violet-600" />

      <div className="p-5 flex flex-col flex-1">
        {/* Top meta */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge ${branchColors[note.branch] || 'badge-blue'}`}>{note.branch}</span>
            <span className="badge badge-purple">Sem {note.semester}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <FileIcon type={note.fileType} />
            <span className="text-xs">{note.fileType?.toUpperCase()}</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/notes/${note._id}`} className="group/title">
          <h3 className="font-semibold text-slate-100 text-base leading-snug mb-1 group-hover/title:text-primary-400 transition-colors line-clamp-2">
            {note.title}
          </h3>
        </Link>

        {/* Subject */}
        <p className="text-xs font-medium text-primary-400 mb-2">{note.subject}</p>

        {/* Description */}
        {note.description && (
          <p className="text-sm text-slate-400 line-clamp-2 mb-3 flex-1">{note.description}</p>
        )}

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-slate-500 bg-dark-900 px-2 py-0.5 rounded-md">#{tag}</span>
            ))}
          </div>
        )}

        {/* Rating */}
        <div className="mb-3">
          <StarRating
            rating={avgRating}
            count={ratingCount}
            onRate={user && !isOwner ? handleRate : null}
            userRating={userRating}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 mt-auto">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <FiDownload size={12} /> {downloads}
            </span>
            <span>{note.uploader?.name || 'Unknown'}</span>
            {note.fileSize && <span>{formatSize(note.fileSize)}</span>}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmark}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
              className={`p-2 rounded-lg transition-all duration-200 ${
                bookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-amber-400 hover:bg-amber-400/10'
              }`}
            >
              <FiBookmark size={15} className={bookmarked ? 'fill-amber-400' : ''} />
            </button>

            <button
              onClick={handleDownload}
              title="Download"
              className="p-2 rounded-lg text-slate-500 hover:text-primary-400 hover:bg-primary-400/10 transition-all duration-200"
            >
              <FiDownload size={15} />
            </button>

            {(isOwner || isAdmin) && showActions && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/notes/${note._id}/edit`); }}
                  title="Edit"
                  className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all duration-200"
                >
                  <FiEdit2 size={15} />
                </button>
                <button
                  onClick={handleDelete}
                  title="Delete"
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
                >
                  <FiTrash2 size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
