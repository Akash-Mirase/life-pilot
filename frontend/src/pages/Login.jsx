import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Input, Button } from '../components/ui/index'
import { RiSparklingLine, RiMailLine, RiLockLine } from 'react-icons/ri'
import toast from 'react-hot-toast'

export default function Login () {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    const result = await login(form.email, form.password)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div
      className='min-h-screen flex items-center justify-center p-4'
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className='fixed inset-0 pointer-events-none'>
        <div
          className='absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10'
          style={{ background: '#7c3aed' }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='w-full max-w-md relative z-10'
      >
        <div
          className='glass rounded-2xl p-8'
          style={{
            border: '1px solid rgba(124,58,237,0.2)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
          }}
        >
          <div className='text-center mb-8'>
            <div className='w-12 h-12 rounded-2xl gradient-btn flex items-center justify-center mx-auto mb-4'>
              <RiSparklingLine className='text-white text-xl' />
            </div>
            <h1
              className='text-2xl font-bold text-slate-100'
              style={{ fontFamily: 'Space Grotesk' }}
            >
              Welcome back
            </h1>
            <p className='text-slate-400 text-sm mt-1'>
              Sign in to your LifePilot account
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <Input
              label='Email'
              type='email'
              placeholder='you@example.com'
              icon={<RiMailLine />}
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              error={errors.email}
            />
            <Input
              label='Password'
              type='password'
              placeholder='••••••••'
              icon={<RiLockLine />}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              error={errors.password}
            />
            <Button
              type='submit'
              loading={loading}
              className='w-full justify-center py-3'
            >
              Sign In
            </Button>
          </form>

          <div className='mt-4 text-center'>
            <p className='text-sm text-slate-400'>
              Don't have an account?{' '}
              <Link
                to='/register'
                className='text-purple-400 hover:text-purple-300 font-medium'
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className='mt-5 pt-5 border-t border-white/8'>
            <p className='text-xs text-center text-slate-500 mb-3'>
              Demo credentials
            </p>
            <button
              onClick={() =>
                setForm({ email: 'demo@lifepilot.ai', password: 'demo1234' })
              }
              className='w-full text-xs glass glass-hover rounded-xl py-2 text-slate-400 transition-all'
            >
              Use demo@lifepilot.ai / demo1234
            </button>
          </div>
        </div>
        <p className='text-center mt-5 text-xs text-slate-600'>
          <Link to='/' className='hover:text-slate-400 transition-colors'>
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
