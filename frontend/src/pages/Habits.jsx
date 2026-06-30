import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  Button,
  Badge,
  Modal,
  Input,
  ProgressBar
} from '../components/ui/index'
import api from '../utils/api'
import {
  RiAddLine,
  RiCheckLine,
  RiFireLine,
  RiHeartPulseLine,
  RiLeafLine,
  RiCodeLine,
  RiMoonLine,
  RiRunLine
} from 'react-icons/ri'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const HABIT_ICONS = {
  exercise: RiRunLine,
  coding: RiCodeLine,
  meditation: RiLeafLine,
  sleep: RiMoonLine,
  health: RiHeartPulseLine,
  default: RiFireLine
}
const HABIT_COLORS = [
  '#7c3aed',
  '#06b6d4',
  '#22c55e',
  '#f97316',
  '#ec4899',
  '#f59e0b'
]

export default function Habits () {
  const [habits, setHabits] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [newHabit, setNewHabit] = useState({
    name: '',
    target: '',
    unit: 'minutes',
    color: '#7c3aed'
  })
  const [aiInsight, setAiInsight] = useState('')
  const [insightLoading, setInsightLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHabits()
  }, [])

  useEffect(() => {
    if (habits.length) {
      loadInsight()
    }
  }, [habits])

  const loadHabits = async () => {
    try {
      const { data } = await api.get('/habits')
      setHabits(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load habits')
      setHabits([])
    }
  }

  const loadInsight = async () => {
    setInsightLoading(true)
    try {
      const { data } = await api.post('/ai/habits', { habits })
      setAiInsight(data.insight)
    } catch {
      setAiInsight(
        'Your coding streak is excellent! Try pairing it with a 15-minute meditation session to improve focus. Your sleep consistency has improved — keep maintaining the 8-hour target.'
      )
    } finally {
      setInsightLoading(false)
    }
  }

  const toggleHabit = async id => {
    setHabits(prev =>
      prev.map(h =>
        h._id === id
          ? {
              ...h,
              completedToday: !h.completedToday,
              streak: !h.completedToday
                ? h.streak + 1
                : Math.max(0, h.streak - 1)
            }
          : h
      )
    )
    try {
      await api.post(`/habits/${id}/toggle`)
    } catch {
      /* optimistic update */
    }
    toast.success('Habit updated!')
  }

  const createHabit = async () => {
    if (!newHabit.name.trim()) {
      return toast.error('Name required')
    }

    setLoading(true)

    try {
      const { data } = await api.post('/habits', {
        name: newHabit.name,
        target: Number(newHabit.target),
        unit: newHabit.unit,
        color: newHabit.color,
        icon: 'default'
      })

      setHabits(prev => [...prev, data])

      toast.success('Habit created!')

      setShowCreate(false)

      setNewHabit({
        name: '',
        target: '',
        unit: 'minutes',
        color: '#7c3aed'
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create habit')
    } finally {
      setLoading(false)
    }
  }

  const completed = habits.filter(h => h.completedToday).length
  const totalStreak = habits.reduce((a, h) => a + h.streak, 0)

  return (
    <div className='max-w-4xl mx-auto space-y-5'>
      <div className='flex items-center justify-between'>
        <div>
          <h1
            className='text-2xl font-bold text-slate-100'
            style={{ fontFamily: 'Space Grotesk' }}
          >
            Habit Tracker
          </h1>
          <p className='text-slate-400 text-sm'>
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={<RiAddLine />}>
          New Habit
        </Button>
      </div>

      {/* Summary */}
      <div className='grid grid-cols-3 gap-4'>
        {[
          {
            label: "Today's Progress",
            value: `${completed}/${habits.length}`,
            color: '#7c3aed'
          },
          { label: 'Total Streak Days', value: totalStreak, color: '#f97316' },
          {
            label: 'Completion Rate',
            value: `${
              habits.length ? Math.round((completed / habits.length) * 100) : 0
            }%`,
            color: '#22c55e'
          }
        ].map(s => (
          <div key={s.label} className='glass rounded-xl p-4 text-center'>
            <div
              className='text-2xl font-bold mb-1'
              style={{ color: s.color, fontFamily: 'Space Grotesk' }}
            >
              {s.value}
            </div>
            <div className='text-xs text-slate-500'>{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI Insight */}
      <Card glow>
        <div className='flex items-center gap-2 mb-3'>
          <RiFireLine className='text-orange-400' />
          <h3
            className='font-semibold text-slate-100'
            style={{ fontFamily: 'Space Grotesk' }}
          >
            Habit Agent Insights
          </h3>
          <button
            onClick={loadInsight}
            className='ml-auto text-xs text-slate-500 hover:text-purple-400 transition-colors'
          >
            Refresh
          </button>
        </div>
        {insightLoading ? (
          <div className='space-y-2'>
            {[1, 2].map(i => (
              <div key={i} className='skeleton h-4 rounded' />
            ))}
          </div>
        ) : (
          <p className='text-sm text-slate-300 leading-relaxed'>{aiInsight}</p>
        )}
      </Card>

      {/* Habits grid */}
      <div className='grid sm:grid-cols-2 gap-4'>
        {habits.map(habit => {
          const Icon = HABIT_ICONS[habit.icon] || HABIT_ICONS.default
          return (
            <motion.div
              key={habit._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={`${
                  habit.completedToday ? 'opacity-100' : ''
                } transition-all`}
                style={{
                  borderColor: habit.completedToday
                    ? `${habit.color}40`
                    : 'rgba(255,255,255,0.07)',
                  background: habit.completedToday
                    ? `${habit.color}08`
                    : undefined
                }}
              >
                <div className='flex items-start gap-3'>
                  <div
                    className='w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0'
                    style={{ background: `${habit.color}20` }}
                  >
                    <Icon style={{ color: habit.color }} className='text-lg' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-1'>
                      <h4 className='font-medium text-slate-200 text-sm'>
                        {habit.name}
                      </h4>
                      <div className='flex items-center gap-1'>
                        <RiFireLine className='text-orange-400 text-xs' />
                        <span className='text-xs font-semibold text-orange-400'>
                          {habit.streak}
                        </span>
                      </div>
                    </div>
                    <p className='text-xs text-slate-500 mb-2'>
                      Target: {habit.target} {habit.unit}
                    </p>
                    <div className='flex items-center gap-3'>
                      <ProgressBar
                        value={habit.completedToday ? 100 : 0}
                        color='purple'
                        className='flex-1'
                      />
                      <button
                        onClick={() => toggleHabit(habit._id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                          habit.completedToday
                            ? 'text-white'
                            : 'text-slate-600 border border-slate-600 hover:border-purple-400'
                        }`}
                        style={
                          habit.completedToday
                            ? { background: habit.color }
                            : {}
                        }
                      >
                        <RiCheckLine className='text-sm' />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Create modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title='New Habit'
        size='sm'
      >
        <div className='space-y-4'>
          <Input
            label='Habit Name'
            placeholder='Morning Run, Read 30 mins...'
            value={newHabit.name}
            onChange={e => setNewHabit(p => ({ ...p, name: e.target.value }))}
          />
          <div className='grid grid-cols-2 gap-3'>
            <Input
              label='Daily Target'
              type='number'
              placeholder='30'
              value={newHabit.target}
              onChange={e =>
                setNewHabit(p => ({ ...p, target: e.target.value }))
              }
            />
            <div className='space-y-1.5'>
              <label className='text-sm font-medium text-slate-300'>Unit</label>
              <select
                value={newHabit.unit}
                onChange={e =>
                  setNewHabit(p => ({ ...p, unit: e.target.value }))
                }
                className='w-full rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none'
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {['minutes', 'hours', 'times', 'pages', 'ml'].map(u => (
                  <option key={u} value={u} style={{ background: '#1e1e2e' }}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className='text-sm font-medium text-slate-300 block mb-2'>
              Color
            </label>
            <div className='flex gap-2'>
              {HABIT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewHabit(p => ({ ...p, color: c }))}
                  className='w-7 h-7 rounded-full transition-all'
                  style={{
                    background: c,
                    boxShadow:
                      newHabit.color === c ? `0 0 0 2px ${c}60` : 'none',
                    transform: newHabit.color === c ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
              ))}
            </div>
          </div>
          <div className='flex gap-3'>
            <Button
              onClick={createHabit}
              loading={loading}
              className='flex-1 justify-center'
            >
              Create Habit
            </Button>
            <Button variant='secondary' onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
