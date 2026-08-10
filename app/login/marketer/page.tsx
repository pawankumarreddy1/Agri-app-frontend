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

const BUYER_TYPES = [
  { value: 'hostel', label: 'Hostel' },
  { value: 'pg', label: 'PG / Paying guest' },
  { value: 'big_market', label: 'Big market / Mandi' },
  { value: 'wholesale', label: 'Wholesale trader' },
  { value: 'mess', label: 'Institutional mess / canteen' },
  { value: 'caterer', label: 'Caterer / bulk kitchen' },
  { value: 'other', label: 'Other bulk buyer' },
]

export default function MarketerLoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [buyerType, setBuyerType] = useState('hostel')
  const [address, setAddress] = useState('')
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
      ? { phone, password, role: 'marketer' }
      : {
          name,
          phone,
          password,
          role: 'marketer',
          buyerType,
          businessName: businessName.trim() || undefined,
          address: address.trim() || undefined,
        }
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
      router.push('/marketers')
      return
    }
    switchMode('login')
    setName('')
    setBusinessName('')
    setAddress('')
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
          body: JSON.stringify({ phone, role: 'marketer', newPassword: password }),
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

    if (mode === 'register') {
      if (!name.trim()) { setError('Enter your name or contact person'); return }
      if (!buyerType) { setError('Select buyer type (hostel, PG, market…)'); return }
    }
    if (!password) { setError('Enter your password'); return }
    if (mode === 'register' && password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
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
        ? 'Bulk buyer login'
        : 'Register bulk buyer'

  const subtitle =
    mode === 'forgot'
      ? 'Enter your registered phone and choose a new password.'
      : mode === 'login'
        ? 'For hostels, PGs, big markets & wholesale kitchens.'
        : 'Tell us what you run so farmers know who is bidding.'

  return (
    <AuthShell role="marketer" title={title} subtitle={subtitle}>
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
          <>
            <AuthField label="Contact person name">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className={authInputClass}
                autoComplete="name"
                placeholder="e.g. Mess manager / owner"
              />
            </AuthField>
            <AuthField label="Buyer type *">
              <select
                value={buyerType}
                onChange={e => setBuyerType(e.target.value)}
                className={`${authInputClass} bg-white`}
              >
                {BUYER_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </AuthField>
            <AuthField label="Hostel / market / business name">
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className={authInputClass}
                placeholder="e.g. Green Valley Hostel, City Mandi Stall 12"
              />
            </AuthField>
            <AuthField label="Delivery / kitchen address">
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className={authInputClass}
                placeholder="Where bulk orders should be delivered"
              />
            </AuthField>
          </>
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

        <button type="button" onClick={handleSubmit} disabled={loading} className={roleCtaClass('marketer')}>
          {loading
            ? (mode === 'forgot' ? 'Updating…' : mode === 'login' ? 'Signing in…' : 'Creating…')
            : (mode === 'forgot' ? 'Update password' : mode === 'login' ? 'Login' : 'Register as bulk buyer')}
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
            Hostel, PG or market new here?{' '}
            <button type="button" onClick={() => switchMode('register')} className="text-leaf font-semibold hover:underline">
              Create bulk buyer account
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
    </AuthShell>
  )
}

