import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiSparklingLine, RiRobot2Line, RiCalendarLine, RiBarChartLine, RiArrowRightLine, RiCheckLine } from 'react-icons/ri';

const features = [
  { icon: RiRobot2Line, title: 'Multi-Agent AI', desc: 'Seven specialized AI agents handle planning, priorities, rescue mode, habits, and reflections autonomously.' },
  { icon: RiCalendarLine, title: 'Smart Scheduling', desc: 'Calendar Agent auto-schedules tasks, meetings, breaks, and focus sessions without conflicts.' },
  { icon: RiBarChartLine, title: 'Deep Analytics', desc: 'Track productivity patterns, focus time, completion rates, and get AI-powered insights to improve.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: '#7c3aed' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: '#06b6d4' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-btn flex items-center justify-center">
            <RiSparklingLine className="text-white" />
          </div>
          <span className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk' }}>LifePilot AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">Sign in</Link>
          <Link to="/register" className="gradient-btn text-white text-sm font-medium px-4 py-2 rounded-xl">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-24 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
            <RiSparklingLine className="text-purple-400 text-sm" />
            <span className="text-xs text-slate-300 font-medium">Powered by Google Gemini AI</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
            Your Autonomous AI<br />
            <span className="gradient-text">Chief of Staff</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            LifePilot AI doesn't just remind you of deadlines — it proactively helps you complete tasks, 
            manages your schedule intelligently, and guides you to peak productivity every day.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register"
              className="gradient-btn text-white font-semibold px-8 py-3.5 rounded-xl flex items-center gap-2 text-base">
              Start Free <RiArrowRightLine />
            </Link>
            <Link to="/login" className="glass glass-hover text-slate-300 font-medium px-8 py-3.5 rounded-xl text-base">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center justify-center gap-12 mt-16">
          {[['7', 'AI Agents'], ['∞', 'Productivity'], ['100%', 'Autonomous']].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Space Grotesk' }}>{val}</div>
              <div className="text-xs text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-8 pb-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
              className="glass glass-hover rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.2)' }}>
                <Icon className="text-purple-400 text-lg" />
              </div>
              <h3 className="font-semibold text-slate-100 mb-2" style={{ fontFamily: 'Space Grotesk' }}>{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Agents list */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-12 glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: 'Space Grotesk' }}>
            7 Specialized <span className="gradient-text">AI Agents</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {['Planner Agent — Full roadmaps from one sentence', 'Priority Agent — Smart task ranking by context', 'Procrastination Agent — Predicts & prevents delays',
              'Rescue Agent — Emergency plans for last-minute deadlines', 'Calendar Agent — Auto-schedules your entire day', 'Habit Agent — Tracks & improves your routines',
              'Reflection Agent — Daily insights & tomorrow\'s plan'].map(item => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(124,58,237,0.05)' }}>
                <RiCheckLine className="text-purple-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
