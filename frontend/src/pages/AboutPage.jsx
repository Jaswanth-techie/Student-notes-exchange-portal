import { FiInfo, FiCode, FiUsers, FiBookOpen } from 'react-icons/fi';

const AboutPage = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold animate-slide-up">
            About <span className="text-gradient">NoteVault</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
            Built by students, for students. We believe that quality education materials should be accessible to everyone, everywhere.
          </p>
        </div>

        {/* Mission Section */}
        <div className="card p-8 md:p-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary-900/30 flex items-center justify-center">
              <FiInfo className="text-primary-400 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold">Our Mission</h2>
          </div>
          <p className="text-slate-300 leading-relaxed text-lg">
            NoteVault was created to solve a simple problem: finding reliable, branch-specific, and high-quality college notes is too difficult. We wanted to build a centralized, open platform where students can seamlessly exchange their knowledge, textbooks, and lecture notes without paywalls or intrusive ads.
          </p>
        </div>

        {/* Core Values */}
        <div className="grid md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="card-hover p-6">
            <FiUsers className="text-violet-400 text-3xl mb-4" />
            <h3 className="text-xl font-bold mb-2">Community Driven</h3>
            <p className="text-slate-400">Powered by the contributions of students across all engineering branches.</p>
          </div>
          <div className="card-hover p-6">
            <FiBookOpen className="text-emerald-400 text-3xl mb-4" />
            <h3 className="text-xl font-bold mb-2">Open Access</h3>
            <p className="text-slate-400">Free to download, free to share. Education should have no barriers.</p>
          </div>
          <div className="card-hover p-6">
            <FiCode className="text-amber-400 text-3xl mb-4" />
            <h3 className="text-xl font-bold mb-2">Modern Tech</h3>
            <p className="text-slate-400">Built using the modern MERN stack with a focus on speed and design.</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center py-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <p className="text-slate-500 italic">
            "Knowledge grows when shared."
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
