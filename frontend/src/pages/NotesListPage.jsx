import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { notesAPI } from '../services/api';
import NoteCard from '../components/NoteCard';
import FilterPanel from '../components/FilterPanel';
import { FiBook, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const NotesListPage = () => {
  const [searchParams] = useSearchParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotes = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const search = params.search ?? searchParams.get('search') ?? '';
      const branch = params.branch ?? searchParams.get('branch') ?? '';
      const semester = params.semester ?? searchParams.get('semester') ?? '';
      const sort = params.sort ?? searchParams.get('sort') ?? 'latest';

      const res = await notesAPI.getAll({
        search, branch, semester: semester || undefined, sort, page: currentPage, limit: 12,
      });
      setNotes(res.data.notes);
      setPagination(res.data.pagination);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, currentPage]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleFilterChange = (filters) => {
    setCurrentPage(1);
    fetchNotes(filters);
  };

  const handleDelete = (deletedId) => {
    setNotes((prev) => prev.filter((n) => n._id !== deletedId));
  };

  const Skeleton = () => (
    <div className="card p-5 animate-pulse">
      <div className="h-1.5 rounded-full bg-slate-700 mb-4" />
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 bg-slate-700 rounded-full" />
        <div className="h-5 w-20 bg-slate-700 rounded-full" />
      </div>
      <div className="h-5 bg-slate-700 rounded-lg mb-2 w-3/4" />
      <div className="h-4 bg-slate-700/60 rounded-lg mb-1 w-1/3" />
      <div className="h-16 bg-slate-700/40 rounded-lg mb-4" />
      <div className="h-px bg-slate-700 mb-3" />
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-slate-700 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-slate-700 rounded-lg" />
          <div className="h-8 w-8 bg-slate-700 rounded-lg" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Browse <span className="text-gradient">Notes</span>
        </h1>
        <p className="text-slate-400">
          {pagination.total > 0 ? `${pagination.total} notes available` : 'Search and filter to find what you need'}
        </p>
      </div>

      <FilterPanel onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="card p-16 text-center">
          <FiBook className="text-slate-600 mx-auto mb-4" size={56} />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No notes found</h3>
          <p className="text-slate-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} onDelete={handleDelete} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary p-2 disabled:opacity-40"
              >
                <FiChevronLeft />
              </button>

              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                        : 'bg-dark-800 text-slate-400 hover:bg-dark-700 hover:text-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={currentPage === pagination.pages}
                className="btn-secondary p-2 disabled:opacity-40"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotesListPage;
