import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { authMessage, useAuth } from '../../context/AuthContext'
import Snowfall from '../../components/Snowfall'
import { Flake } from '../../components/Logo'

export default function Login() {
  const { loading, user, isAdmin, login, resetPassword } = useAuth()
  const { state } = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  if (!loading && user && isAdmin) return <Navigate to={state?.from || '/admin'} replace />

  const submit = async (e) => {
    e.preventDefault(); setError(''); setInfo('')
    if (!email.trim() || !password) { setError('Enter your email and password.'); return }
    setBusy(true)
    try { await login(email.trim(), password) } catch (err) { setError(authMessage(err)); setBusy(false) }
  }
  const reset = async () => {
    setError(''); setInfo('')
    if (!email.trim()) { setError('Enter your email first, then select Forgot password.'); return }
    try { await resetPassword(email.trim()); setInfo('If that email belongs to an administrator, a reset link is on its way.') }
    catch (err) { setError(authMessage(err)) }
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-5 py-10">
      <Snowfall />
      <div className="glass relative z-10 w-full max-w-md p-8">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-winter ring-1 ring-icy/40"><Flake className="h-7 w-7" /></span><h1 className="text-3xl font-semibold text-white">Administrator login</h1></div>
        <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
          <div>
            <label htmlFor="em" className="mb-1.5 block text-sm font-semibold text-icy">Email</label>
            <input id="em" type="email" autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="pw" className="mb-1.5 block text-sm font-semibold text-icy">Password</label>
            <input id="pw" type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-500/20 px-3 py-2 text-sm text-red-100">{error}</p>}
          {info && <p role="status" className="rounded-xl bg-white/10 px-3 py-2 text-sm text-icy">{info}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{busy ? 'Signing in' : 'Log in'}</button>
        </form>
        <div className="mt-5 flex justify-between text-sm">
          <button type="button" onClick={reset} className="text-icy underline-offset-4 hover:text-white hover:underline">Forgot password?</button>
          <Link to="/" className="text-icy underline-offset-4 hover:text-white hover:underline">Back to site</Link>
        </div>
      </div>
    </main>
  )
}
