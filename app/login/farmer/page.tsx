'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
// OTP temporarily disabled — restore when re-enabling phone verification:
// import { useRef } from 'react'
// import { auth } from '../../lib/firebase'
// import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { getApiBase, saveSession } from '../../lib/api'
import AuthShell, {
  AuthError,
  AuthField,
  SegmentButton,
  authInputClass,
  authSegment,
  roleCtaClass,
} from '../../components/AuthShell'

type Mode = 'login' | 'register' | 'forgot'

export default function FarmerLoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // const [step, setStep] = useState<'phone' | 'otp'>('phone')
  // const [otp, setOtp] = useState('')
  // const confirmationRef = useRef<ConfirmationResult | null>(null)
  // const recaptchaRef = useRef<RecaptchaVerifier | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
    setSuccess('')
    setPassword('')
    setConfirmPassword('')
  }

  // OTP handlers commented out — previously: setupRecaptcha, handleSendOtp, handleVerifyOtp
  // then call completeAuth() after Firebase confirm(otp).

  const completeAuth = async () => {
    const API = getApiBase()
    const url = mode === 'login' ? `${API}/api/login` : `${API}/api/register`
    const body = mode === 'login'
      ? { phone, password, role: 'farmer' }
      : { name, phone, password, role: 'farmer' }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Request failed')
      return
    }
    if (data.token && data.user) {
      saveSession(data.token, data.user)
      router.push('/farmers')
      return
    }
    switchMode('login')
    setName('')
    setSuccess('Account created! Please login.')
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    if (!phone || phone.length < 10) { setError('Enter a valid 10-digit phone number'); return }

    if (mode === 'forgot') {
      if (!password) { setError('Enter a new password'); return }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return }
      if (password !== confirmPassword) { setError('Passwords do not match'); return }
      setLoading(true)
      try {
        const API = getApiBase()
        const res = await fetch(`${API}/api/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, role: 'farmer', newPassword: password }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'Could not reset password'); return }
        setSuccess(data.message || 'Password updated. Please login.')
        setPassword('')
        setConfirmPassword('')
        setMode('login')
      } catch {
        setError('Network error. Is the backend running?')
      } finally {
        setLoading(false)
      }
      return
    }

    if (mode === 'register' && !name.trim()) { setError('Enter your name'); return }
    if (!password) { setError('Enter your password'); return }
    if (mode === 'register' && password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      // OTP bypassed — call login/register directly
      await completeAuth()
    } catch {
      setError('Network error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const title =
    mode === 'forgot'
      ? 'Reset password'
      : mode === 'login'
        ? 'Farmer login'
        : 'Create farmer account'

  const subtitle =
    mode === 'forgot'
      ? 'Enter your registered phone and choose a new password.'
      : mode === 'login'
        ? 'Phone and password to open your dashboard.'
        : 'Create an account with phone and password.'

  return (
    <AuthShell role="farmer" title={title} subtitle={subtitle}>
      {/* <div id="recaptcha-container" /> */}

      {mode !== 'forgot' && (
        <div className={authSegment}>
          <SegmentButton active={mode === 'login'} onClick={() => switchMode('login')}>
            Login
          </SegmentButton>
          <SegmentButton active={mode === 'register'} onClick={() => switchMode('register')}>
            Register
          </SegmentButton>
        </div>
      )}

      <div className="space-y-4">
        {mode === 'register' && (
          <AuthField label="Full name">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={authInputClass}
              autoComplete="name"
              placeholder="Your name"
            />
          </AuthField>
        )}

        <AuthField label="Phone number">
          <div className="flex gap-2">
            <span className="flex items-center px-3 rounded-md border border-[var(--line)] bg-leaf-soft/40 text-ink-muted text-sm font-medium">
              +91
            </span>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className={authInputClass}
              autoComplete="tel"
              placeholder="10-digit number"
              maxLength={10}
            />
          </div>
        </AuthField>

        <AuthField label={mode === 'forgot' ? 'New password' : 'Password'}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className={authInputClass}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder={mode === 'login' ? 'Your password' : 'At least 6 characters'}
          />
        </AuthField>

        {mode === 'forgot' && (
          <AuthField label="Confirm new password">
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className={authInputClass}
              autoComplete="new-password"
              placeholder="Re-enter new password"
            />
          </AuthField>
        )}

        <AuthError message={error} />
        {success && (
          <p className="text-sm text-leaf bg-leaf-soft/60 border border-leaf/20 px-3 py-2.5 rounded-md">
            {success}
          </p>
        )}

        <button type="button" onClick={handleSubmit} disabled={loading} className={roleCtaClass('farmer')}>
          {loading
            ? (mode === 'forgot' ? 'Updating…' : mode === 'login' ? 'Signing in…' : 'Creating…')
            : (mode === 'forgot' ? 'Update password' : mode === 'login' ? 'Login' : 'Register')}
        </button>

        {mode === 'login' && (
          <button
            type="button"
            onClick={() => switchMode('forgot')}
            className="w-full text-sm text-leaf font-medium hover:underline py-1"
          >
            Forgot password?
          </button>
        )}
      </div>

      <p className="text-center text-sm text-ink-muted mt-6">
        {mode === 'forgot' ? (
          <>
            Remembered it?{' '}
            <button type="button" onClick={() => switchMode('login')} className="text-leaf font-semibold hover:underline">
              Back to login
            </button>
          </>
        ) : mode === 'login' ? (
          <>
            New here?{' '}
            <button type="button" onClick={() => switchMode('register')} className="text-leaf font-semibold hover:underline">
              Create account
            </button>
          </>
        ) : (
          <>
            Already registered?{' '}
            <button type="button" onClick={() => switchMode('login')} className="text-leaf font-semibold hover:underline">
              Sign in
            </button>
          </>
        )}
      </p>

      {/*
      OTP UI (disabled): after phone step show 6-digit field, Verify & login/register,
      resend OTP via handleSendOtp / handleVerifyOtp above.
      */}
    </AuthShell>
  )
}
