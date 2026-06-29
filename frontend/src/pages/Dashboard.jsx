import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTasks } from '../contexts/TaskContext'
import {
  Card,
  Badge,
  StatCard,
  ProgressBar,
  Skeleton
} from '../components/ui/index'
import api from '../utils/api'
import {
  RiCheckboxCircleLine,
  RiTimeLine,
  RiFlashlightLine,
  RiFireLine,
  RiRobot2Line,
  RiArrowRightLine,
  RiCalendarLine,
  RiAlertLine,
  RiSparklingLine
} from 'react-icons/ri'
import { format } from 'date-fns'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e'
}

export default function Dashboard () {
  const { user } = useAuth()
  const {
    tasks,
    fetchTasks,
    toggleComplete,
    loading: tasksLoading
  } = useTasks()
  const [analytics, setAnalytics] = useState(null)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetchTasks()
    loadAnalytics()
    loadAiSuggestion()
  }, [])

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics/summary')
      setAnalytics(data)
      setChartData(data.weeklyData || generateMockChart())
    } catch {
      setChartData(generateMockChart())
    }
  }

  const generateMockChart = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(d => ({
      day: d,
      completed: Math.floor(Math.random() * 8) + 1,
      focus: Math.floor(Math.random() * 5) + 1
    }))
  }

  const loadAiSuggestion = async () => {
    setSuggestionLoading(true)
    try {
      const { data } = await api.post('/ai/suggestion')
      setAiSuggestion(data.suggestion)
    } catch {
      setAiSuggestion(
        'Focus on your highest-priority tasks first thing in the morning. You tend to be most productive before 11 AM.'
      )
    } finally {
      setSuggestionLoading(false)
    }
  }

  const todayTasks = tasks.filter(t => {
    if (!t.deadline) return false
    const d = new Date(t.deadline)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  const pending = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)
  const urgentTasks = tasks
    .filter(t => !t.completed && t.priority === 'critical')
    .slice(0, 3)

  const productivityScore = tasks.length
    ? Math.round((completed.length / tasks.length) * 100)
    : 0

  const stagger = {
    container: { animate: { transition: { staggerChildren: 0.08 } } },
    item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }
  }

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1
            className='text-2xl font-bold text-slate-100'
            style={{ fontFamily: 'Space Grotesk' }}
          >
            Good{' '}
            {new Date().getHours() < 12
              ? 'morning'
              : new Date().getHours() < 17
              ? 'afternoon'
              : 'evening'}
            , {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className='text-slate-400 text-sm mt-1'>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Link
          to='/ai-planner'
          className='gradient-btn text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2'
        >
          <RiRobot2Line /> Ask AI
        </Link>
      </div>

      {/* Stats */}
      <motion.div
        variants={stagger.container}
        initial='initial'
        animate='animate'
        className='grid grid-cols-2 lg:grid-cols-4 gap-4'
      >
        {[
          {
            label: 'Tasks Today',
            value: todayTasks.length,
            icon: <RiCalendarLine />,
            color: 'purple'
          },
          {
            label: 'Pending',
            value: pending.length,
            icon: <RiTimeLine />,
            color: 'orange'
          },
          {
            label: 'Completed',
            value: completed.length,
            icon: <RiCheckboxCircleLine />,
            color: 'green'
          },
          {
            label: 'Productivity',
            value: `${productivityScore}%`,
            icon: <RiFlashlightLine />,
            color: 'cyan'
          }
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={stagger.item}>
            <StatCard {...stat} loading={tasksLoading} />
          </motion.div>
        ))}
      </motion.div>

      <div className='grid lg:grid-cols-3 gap-5'>
        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='lg:col-span-2'
        >
          <Card>
            <div className='flex items-center justify-between mb-5'>
              <h3
                className='font-semibold text-slate-100'
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Weekly Progress
              </h3>
              <Badge variant='purple'>This Week</Badge>
            </div>
            <ResponsiveContainer width='100%' height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id='gPurple' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#7c3aed' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#7c3aed' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='gCyan' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#06b6d4' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#06b6d4' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='rgba(255,255,255,0.05)'
                />
                <XAxis
                  dataKey='day'
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1e1e2e',
                    border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: 12,
                    color: '#f1f5f9'
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='completed'
                  stroke='#7c3aed'
                  fill='url(#gPurple)'
                  strokeWidth={2}
                  name='Completed'
                />
                <Area
                  type='monotone'
                  dataKey='focus'
                  stroke='#06b6d4'
                  fill='url(#gCyan)'
                  strokeWidth={2}
                  name='Focus Hrs'
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Productivity Score */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className='h-full'>
            <div className='flex items-center gap-2 mb-5'>
              <RiFireLine className='text-orange-400 text-lg' />
              <h3
                className='font-semibold text-slate-100'
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Score
              </h3>
            </div>
            <div className='flex items-center justify-center mb-6'>
              <div className='relative w-28 h-28'>
                <svg className='w-full h-full -rotate-90' viewBox='0 0 100 100'>
                  <circle
                    cx='50'
                    cy='50'
                    r='42'
                    fill='none'
                    stroke='rgba(255,255,255,0.1)'
                    strokeWidth='8'
                  />
                  <motion.circle
                    cx='50'
                    cy='50'
                    r='42'
                    fill='none'
                    stroke='url(#scoreGrad)'
                    strokeWidth='8'
                    strokeLinecap='round'
                    strokeDasharray={`${2.64 * productivityScore} ${
                      264 - 2.64 * productivityScore
                    }`}
                    initial={{ strokeDasharray: '0 264' }}
                    animate={{
                      strokeDasharray: `${2.64 * productivityScore} ${
                        264 - 2.64 * productivityScore
                      }`
                    }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id='scoreGrad' x1='0' y1='0' x2='1' y2='1'>
                      <stop offset='0%' stopColor='#7c3aed' />
                      <stop offset='100%' stopColor='#06b6d4' />
                    </linearGradient>
                  </defs>
                </svg>
                <div className='absolute inset-0 flex items-center justify-center flex-col'>
                  <span
                    className='text-2xl font-bold gradient-text'
                    style={{ fontFamily: 'Space Grotesk' }}
                  >
                    {productivityScore}
                  </span>
                  <span className='text-xs text-slate-500'>/ 100</span>
                </div>
              </div>
            </div>
            <div className='space-y-3'>
              {[
                {
                  label: 'Task Completion',
                  value: productivityScore,
                  color: 'purple'
                },
                {
                  label: 'On-Time Rate',
                  value: analytics?.onTimeRate || 72,
                  color: 'cyan'
                },
                {
                  label: 'Streak',
                  value: analytics?.streak || 5,
                  color: 'green',
                  suffix: ' days'
                }
              ].map(({ label, value, color, suffix }) => (
                <div key={label}>
                  <div className='flex justify-between text-xs text-slate-400 mb-1'>
                    <span>{label}</span>
                    <span className='font-medium text-slate-300'>
                      {value}
                      {suffix || '%'}
                    </span>
                  </div>
                  <ProgressBar
                    value={suffix ? value * 10 : value}
                    color={color}
                  />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className='grid lg:grid-cols-2 gap-5'>
        {/* AI Suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card glow>
            <div className='flex items-center gap-2 mb-4'>
              <div className='w-8 h-8 rounded-xl gradient-btn flex items-center justify-center'>
                <RiSparklingLine className='text-white text-sm' />
              </div>
              <h3
                className='font-semibold text-slate-100'
                style={{ fontFamily: 'Space Grotesk' }}
              >
                AI Suggestion
              </h3>
              <button
                onClick={loadAiSuggestion}
                className='ml-auto text-xs text-purple-400 hover:text-purple-300 transition-colors'
              >
                Refresh
              </button>
            </div>
            {suggestionLoading ? (
              <Skeleton lines={3} />
            ) : (
              <p className='text-sm text-slate-300 leading-relaxed'>
                {aiSuggestion}
              </p>
            )}
            <Link
              to='/ai-planner'
              className='mt-4 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium'
            >
              Open AI Planner <RiArrowRightLine />
            </Link>
          </Card>
        </motion.div>

        {/* Urgent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card>
            <div className='flex items-center gap-2 mb-4'>
              <RiAlertLine className='text-red-400 text-lg' />
              <h3
                className='font-semibold text-slate-100'
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Urgent Tasks
              </h3>
              <Link
                to='/tasks'
                className='ml-auto text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1'
              >
                All <RiArrowRightLine />
              </Link>
            </div>
            {tasksLoading ? (
              <Skeleton lines={3} className='mb-2' />
            ) : urgentTasks.length === 0 ? (
              <div className='text-center py-6'>
                <RiCheckboxCircleLine className='text-green-400 text-3xl mx-auto mb-2' />
                <p className='text-sm text-slate-400'>
                  No urgent tasks! Great work.
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {urgentTasks.map(task => (
                  <div
                    key={task._id}
                    className='flex items-center gap-3 p-3 rounded-xl glass-hover cursor-pointer'
                    style={{
                      background: 'rgba(239,68,68,0.05)',
                      border: '1px solid rgba(239,68,68,0.15)'
                    }}
                  >
                    <button
                      onClick={() => toggleComplete(task._id)}
                      className='w-5 h-5 rounded-full border-2 border-red-500 flex-shrink-0 hover:bg-red-500/20'
                    />
                    <div className='min-w-0'>
                      <p className='text-sm text-slate-200 font-medium truncate'>
                        {task.title}
                      </p>
                      {task.deadline && (
                        <p className='text-xs text-red-400'>
                          {format(new Date(task.deadline), 'MMM d, h:mm a')}
                        </p>
                      )}
                    </div>
                    <Badge variant='critical' className='ml-auto flex-shrink-0'>
                      Critical
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Today's tasks */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <div className='flex items-center gap-2 mb-4'>
            <RiCalendarLine className='text-purple-400 text-lg' />
            <h3
              className='font-semibold text-slate-100'
              style={{ fontFamily: 'Space Grotesk' }}
            >
              Today's Tasks
            </h3>
            <Badge variant='purple'>{todayTasks.length}</Badge>
          </div>
          {tasksLoading ? (
            <Skeleton lines={4} className='mb-2' />
          ) : todayTasks.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-slate-400 text-sm'>No tasks due today.</p>
              <Link
                to='/tasks'
                className='text-purple-400 text-sm mt-2 inline-flex items-center gap-1 hover:text-purple-300'
              >
                Add tasks <RiArrowRightLine />
              </Link>
            </div>
          ) : (
            <div className='grid sm:grid-cols-2 gap-2'>
              {todayTasks.map(task => (
                <div
                  key={task._id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    task.completed ? 'opacity-50' : 'glass-hover'
                  }`}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <button
                    onClick={() => toggleComplete(task._id)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-slate-600 hover:border-purple-400'
                    }`}
                  >
                    {task.completed && (
                      <RiCheckboxCircleLine className='text-white text-xs' />
                    )}
                  </button>
                  <div className='min-w-0 flex-1'>
                    <p
                      className={`text-sm font-medium truncate ${
                        task.completed
                          ? 'line-through text-slate-500'
                          : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className='text-xs text-slate-500'>
                      {task.category || 'General'}
                    </p>
                  </div>
                  <Badge variant={task.priority}>{task.priority}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
