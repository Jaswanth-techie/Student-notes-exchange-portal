import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notesAPI, authAPI } from '../services/api';
import NoteCard from '../components/NoteCard';
import toast from 'react-hot-toast';
import {
  FiUpload, FiBook, FiDownload, FiStar, FiBookmark,
  FiUser, FiEdit2, FiCheck, FiX, FiGrid,
} from 'react-icons/fi';

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [myNotes, setMyNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [bookmarkedNotes, setBookmarkedNotes] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', branch: user?.branch || '', semester: user?.semester || '' });

  const BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [notesRes, profileRes] = await Promise.all([
          notesAPI.getMyNotes(),
          authAPI.getMe(),
        ]);
        setMyNotes(notesRes.data.notes);
        if (profileRes.data.user.bookmarks?.length) {
          setBookmarkedNotes(profileRes.data.user.bookmarks);
        }
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDeleteNote = (id) => {
    setMyNotes((prev) => prev.filter((n) => n._id !== id));
  };

  const handleSaveProfile = async () => {
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.user);
      setEditMode(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const totalDownloads = myNotes.reduce((sum, n) => sum + (n.downloadCount || 0), 0);
  const avgRating = myNotes.length
    ? (myNotes.reduce((sum, n) => sum + (n.averageRating || 0), 0) / myNotes.length).toFixed(1)
    : '0.0';

  const stats = [
    { icon: <FiBook className="text-primary-400" />, label: 'Notes Uploaded', value: myNotes.length },
    { icon: <FiDownload className="text-emerald-400" />, label: 'Total Downloads', value: totalDownloads },
    { icon: <FiStar className="text-amber-400" />, label: 'Avg Rating', value: avgRating },
    { icon: <FiBookmark className="text-violet-400" />, label: 'Bookmarks', value: bookmarkedNotes.length },
  ];

  const tabs = [
    { id: 'notes', label: 'My Notes', icon: <FiGrid size={16} /> },
    { id: 'bookmarks', label: 'Bookmarks', icon: <FiBookmark size={16} /> },
    { id: 'profile', label: 'Profile', icon: <FiUser size={16} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-2xl font-bold shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, <span className="text-gradient">{user?.name}</span>!</h1>
            <p className="text-slate-400 text-sm mt-0.5">{user?.role === 'admin' ? '🛡️ Administrator' : `${user?.branch || 'Student'} ${user?.semester ? `· Semester ${user.semester}` : ''}`}</p>
          </div>
        </div>
        <Link to="/upload" className="btn-primary gap-2">
          <FiUpload size={16} /> Upload Notes
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="w-10 h-10 rounded-xl bg-dark-900 flex items-center justify-center shrink-0">
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-800 rounded-xl mb-6 w-fit mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-dark-950 text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'notes' && (
        <div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-6 animate-pulse h-48" />
              ))}
            </div>
          ) : myNotes.length === 0 ? (
            <div className="card p-16 text-center">
              <FiBook className="text-slate-600 mx-auto mb-4" size={56} />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No notes yet</h3>
              <p className="text-slate-500 mb-6">Upload your first note and help the community!</p>
              <Link to="/upload" className="btn-primary gap-2">
                <FiUpload /> Upload First Note
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myNotes.map((note) => (
                <NoteCard key={note._id} note={note} onDelete={handleDeleteNote} showActions />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div>
          {bookmarkedNotes.length === 0 ? (
            <div className="card p-16 text-center">
              <FiBookmark className="text-slate-600 mx-auto mb-4" size={56} />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No bookmarks yet</h3>
              <p className="text-slate-500 mb-6">Bookmark notes to access them quickly from here.</p>
              <Link to="/notes" className="btn-primary gap-2">
                <FiBook /> Browse Notes
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bookmarkedNotes.map((note) => (
                <NoteCard key={note._id || note} note={note} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-lg">
          <div className="card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Profile Settings</h2>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="btn-secondary py-2 px-4 gap-2 text-sm">
                  <FiEdit2 size={14} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="btn-primary py-2 px-4 gap-2 text-sm">
                    <FiCheck size={14} /> Save
                  </button>
                  <button onClick={() => setEditMode(false)} className="btn-secondary py-2 px-4 gap-2 text-sm">
                    <FiX size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="label">Full Name</label>
              <input
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                disabled={!editMode}
                className="input disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Branch</label>
                <select
                  value={profileForm.branch}
                  onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                  disabled={!editMode}
                  className="input disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select Branch</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Semester</label>
                <select
                  value={profileForm.semester}
                  onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
                  disabled={!editMode}
                  className="input disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Select</option>
                  {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-dark-900 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Account Role</p>
              <span className={`badge ${user?.role === 'admin' ? 'badge-red' : 'badge-blue'}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
