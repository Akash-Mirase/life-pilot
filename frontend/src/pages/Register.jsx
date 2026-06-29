import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Input, Button } from '../components/ui/index'
import {
  RiSparklingLine,
  RiMailLine,
  RiLockLine,
  RiUser3Line
} from 'react-icons/ri'
import toast from 'react-hot-toast'

export default function Register () {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    if (!form.password || form.password.length < 6)
      e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) return
    const result = await register(form.name, form.email, form.password)
    if (result.success) {
      toast.success('Account created! Welcome to LifePilot!')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
  }

  const set = key => e => setForm(p => ({ ...p, [key]: e.target.value }))

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
              Create account
            </h1>
            <p className='text-slate-400 text-sm mt-1'>
              Start your journey with LifePilot AI
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <Input
              label='Full Name'
              placeholder='Alex Johnson'
              icon={<RiUser3Line />}
              value={form.name}
              onChange={set('name')}
              error={errors.name}
            />
            <Input
              label='Email'
              type='email'
              placeholder='you@example.com'
              icon={<RiMailLine />}
              value={form.email}
              onChange={set('email')}
              error={errors.email}
            />
            <Input
              label='Password'
              type='password'
              placeholder='Min. 6 characters'
              icon={<RiLockLine />}
              value={form.password}
              onChange={set('password')}
              error={errors.password}
            />
            <Input
              label='Confirm Password'
              type='password'
              placeholder='Repeat password'
              icon={<RiLockLine />}
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
            />
            <Button
              type='submit'
              loading={loading}
              className='w-full justify-center py-3'
            >
              Create Account
            </Button>
          </form>

          <p className='text-center mt-5 text-sm text-slate-400'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='text-purple-400 hover:text-purple-300 font-medium'
            >
              Sign in
            </Link>
          </p>
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
