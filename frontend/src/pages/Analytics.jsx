import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, StatCard } from '../components/ui/index';
import { useTasks } from '../contexts/TaskContext';
import api from '../utils/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { RiBarChartLine, RiTimeLine, RiTrophyLine, RiCalendarLine } from 'react-icons/ri';
import { format, subDays } from 'date-fns';

const COLORS_PIE = ['#7c3aed', '#06b6d4', '#22c55e', '#f97316'];

const generateWeekData = (tasks) => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayTasks = tasks.filter(t => {
      const created = new Date(t.createdAt);
      return created.toDateString() === date.toDateString();
    });
    return {
      day: format(date, 'EEE'),
      total: dayTasks.length,
      completed: dayTasks.filter(t => t.completed).length,
      focus: Math.floor(Math.random() * 5) + 1,
    };
  });
};

export default function Analytics() {
  const { tasks, fetchTasks } = useTasks();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchTasks().then(() => setLoading(false));
  }, []);

  const weekData = generateWeekData(tasks);

  const categoryData = Object.entries(
    tasks.reduce((acc, t) => { acc[t.category || 'Other'] = (acc[t.category || 'Other'] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const priorityData = ['critical', 'high', 'medium', 'low'].map(p => ({
    priority: p.charAt(0).toUpperCase() + p.slice(1),
    total: tasks.filter(t => t.priority === p).length,
    completed: tasks.filter(t => t.priority === p && t.completed).length,
  }));

  const completionRate = tasks.length ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;
  const totalFocusHrs = weekData.reduce((a, d) => a + d.focus, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100" style={{ fontFamily: 'Space Grotesk' }}>Analytics</h1>
          <p className="text-slate-400 text-sm">Track your productivity patterns</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${period === p ? 'gradient-btn text-white' : 'glass text-slate-400'}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Completion Rate" value={`${completionRate}%`} icon={<RiTrophyLine />} color="purple" />
        <StatCard label="Total Tasks" value={tasks.length} icon={<RiCalendarLine />} color="cyan" />
        <StatCard label="Focus Hours" value={totalFocusHrs} icon={<RiTimeLine />} color="green" />
        <StatCard label="Avg/Day" value={(tasks.length / 7).toFixed(1)} icon={<RiBarChartLine />} color="orange" />
      </div>

      {/* Area chart */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-100" style={{ fontFamily: 'Space Grotesk' }}>Task Activity</h3>
          <Badge variant="purple">7 days</Badge>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weekData}>
            <defs>
              <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gComp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, color: '#f1f5f9' }} />
            <Legend />
            <Area type="monotone" dataKey="total" stroke="#7c3aed" fill="url(#gTotal)" strokeWidth={2} name="Total" />
            <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="url(#gComp)" strokeWidth={2} name="Completed" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Priority breakdown */}
        <Card>
          <h3 className="font-semibold text-slate-100 mb-5" style={{ fontFamily: 'Space Grotesk' }}>Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="priority" type="category" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, color: '#f1f5f9' }} />
              <Bar dataKey="total" fill="rgba(124,58,237,0.3)" radius={4} name="Total" />
              <Bar dataKey="completed" fill="#7c3aed" radius={4} name="Done" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category pie */}
        <Card>
          <h3 className="font-semibold text-slate-100 mb-5" style={{ fontFamily: 'Space Grotesk' }}>Category Distribution</h3>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#64748b' }}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, color: '#f1f5f9' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Focus time */}
      <Card>
        <h3 className="font-semibold text-slate-100 mb-5" style={{ fontFamily: 'Space Grotesk' }}>Focus Time (hours)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, color: '#f1f5f9' }} />
            <Bar dataKey="focus" fill="#06b6d4" radius={4} name="Focus Hours" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
