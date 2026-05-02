import { Link } from 'react-router-dom';
import { FiBook, FiUpload, FiUsers, FiStar, FiArrowRight, FiShield, FiSearch, FiZap } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import BookAnimation from '../components/BookAnimation';

const features = [
  { icon: <FiUpload className="text-primary-400" size={24} />, title: 'Easy Upload', desc: 'Upload PDF and image notes with rich metadata — subject, branch, semester, and tags.' },
  { icon: <FiSearch className="text-violet-400" size={24} />, title: 'Smart Search', desc: 'Full-text search across titles, subjects, and tags. Filter by branch, semester, and more.' },
  { icon: <FiStar className="text-amber-400" size={24} />, title: 'Rating System', desc: 'Rate notes 1–5 stars. Sort by highest rated to find the best quality content quickly.' },
  { icon: <FiUsers className="text-emerald-400" size={24} />, title: 'Community Driven', desc: 'Built for students, by students. Share knowledge, track downloads, and build your reputation.' },
  { icon: <FiShield className="text-red-400" size={24} />, title: 'Moderated Content', desc: 'Admin panel with report handling ensures only quality, appropriate content stays up.' },
  { icon: <FiZap className="text-cyan-400" size={24} />, title: 'Instant Access', desc: 'No paywalls. Download any note instantly and track your contribution count on your dashboard.' },
];

const stats = [
  { label: 'Notes Shared', value: '10,000+' },
  { label: 'Students Helped', value: '5,000+' },
  { label: 'Subjects Covered', value: '200+' },
  { label: 'Downloads', value: '50,000+' },
];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-700/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left z-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-primary-900/50 text-primary-300 border border-primary-700/30 mb-6">
              <FiZap size={14} /> Free for all students
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Share & Discover{' '}
              <br className="hidden md:block" />
              <span className="text-gradient">Student Notes</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed">
              The ultimate portal for students to upload, discover, and download quality notes.
              Filter by branch and semester, rate your favorites, and build a reputation.
            </p>

            <div className="flex flex-col sm:flex-row items-center md:justify-start justify-center gap-4">
              {!user ? (
                <Link to="/register" className="btn-primary px-10 py-3.5 text-base">
                  Get Started Free <FiArrowRight />
                </Link>
              ) : (
                <Link to="/upload" className="btn-primary px-10 py-3.5 text-base gap-2">
                  <FiUpload /> Upload Notes
                </Link>
              )}
            </div>
          </div>

          {/* Animation Content */}
          <div className="flex-1 flex justify-center items-center w-full mt-12 md:mt-0 z-10">
            <BookAnimation />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-gradient mb-1">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              NoteVault is packed with features designed to make sharing and finding notes effortless.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card p-6 hover:border-slate-600 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-dark-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="card p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-violet-900/20" />
              <div className="relative">
                <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                <p className="text-slate-400 mb-8">Join thousands of students already sharing knowledge on NoteVault.</p>
                <Link to="/register" className="btn-primary px-10 py-3.5 text-base">
                  Create Free Account <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>© 2024 NoteVault — Student Notes Exchange Portal. Built with ❤️ for students.</p>
      </footer>
    </div>
  );
};

export default HomePage;
