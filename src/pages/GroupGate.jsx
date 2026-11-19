import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Page from '../components/Page'
import EmptyState from '../components/EmptyState'
import { getGroupContent } from '../lib/api'
import { clearSession, getSession } from '../lib/session'

const AUTH_ERRORS = ['functions/unauthenticated', 'functions/permission-denied', 'functions/not-found']

export default function GroupGate() {
  const { groupCode } = useParams()
  const nav = useNavigate()
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    const s = getSession(groupCode)
    const leave = () => { clearSession(groupCode); nav(`/group/${groupCode}`, { replace: true, state: { expired: true } }) }
    if (!s) { nav(`/group/${groupCode}`, { replace: true }); return }
    let off = false
    setState({ status: 'loading' })
    getGroupContent(groupCode, s.token)
      .then((data) => !off && setState({ status: 'ready', data }))
      .catch((e) => { if (off) return; AUTH_ERRORS.includes(e.code) ? leave() : setState({ status: 'error' }) })
    const timer = setTimeout(leave, Math.max(0, s.expiresAt - Date.now()))
    return () => { off = true; clearTimeout(timer) }
  }, [groupCode, nav])

  if (state.status === 'loading') return <Page className="grid min-h-[60vh] place-items-center"><Loader2 className="h-9 w-9 animate-spin text-icy" aria-label="Loading group" /></Page>
  if (state.status === 'error') return <Page className="container-w py-16"><EmptyState title="Could not load the group" text="Check your connection and refresh the page." /></Page>
  return <Outlet context={{ groupCode, group: state.data.group, members: state.data.members }} />
}
