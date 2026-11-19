import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Lock, CalendarDays, Users, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import Page from '../components/Page'
import EmptyState from '../components/EmptyState'
import { getGroupPreview, verifyGroupPassword } from '../lib/api'
import { getSession, saveSession } from '../lib/session'
import { formatDate, errorMessage } from '../lib/format'

export default function GroupAccess() {
  const { groupCode } = useParams()
  const nav = useNavigate()
  const { state } = useLocation()
  const [preview, setPreview] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(state?.expired ? 'Your access expired. Enter the password again.' : '')

  useEffect(() => {
    if (getSession(groupCode)) { nav(`/group/${groupCode}/dashboard`, { replace: true }); return }
    let off = false
    getGroupPreview(groupCode).then((p) => !off && setPreview(p)).catch((e) => !off && setLoadError(errorMessage(e)))
    return () => { off = true }
  }, [groupCode, nav])

  const submit = async (e) => {
    e.preventDefault()
    if (!password) { setError('Enter the group password.'); return }
    setBusy(true); setError('')
    try {
      const { token, expiresAt } = await verifyGroupPassword(groupCode, password)
      saveSession(groupCode, token, expiresAt)
      nav(`/group/${groupCode}/dashboard`)
    } catch (err) {
      setError(errorMessage(err)); setBusy(false)
    }
  }

  return (
    <Page className="container-w py-14">
      <Link to="/find-group" className="inline-flex items-center gap-2 text-icy hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Search for another group</Link>
      <div className="mx-auto mt-8 max-w-md">
        {loadError ? (
          <EmptyState title="Group not available" text={loadError}><Link to="/find-group" className="btn-primary">Find your group</Link></EmptyState>
        ) : !preview ? (
          <div className="glass grid h-72 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-icy" aria-label="Loading group" /></div>
        ) : (
          <div className="card-snow overflow-hidden">
            <div className="bg-gradient-to-br from-winter to-royal p-7 text-white">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Lock className="h-6 w-6" aria-hidden="true" /></span>
              <h1 className="mt-4 text-3xl font-semibold">{preview.groupName}</h1>
              <p className="mt-1 font-mono text-sm text-icy">{preview.groupCode}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-icy">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden="true" />{formatDate(preview.partyDate)}</span>
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" aria-hidden="true" />{preview.memberCount} members</span>
              </div>
            </div>
            <form onSubmit={submit} className="p-7" noValidate>
              <label htmlFor="pw" className="font-semibold">Group password</label>
              <div className="relative mt-2">
                <input id="pw" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" aria-invalid={!!error} aria-describedby={error ? 'pw-error' : undefined}
                  className="min-h-[48px] w-full rounded-2xl border border-silver bg-white px-4 py-3 pr-12 text-midnight focus:border-royal focus:outline-none focus:ring-2 focus:ring-royal/30" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-winter hover:bg-ice" aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {error && <p id="pw-error" role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button className="btn-primary mt-5 w-full" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{busy ? 'Checking password' : 'Unlock group'}
              </button>
            </form>
          </div>
        )}
      </div>
    </Page>
  )
}
