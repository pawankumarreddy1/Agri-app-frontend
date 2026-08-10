'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getApiBase, saveSession } from '../../lib/api'
import AuthShell, {
  AuthError,
  AuthField,
  authInputClass,
  roleCtaClass,
} from '../../components/AuthShell'

export default function AdminLoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setError('')
    if (!phone || !password) { setError('Phone and password are required'); return }
    setLoading(true)
    try {
      const API = getApiBase()
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, role: 'admin' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      saveSession(data.token, data.user)
      router.push('/admin')
    } catch {
      setError('Network error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      role="admin"
      title="Admin access only"
      subtitle="Restricted operations login. No public registration."
    >
      <div className="space-y-4">
        <AuthField label="Phone number">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className={authInputClass}
            autoComplete="username"
            placeholder="Admin phone"
          />
        </AuthField>
        <AuthField label="Password">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className={authInputClass}
            autoComplete="current-password"
            placeholder="Password"
          />
        </AuthField>

        <AuthError message={error} />

        <button type="button" onClick={handleLogin} disabled={loading} className={roleCtaClass('admin')}>
          {loading ? 'Signing in…' : 'Login as admin'}
        </button>

        <p className="text-center text-xs text-ink-muted pt-1">
          For authorized marketplace operators only.
        </p>
      </div>
    </AuthShell>
  )
}
