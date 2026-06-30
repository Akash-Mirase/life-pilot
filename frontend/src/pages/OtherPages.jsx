import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { Card, Button, Badge } from '../components/ui/index'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTasks } from '../contexts/TaskContext'
import api from '../utils/api'
import {
  RiMicLine,
  RiMicOffLine,
  RiSendPlane2Line,
  RiVolumeUpLine,
  RiNotification3Line,
  RiSettings3Line,
  RiUser3Line
} from 'react-icons/ri'
import toast from 'react-hot-toast'

// ── Voice Page ──────────────────────────────────────────────────────────────
export function Voice () {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const recognitionRef = useRef(null)

  const startListening = () => {
    if (
      !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      return toast.error('Speech recognition not supported in this browser')
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.continuous = false
    r.interimResults = true
    r.lang = 'en-US'
    r.onresult = e => {
      const t = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('')
      setTranscript(t)
    }
    r.onend = () => setListening(false)
    r.start()
    recognitionRef.current = r
    setListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const sendCommand = async text => {
    const cmd = text || transcript
    if (!cmd.trim()) return
    setLoading(true)
    setHistory(p => [...p, { role: 'user', text: cmd }])
    try {
      const { data } = await api.post('/ai/voice', { command: cmd })
      const res = data.response
      setResponse(res)
      setHistory(p => [...p, { role: 'assistant', text: res }])
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(res.slice(0, 200))
        u.rate = 0.95
        speechSynthesis.speak(u)
      }
    } catch {
      const fallback = `I heard: "${cmd}". Voice commands are powered by your AI assistant. Try: "What should I focus on today?" or "Add a task to review code tomorrow."`
      setResponse(fallback)
      setHistory(p => [...p, { role: 'assistant', text: fallback }])
    } finally {
      setLoading(false)
      setTranscript('')
    }
  }

  return (
    <div className='max-w-2xl mx-auto space-y-5'>
      <div>
        <h1
          className='text-2xl font-bold text-slate-100'
          style={{ fontFamily: 'Space Grotesk' }}
        >
          Voice AI
        </h1>
        <p className='text-slate-400 text-sm'>
          Speak to your AI Chief of Staff
        </p>
      </div>

      <Card glow>
        <div className='text-center py-8 space-y-6'>
          <motion.button
            onClick={listening ? stopListening : startListening}
            whileTap={{ scale: 0.95 }}
            className='relative w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all'
            style={{
              background: listening
                ? 'rgba(239,68,68,0.2)'
                : 'rgba(124,58,237,0.2)',
              border: `2px solid ${listening ? '#ef4444' : '#7c3aed'}`
            }}
          >
            {listening && (
              <motion.div
                className='absolute inset-0 rounded-full border-2 border-red-500'
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            {listening ? (
              <RiMicOffLine className='text-red-400 text-3xl' />
            ) : (
              <RiMicLine className='text-purple-400 text-3xl' />
            )}
          </motion.button>

          <div>
            <p className='text-sm font-medium text-slate-300'>
              {listening ? 'Listening...' : 'Tap to speak'}
            </p>
            {transcript && (
              <p className='text-xs text-slate-500 mt-1 italic'>
                "{transcript}"
              </p>
            )}
          </div>

          {transcript && !listening && (
            <Button
              onClick={() => sendCommand(transcript)}
              loading={loading}
              icon={<RiSendPlane2Line />}
            >
              Send Command
            </Button>
          )}

          <div className='flex flex-wrap justify-center gap-2'>
            {[
              'What should I focus on?',
              'Plan my day',
              'Any urgent tasks?',
              'How productive was I?'
            ].map(cmd => (
              <button
                key={cmd}
                onClick={() => {
                  setTranscript(cmd)
                  sendCommand(cmd)
                }}
                className='glass glass-hover rounded-full px-3 py-1.5 text-xs text-slate-400'
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>
      </Card>

      {response && (
        <Card>
          <div className='flex items-center gap-2 mb-3'>
            <RiVolumeUpLine className='text-purple-400' />
            <h3 className='font-semibold text-slate-100 text-sm'>
              AI Response
            </h3>
          </div>
          <p className='text-sm text-slate-300 leading-relaxed'>{response}</p>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <h3 className='font-semibold text-slate-100 text-sm mb-3'>
            Conversation
          </h3>
          <div className='space-y-2 max-h-60 overflow-y-auto'>
            {history.map((h, i) => (
              <div
                key={i}
                className={`flex ${
                  h.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-xl px-3 py-2 text-xs max-w-xs ${
                    h.role === 'user'
                      ? 'gradient-btn text-white'
                      : 'glass text-slate-300'
                  }`}
                >
                  {h.text}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ── Notifications Page ───────────────────────────────────────────────────────
// Notifications are derived from real task data (TaskContext) instead of a
// hardcoded fake list. No backend "notifications" endpoint exists yet, so
// this builds them client-side from tasks that are already loaded — overdue,
// due soon, and recently completed — which keeps the data honest and live.
export function Notifications () {
  const { tasks, fetchTasks, loading } = useTasks()
  const [readIds, setReadIds] = useState(() => new Set())

  useEffect(() => {
    fetchTasks()
  }, [])

  const notifications = (() => {
    if (!tasks || tasks.length === 0) return []

    const now = new Date()
    const items = []

    for (const t of tasks) {
      const id = t._id || t.id
      const deadline = t.deadline ? new Date(t.deadline) : null

      if (!t.completed && deadline && deadline < now) {
        items.push({
          id: `overdue-${id}`,
          type: 'warning',
          title: 'Overdue',
          message: `"${t.title}" was due ${formatDistanceToNow(deadline, { addSuffix: true })}`,
          time: deadline
        })
      } else if (
        !t.completed &&
        deadline &&
        deadline.getTime() - now.getTime() < 24 * 60 * 60 * 1000
      ) {
        items.push({
          id: `due-soon-${id}`,
          type: 'warning',
          title: 'Deadline approaching',
          message: `"${t.title}" is due ${formatDistanceToNow(deadline, { addSuffix: true })}`,
          time: deadline
        })
      }

      if (t.completed && t.completedAt) {
        const completedAt = new Date(t.completedAt)
        if (now.getTime() - completedAt.getTime() < 24 * 60 * 60 * 1000) {
          items.push({
            id: `done-${id}`,
            type: 'success',
            title: 'Task completed',
            message: `You completed "${t.title}"`,
            time: completedAt
          })
        }
      }

      if (!t.completed && t.priority === 'critical') {
        items.push({
          id: `critical-${id}`,
          type: 'ai',
          title: 'Critical priority',
          message: `"${t.title}" is marked critical and still open`,
          time: new Date(t.updatedAt || t.createdAt || now)
        })
      }
    }

    return items.sort((a, b) => b.time - a.time)
  })()

  const markAll = () => setReadIds(new Set(notifications.map(n => n.id)))
  const unread = notifications.filter(n => !readIds.has(n.id)).length

  const typeStyles = {
    warning: {
      bg: 'rgba(249,115,22,0.1)',
      border: 'rgba(249,115,22,0.2)',
      icon: '⚠️'
    },
    ai: {
      bg: 'rgba(124,58,237,0.1)',
      border: 'rgba(124,58,237,0.2)',
      icon: '🤖'
    },
    success: {
      bg: 'rgba(34,197,94,0.1)',
      border: 'rgba(34,197,94,0.2)',
      icon: '✅'
    },
    info: {
      bg: 'rgba(6,182,212,0.1)',
      border: 'rgba(6,182,212,0.2)',
      icon: 'ℹ️'
    }
  }

  return (
    <div className='max-w-2xl mx-auto space-y-5'>
      <div className='flex items-center justify-between'>
        <div>
          <h1
            className='text-2xl font-bold text-slate-100'
            style={{ fontFamily: 'Space Grotesk' }}
          >
            Notifications
          </h1>
          <p className='text-slate-400 text-sm'>
            {loading
              ? 'Loading...'
              : `${unread} unread`}
          </p>
        </div>
        {unread > 0 && (
          <Button variant='ghost' size='sm' onClick={markAll}>
            Mark all read
          </Button>
        )}
      </div>

      {!loading && notifications.length === 0 && (
        <Card>
          <div className='text-center py-8 text-slate-500 text-sm'>
            <RiNotification3Line className='text-2xl mx-auto mb-2 opacity-50' />
            You're all caught up — no overdue, upcoming, or critical tasks right now.
          </div>
        </Card>
      )}

      <div className='space-y-3'>
        {notifications.map(n => {
          const style = typeStyles[n.type]
          const read = readIds.has(n.id)
          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setReadIds(p => new Set(p).add(n.id))}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                !read ? 'glass-hover' : 'opacity-60'
              }`}
              style={{
                background: read ? 'rgba(255,255,255,0.03)' : style.bg,
                border: `1px solid ${
                  read ? 'rgba(255,255,255,0.07)' : style.border
                }`
              }}
            >
              <div className='flex items-start gap-3'>
                <span className='text-xl flex-shrink-0'>{style.icon}</span>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium text-slate-200'>
                      {n.title}
                    </p>
                    {!read && (
                      <div className='w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0' />
                    )}
                  </div>
                  <p className='text-xs text-slate-400 mt-0.5'>{n.message}</p>
                  <p className='text-xs text-slate-600 mt-1'>
                    {formatDistanceToNow(n.time, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Settings Page ────────────────────────────────────────────────────────────
export function Settings () {
  const { user, updateUser } = useAuth()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    aiSuggestions: true,
    weeklyReport: true,
    workStartHour: 9,
    workEndHour: 18,
    theme: 'dark',
    language: 'en'
  })

  const toggle = key => setSettings(p => ({ ...p, [key]: !p[key] }))

  return (
    <div className='max-w-2xl mx-auto space-y-5'>
      <div>
        <h1
          className='text-2xl font-bold text-slate-100'
          style={{ fontFamily: 'Space Grotesk' }}
        >
          Settings
        </h1>
        <p className='text-slate-400 text-sm'>
          Customize your LifePilot experience
        </p>
      </div>

      {[
        {
          title: 'Notifications',
          items: [
            {
              key: 'emailNotifications',
              label: 'Email notifications',
              desc: 'Receive updates via email'
            },
            {
              key: 'pushNotifications',
              label: 'Push notifications',
              desc: 'Browser notifications for deadlines'
            },
            {
              key: 'aiSuggestions',
              label: 'AI suggestions',
              desc: 'Proactive suggestions from AI agents'
            },
            {
              key: 'weeklyReport',
              label: 'Weekly report',
              desc: 'Summary of your productivity each week'
            }
          ]
        }
      ].map(section => (
        <Card key={section.title}>
          <h3
            className='font-semibold text-slate-100 mb-4'
            style={{ fontFamily: 'Space Grotesk' }}
          >
            {section.title}
          </h3>
          <div className='space-y-4'>
            {section.items.map(item => (
              <div key={item.key} className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-slate-200'>
                    {item.label}
                  </p>
                  <p className='text-xs text-slate-500'>{item.desc}</p>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  className={`relative w-10 h-5 rounded-full transition-all ${
                    settings[item.key] ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      settings[item.key] ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card>
        <h3
          className='font-semibold text-slate-100 mb-4'
          style={{ fontFamily: 'Space Grotesk' }}
        >
          Work Hours
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          {[
            ['workStartHour', 'Start Hour'],
            ['workEndHour', 'End Hour']
          ].map(([key, label]) => (
            <div key={key}>
              <label className='text-sm text-slate-400 block mb-1'>
                {label}
              </label>
              <input
                type='number'
                min='0'
                max='23'
                value={settings[key]}
                onChange={e =>
                  setSettings(p => ({ ...p, [key]: parseInt(e.target.value) }))
                }
                className='w-full rounded-xl px-3 py-2 text-sm text-slate-200 outline-none'
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
            </div>
          ))}
        </div>
      </Card>

      <Button
        className='w-full justify-center'
        onClick={() => toast.success('Settings saved!')}
      >
        Save Settings
      </Button>
    </div>
  )
}

// ── Profile Page ────────────────────────────────────────────────────────────
export function Profile () {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: ''
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/auth/profile', form)
      updateUser(form)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='max-w-2xl mx-auto space-y-5'>
      <div>
        <h1
          className='text-2xl font-bold text-slate-100'
          style={{ fontFamily: 'Space Grotesk' }}
        >
          Profile
        </h1>
        <p className='text-slate-400 text-sm'>Manage your account</p>
      </div>

      <Card>
        <div className='flex items-center gap-5 mb-6 pb-5 border-b border-white/8'>
          <div
            className='w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold'
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: 'white',
              fontFamily: 'Space Grotesk'
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div
              className='text-lg font-semibold text-slate-100'
              style={{ fontFamily: 'Space Grotesk' }}
            >
              {user?.name}
            </div>
            <div className='text-sm text-slate-400'>{user?.email}</div>
            <Badge variant='purple' className='mt-1'>
              Pro Member
            </Badge>
          </div>
        </div>

        <div className='space-y-4'>
          {[
            {
              label: 'Full Name',
              key: 'name',
              type: 'text',
              placeholder: 'Your name'
            },
            {
              label: 'Email',
              key: 'email',
              type: 'email',
              placeholder: 'you@example.com'
            },
            {
              label: 'Bio',
              key: 'bio',
              type: 'text',
              placeholder: 'Tell us about yourself...'
            }
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className='text-sm font-medium text-slate-300 block mb-1.5'>
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                placeholder={placeholder}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className='w-full rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none'
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
            </div>
          ))}
          <Button
            onClick={save}
            loading={saving}
            className='w-full justify-center'
          >
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  )
}