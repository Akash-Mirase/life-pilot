import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';

export function Card({ children, className = '', glow = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 glass ${glow ? 'glow' : ''} ${onClick ? 'cursor-pointer glass-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const styles = {
    default: 'bg-white/10 text-slate-300',
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
    purple: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    green: 'bg-green-500/20 text-green-300 border border-green-500/30',
    red: 'bg-red-500/20 text-red-300 border border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Button({ children, onClick, variant = 'primary', size = 'md', loading = false, disabled = false, className = '', type = 'button', icon }) {
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    primary: 'gradient-btn text-white font-medium',
    secondary: 'glass glass-hover text-slate-300 font-medium',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-medium',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
    outline: 'border border-purple-500/50 text-purple-300 hover:bg-purple-500/10',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-xl transition-all duration-200 ${sizes[size]} ${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="text-base">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

export function Skeleton({ className = '', lines = 1 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton rounded-lg h-4 ${className}`} />
      ))}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className={`w-full ${sizes[size]} glass rounded-2xl overflow-hidden`}
            style={{ border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <h3 className="text-lg font-semibold text-slate-100" style={{ fontFamily: 'Space Grotesk' }}>{title}</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <RiCloseLine className="text-xl" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Input({ label, error, icon, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">{icon}</span>}
        <input
          {...props}
          className={`w-full rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 transition-all outline-none ${icon ? 'pl-9' : ''} ${className}`}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
          onBlur={(e) => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <select
        {...props}
        className={`w-full rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-all outline-none ${className}`}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <textarea
        {...props}
        className={`w-full rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 transition-all outline-none resize-none ${className}`}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
        }}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function ProgressBar({ value, max = 100, color = 'purple', className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    purple: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
    cyan: 'linear-gradient(90deg, #06b6d4, #0ea5e9)',
    green: 'linear-gradient(90deg, #22c55e, #16a34a)',
    orange: 'linear-gradient(90deg, #f97316, #ea580c)',
    red: 'linear-gradient(90deg, #ef4444, #dc2626)',
  };
  return (
    <div className={`h-1.5 rounded-full bg-white/10 overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: colors[color] || colors.purple }}
      />
    </div>
  );
}

export function StatCard({ label, value, change, icon, color = 'purple', loading = false }) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg`}
             style={{ background: color === 'purple' ? 'rgba(124,58,237,0.2)' : color === 'cyan' ? 'rgba(6,182,212,0.2)' : color === 'green' ? 'rgba(34,197,94,0.2)' : 'rgba(249,115,22,0.2)',
                      color: color === 'purple' ? '#a78bfa' : color === 'cyan' ? '#67e8f9' : color === 'green' ? '#86efac' : '#fdba74' }}>
          {icon}
        </div>
        {change !== undefined && (
          <Badge variant={change >= 0 ? 'green' : 'red'}>{change >= 0 ? '+' : ''}{change}%</Badge>
        )}
      </div>
      {loading ? <Skeleton className="h-8 w-24 mb-1" /> : (
        <div className="text-2xl font-bold text-slate-100 mb-1" style={{ fontFamily: 'Space Grotesk' }}>{value}</div>
      )}
      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</div>
    </Card>
  );
}
