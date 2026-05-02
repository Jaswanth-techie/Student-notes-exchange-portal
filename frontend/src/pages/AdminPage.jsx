import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiUsers, FiBook, FiFlag, FiTrash2, FiShield, FiToggleLeft, FiToggleRight,
  FiCheck, FiX, FiAlertTriangle, FiTrendingUp,
} from 'react-icons/fi';

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'notes') loadNotes();
    if (activeTab === 'reports') loadReports();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.stats);
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.users);
    } catch { toast.error('Failed to load users'); }
  };

  const loadNotes = async () => {
    try {
      const res = await adminAPI.getAllNotes();
      setNotes(res.data.notes);
    } catch { toast.error('Failed to load notes'); }
  };

  const loadReports = async () => {
    try {
      const res = await adminAPI.getReports({ status: 'all' });
      setReports(res.data.reports);
    } catch { toast.error('Failed to load reports'); }
  };

  const handleToggleUser = async (id) => {
    try {
      const res = await adminAPI.toggleUser(id);
      setUsers((prev) => prev.map((u) => u._id === id ? res.data.user : u));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle user');
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Permanently delete this note?')) return;
    try {
      await adminAPI.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete note'); }
  };

  const handleResolveReport = async (id, status) => {
    try {
      await adminAPI.resolveReport(id, status);
      setReports((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
      toast.success(`Report ${status}`);
    } catch { toast.error('Failed to resolve report'); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiTrendingUp size={15} /> },
    { id: 'users', label: 'Users', icon: <FiUsers size={15} /> },
    { id: 'notes', label: 'Notes', icon: <FiBook size={15} /> },
    { id: 'reports', label: 'Reports', icon: <FiFlag size={15} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
          <FiShield className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Manage users, notes, and reports</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FiUsers className="text-primary-400" />} label="Total Users" value={stats.totalUsers} color="bg-primary-900/40" />
          <StatCard icon={<FiBook className="text-emerald-400" />} label="Total Notes" value={stats.totalNotes} color="bg-emerald-900/40" />
          <StatCard icon={<FiFlag className="text-amber-400" />} label="Total Reports" value={stats.totalReports} color="bg-amber-900/40" />
          <StatCard icon={<FiAlertTriangle className="text-red-400" />} label="Pending Reports" value={stats.pendingReports} color="bg-red-900/40" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-800 rounded-xl mb-6 w-fit flex-wrap">
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

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-slate-300 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Users</span>
                <span className="font-medium">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Notes</span>
                <span className="font-medium">{stats.totalNotes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pending Reports</span>
                <span className={`font-medium ${stats.pendingReports > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {stats.pendingReports}
                </span>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-slate-300 mb-4">Tips</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2"><FiCheck size={14} className="text-emerald-400 mt-0.5 shrink-0" /> Review pending reports in the Reports tab</li>
              <li className="flex items-start gap-2"><FiCheck size={14} className="text-emerald-400 mt-0.5 shrink-0" /> Deactivate spammers in the Users tab</li>
              <li className="flex items-start gap-2"><FiCheck size={14} className="text-emerald-400 mt-0.5 shrink-0" /> Delete inappropriate notes from the Notes tab</li>
            </ul>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-dark-900">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Branch/Sem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-dark-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center text-sm font-bold shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{u.branch || '—'} {u.semester ? `/ Sem ${u.semester}` : ''}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${u.role === 'admin' ? 'badge-red' : 'badge-blue'}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUser(u._id)}
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                          className={`p-2 rounded-lg transition-colors ${u.isActive ? 'text-slate-400 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-900/20'}`}
                        >
                          {u.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-dark-900">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Uploader</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Downloads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Reported</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {notes.map((n) => (
                  <tr key={n._id} className={`hover:bg-dark-900/50 transition-colors ${n.isReported ? 'border-l-2 border-red-600/50' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm max-w-[180px] truncate">{n.title}</p>
                      <div className="flex gap-1 mt-1">
                        <span className="badge badge-blue text-xs">{n.branch}</span>
                        <span className="badge badge-purple text-xs">Sem {n.semester}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{n.subject}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{n.uploader?.name}</td>
                    <td className="px-6 py-4 text-sm">{n.downloadCount}</td>
                    <td className="px-6 py-4">
                      {n.isReported && <span className="badge badge-red">⚠ Reported</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteNote(n._id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                        title="Delete note"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {notes.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No notes found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-dark-900">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Note</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Reported By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-dark-900/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium max-w-[160px] truncate">{r.note?.title || 'Deleted'}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{r.reportedBy?.name}</td>
                    <td className="px-6 py-4">
                      <span className="badge badge-yellow capitalize">{r.reason?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${r.status === 'pending' ? 'badge-yellow' : r.status === 'resolved' ? 'badge-green' : 'badge-red'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {r.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveReport(r._id, 'resolved')}
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-900/20 transition-colors"
                            title="Resolve"
                          >
                            <FiCheck size={15} />
                          </button>
                          <button
                            onClick={() => handleResolveReport(r._id, 'dismissed')}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors"
                            title="Dismiss"
                          >
                            <FiX size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No reports found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
