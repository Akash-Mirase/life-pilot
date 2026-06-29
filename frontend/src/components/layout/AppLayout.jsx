import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 ml-60 p-6 overflow-auto min-h-screen"
        style={{ marginLeft: '240px' }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
