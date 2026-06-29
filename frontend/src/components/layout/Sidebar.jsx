import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  RiDashboardLine, RiTaskLine, RiRobot2Line, RiCalendarLine,
  RiBarChartLine, RiHeartPulseLine, RiNotification3Line,
  RiSettings3Line, RiUser3Line, RiMicLine, RiLogoutBoxLine,
  RiSparklingLine, RiMenuLine, RiCloseLine
} from 'react-icons/ri';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/tasks', icon: RiTaskLine, label: 'Tasks' },
  { to: '/ai-planner', icon: RiRobot2Line, label: 'AI Planner' },
  { to: '/calendar', icon: RiCalendarLine, label: 'Calendar' },
  { to: '/analytics', icon: RiBarChartLine, label: 'Analytics' },
  { to: '/habits', icon: RiHeartPulseLine, label: 'Habits' },
  { to: '/voice', icon: RiMicLine, label: 'Voice AI' },
  { to: '/notifications', icon: RiNotification3Line, label: 'Notifications' },
];

const bottomItems = [
  { to: '/settings', icon: RiSettings3Line, label: 'Settings' },
  { to: '/profile', icon: RiUser3Line, label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col overflow-hidden"
      style={{ background: 'rgba(10,10,20,0.95)', borderRight: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 pt-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 gradient-btn">
          <RiSparklingLine className="text-white text-lg" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="font-bold text-base leading-tight" style={{ fontFamily: 'Space Grotesk' }}>LifePilot</div>
              <div className="text-xs" style={{ color: '#7c3aed' }}>AI Chief of Staff</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
        >
          {collapsed ? <RiMenuLine /> : <RiCloseLine />}
        </button>
      </div>

      {/* User info */}
      <div className="mx-3 mb-4 p-3 rounded-xl" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: 'white' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">{user?.name}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
              isActive
                ? 'bg-purple-600/20 text-purple-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }>
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-purple-400" />
                )}
                <Icon className="text-lg flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap">
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-0.5 border-t border-white/5 pt-2">
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
              isActive ? 'bg-purple-600/20 text-purple-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }>
            <Icon className="text-lg flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{label}</motion.span>}
            </AnimatePresence>
          </NavLink>
        ))}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
          <RiLogoutBoxLine className="text-lg flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Logout</motion.span>}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
