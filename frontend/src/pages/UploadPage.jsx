import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { notesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUpload, FiFile, FiX, FiCheck } from 'react-icons/fi';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'];

const UploadPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', subject: '', branch: '', semester: '', tags: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('File rejected. Only PDF, images, and DOC files up to 20MB are allowed.');
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    maxSize: 20 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file to upload');
    if (!form.branch) return toast.error('Please select a branch');
    if (!form.semester) return toast.error('Please select a semester');

    setLoading(true);
    setProgress(10);

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    formData.append('file', file);

    try {
      setProgress(40);
      await notesAPI.create(formData);
      setProgress(100);
      toast.success('Note uploaded successfully! 🎉');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload <span className="text-gradient">Notes</span></h1>
        <p className="text-slate-400">Share your study materials with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Dropzone */}
        <div
          {...getRootProps()}
          className={`card p-10 text-center cursor-pointer border-2 border-dashed transition-all duration-200 ${
            isDragActive
              ? 'border-primary-500 bg-primary-900/20'
              : file
              ? 'border-emerald-600/50 bg-emerald-900/10'
              : 'border-slate-700 hover:border-primary-600/50 hover:bg-dark-800'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 flex items-center justify-center mx-auto">
                <FiCheck size={28} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-400">{file.name}</p>
                <p className="text-sm text-slate-500 mt-1">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                <FiX size={12} /> Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-all ${isDragActive ? 'bg-primary-600/30 scale-110' : 'bg-dark-900'}`}>
                <FiUpload size={26} className={isDragActive ? 'text-primary-400' : 'text-slate-400'} />
              </div>
              <div>
                <p className="font-semibold text-slate-200">
                  {isDragActive ? 'Drop your file here!' : 'Drag & drop your file here'}
                </p>
                <p className="text-sm text-slate-500 mt-1">or click to browse</p>
              </div>
              <p className="text-xs text-slate-600">PDF, Images, DOC — up to 20MB</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {loading && progress > 0 && (
          <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-violet-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Form Fields */}
        <div className="card p-6 space-y-5">
          <div>
            <label className="label">Title *</label>
            <input
              required
              placeholder="e.g., Data Structures Complete Notes"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              maxLength={100}
              id="note-title"
            />
          </div>

          <div>
            <label className="label">Subject *</label>
            <input
              required
              placeholder="e.g., Data Structures and Algorithms"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="input"
              id="note-subject"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Branch *</label>
              <select
                required
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="input"
                id="note-branch"
              >
                <option value="">Select Branch</option>
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Semester *</label>
              <select
                required
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="input"
                id="note-semester"
              >
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              placeholder="Briefly describe what these notes cover..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              maxLength={500}
              className="input resize-none"
              id="note-description"
            />
          </div>

          <div>
            <label className="label">Tags <span className="text-slate-600 font-normal">(comma separated)</span></label>
            <input
              placeholder="e.g., algorithms, trees, sorting, exam"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="input"
              id="note-tags"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1 py-3.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 py-3.5 text-base"
            id="upload-submit"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FiUpload /> Upload Note
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;
