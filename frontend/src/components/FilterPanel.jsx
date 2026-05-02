import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiSearch, FiChevronDown } from 'react-icons/fi';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SORTS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_downloaded', label: 'Most Downloaded' },
  { value: 'highest_rated', label: 'Highest Rated' },
];

const FilterPanel = ({ onFilterChange }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [branch, setBranch] = useState(searchParams.get('branch') || '');
  const [semester, setSemester] = useState(searchParams.get('semester') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [expanded, setExpanded] = useState(false);

  const applyFilters = (overrides = {}) => {
    const filters = { search, branch, semester, sort, ...overrides };
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.branch) params.set('branch', filters.branch);
    if (filters.semester) params.set('semester', filters.semester);
    if (filters.sort) params.set('sort', filters.sort);
    navigate(`?${params.toString()}`, { replace: true });
    onFilterChange?.(filters);
  };

  const clearFilters = () => {
    setSearch(''); setBranch(''); setSemester(''); setSort('latest');
    navigate('', { replace: true });
    onFilterChange?.({ search: '', branch: '', semester: '', sort: 'latest' });
  };

  const hasActiveFilters = search || branch || semester || sort !== 'latest';

  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
          className="relative flex-1"
        >
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, subject, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 py-2.5"
          />
        </form>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); applyFilters({ sort: e.target.value }); }}
            className="input py-2.5 pr-8 appearance-none cursor-pointer min-w-[160px]"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Toggle filters */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`btn-secondary py-2.5 px-4 gap-2 ${expanded ? 'border-primary-600 text-primary-400' : ''}`}
        >
          <FiFilter size={16} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary-500" />
          )}
        </button>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn-danger py-2.5 px-4" title="Clear all filters">
            <FiX size={16} /> Clear
          </button>
        )}
      </div>

      {/* Expandable filters */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-fade-in">
          {/* Branch Filter */}
          <div>
            <label className="label">Branch</label>
            <select
              value={branch}
              onChange={(e) => { setBranch(e.target.value); applyFilters({ branch: e.target.value }); }}
              className="input py-2"
            >
              <option value="">All Branches</option>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label className="label">Semester</label>
            <select
              value={semester}
              onChange={(e) => { setSemester(e.target.value); applyFilters({ semester: e.target.value }); }}
              className="input py-2"
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
