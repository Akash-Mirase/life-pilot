import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../contexts/TaskContext';
import { Card, Badge, Button, Modal, Input, Select, Textarea } from '../components/ui/index';
import { RiAddLine, RiSearchLine, RiFilterLine, RiCheckboxCircleLine, RiDeleteBinLine, RiEditLine, RiTimeLine, RiAlertLine } from 'react-icons/ri';
import { format, isAfter, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const PRIORITIES = ['critical', 'high', 'medium', 'low'];
const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Finance', 'Social', 'Other'];

function TaskForm({ initial = {}, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', category: 'Work',
    deadline: '', estimatedTime: '', labels: '',
    ...initial, labels: initial.labels?.join(', ') || ''
  });

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    onSave({ ...form, labels: form.labels.split(',').map(l => l.trim()).filter(Boolean) });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input label="Title *" placeholder="What needs to be done?" value={form.title} onChange={set('title')} />
      <Textarea label="Description" placeholder="Add details..." rows={3} value={form.description} onChange={set('description')} />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Priority" value={form.priority} onChange={set('priority')}>
          {PRIORITIES.map(p => <option key={p} value={p} style={{ background: '#1e1e2e' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </Select>
        <Select label="Category" value={form.category} onChange={set('category')}>
          {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#1e1e2e' }}>{c}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Deadline" type="datetime-local" value={form.deadline} onChange={set('deadline')} />
        <Input label="Est. Time (hrs)" type="number" placeholder="2" min="0" step="0.5" value={form.estimatedTime} onChange={set('estimatedTime')} />
      </div>
      <Input label="Labels (comma-separated)" placeholder="frontend, urgent, review" value={form.labels} onChange={set('labels')} />
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1 justify-center">{initial._id ? 'Update Task' : 'Create Task'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const isOverdue = task.deadline && !task.completed && isAfter(new Date(), parseISO(task.deadline));

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      className={`glass rounded-xl p-4 transition-all ${task.completed ? 'opacity-60' : 'glass-hover'}`}
      style={{ border: isOverdue ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggle(task._id)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${task.completed ? 'bg-purple-500 border-purple-500' : `border-slate-600 hover:border-${task.priority === 'critical' ? 'red' : 'purple'}-400`}`}>
          {task.completed && <RiCheckboxCircleLine className="text-white text-xs" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</p>
            {isOverdue && <Badge variant="red">Overdue</Badge>}
          </div>
          {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Badge variant={task.priority}>{task.priority}</Badge>
            {task.category && <span className="text-xs text-slate-500">{task.category}</span>}
            {task.deadline && (
              <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                <RiTimeLine className="text-xs" />
                {format(parseISO(task.deadline), 'MMM d, h:mm a')}
              </span>
            )}
            {task.estimatedTime && <span className="text-xs text-slate-500">~{task.estimatedTime}h</span>}
          </div>
          {task.labels?.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {task.labels.map(l => <Badge key={l} variant="purple" className="text-xs">{l}</Badge>)}
            </div>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(task)} className="p-1.5 text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all">
            <RiEditLine className="text-sm" />
          </button>
          <button onClick={() => onDelete(task._id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
            <RiDeleteBinLine className="text-sm" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Tasks() {
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask, toggleComplete } = useTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  useEffect(() => { fetchTasks(); }, []);

  const handleCreate = async (data) => {
    setSaving(true);
    const r = await createTask(data);
    if (r?.success) setShowCreate(false);
    setSaving(false);
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    const r = await updateTask(editTask._id, data);
    if (r?.success) setEditTask(null);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    deleteTask(id);
  };

  const filtered = tasks
    .filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterStatus === 'pending' && t.completed) return false;
      if (filterStatus === 'completed' && !t.completed) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') return new Date(a.deadline || 0) - new Date(b.deadline || 0);
      if (sortBy === 'priority') return PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority);
      if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    critical: tasks.filter(t => t.priority === 'critical' && !t.completed).length,
    overdue: tasks.filter(t => t.deadline && !t.completed && isAfter(new Date(), parseISO(t.deadline))).length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100" style={{ fontFamily: 'Space Grotesk' }}>Task Manager</h1>
          <p className="text-slate-400 text-sm">{stats.total} tasks • {stats.completed} completed</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={<RiAddLine />}>New Task</Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: '#7c3aed' },
          { label: 'Done', value: stats.completed, color: '#22c55e' },
          { label: 'Critical', value: stats.critical, color: '#ef4444' },
          { label: 'Overdue', value: stats.overdue, color: '#f97316' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-3 text-center">
            <div className="text-xl font-bold" style={{ color: s.color, fontFamily: 'Space Grotesk' }}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm text-slate-200 placeholder-slate-500 outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>
          {[
            { value: filterStatus, onChange: setFilterStatus, options: [['all', 'All Status'], ['pending', 'Pending'], ['completed', 'Completed']] },
            { value: filterPriority, onChange: setFilterPriority, options: [['all', 'All Priority'], ...PRIORITIES.map(p => [p, p.charAt(0).toUpperCase() + p.slice(1)])] },
            { value: filterCategory, onChange: setFilterCategory, options: [['all', 'All Categories'], ...CATEGORIES.map(c => [c, c])] },
            { value: sortBy, onChange: setSortBy, options: [['deadline', 'Sort: Deadline'], ['priority', 'Sort: Priority'], ['created', 'Sort: Created']] },
          ].map(({ value, onChange, options }, i) => (
            <select key={i} value={value} onChange={e => onChange(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm text-slate-300 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {options.map(([v, l]) => <option key={v} value={v} style={{ background: '#1e1e2e' }}>{l}</option>)}
            </select>
          ))}
        </div>
      </Card>

      {/* Task list */}
      <div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <RiCheckboxCircleLine className="text-slate-600 text-5xl mx-auto mb-3" />
            <p className="text-slate-400">No tasks found</p>
            <Button onClick={() => setShowCreate(true)} className="mt-4" icon={<RiAddLine />}>Create Task</Button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {filtered.map(task => (
                <TaskCard key={task._id} task={task} onToggle={toggleComplete} onEdit={setEditTask} onDelete={handleDelete} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Task" size="md">
        <TaskForm onSave={handleCreate} onCancel={() => setShowCreate(false)} loading={saving} />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="md">
        {editTask && <TaskForm initial={editTask} onSave={handleUpdate} onCancel={() => setEditTask(null)} loading={saving} />}
      </Modal>
    </div>
  );
}
