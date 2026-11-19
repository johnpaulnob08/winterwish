import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Lock, Users, CalendarDays, Loader2 } from 'lucide-react'
import Page from '../components/Page'
import EmptyState from '../components/EmptyState'
import { searchGroups } from '../lib/api'
import { formatDate, errorMessage } from '../lib/format'

export default function FindGroup() {
  const [q, setQ] = useState('')
  const [state, setState] = useState({ status: 'loading', groups: [] })

  useEffect(() => {
    let off = false
    setState((s) => ({ ...s, status: 'loading' }))
    const t = setTimeout(() => {
      searchGroups(q.trim())
        .then((groups) => !off && setState({ status: 'ready', groups }))
        .catch((e) => !off && setState({ status: 'error', groups: [], message: errorMessage(e) }))
    }, 350)
    return () => { off = true; clearTimeout(t) }
  }, [q])

  const { status, groups } = state
  return (
    <Page className="container-w py-14">
      <h1 className="text-4xl font-semibold text-white sm:text-5xl">Find your group</h1>
      <p className="mt-3 max-w-xl text-icy">Search by group name or the group code your organizer shared with you.</p>

      <div className="relative mt-8 max-w-2xl">
        <label htmlFor="q" className="sr-only">Group name or code</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-icy" aria-hidden="true" />
        <input id="q" className="input !pl-12 !pr-12" placeholder="Group name or code, like WINTER-2026-X7K2" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        {status === 'loading' && <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-icy" aria-label="Searching" />}
      </div>

      <div className="mt-10" aria-live="polite">
        {status === 'error' && <EmptyState title="Search is unavailable" text={state.message} />}
        {status === 'ready' && groups.length === 0 && (
          q.trim() ? (
            <EmptyState title="No groups found" text="Check the spelling or ask your organizer for the exact group code." />
          ) : (
            <EmptyState icon="tree" title="No active groups yet" text="Groups appear here once your organizer sets them up." />
          )
        )}
        {groups.length > 0 && (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <li key={g.groupCode}>
                <Link to={`/group/${g.groupCode}`} className="card-snow block h-full p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_44px_-12px_rgba(37,99,235,.55)]">
                  <h2 className="text-2xl font-semibold leading-tight">{g.groupName}</h2>
                  <p className="mt-1 font-mono text-sm text-royal">{g.groupCode}</p>
                  <dl className="mt-5 space-y-2 text-sm text-winter">
                    <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" aria-hidden="true" /><dt className="sr-only">Party date</dt><dd>{formatDate(g.partyDate)}</dd></div>
                    <div className="flex items-center gap-2"><Users className="h-4 w-4" aria-hidden="true" /><dt className="sr-only">Members</dt><dd>{g.memberCount} {g.memberCount === 1 ? 'member' : 'members'}</dd></div>
                  </dl>
                  <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ice px-3 py-1 text-xs font-semibold text-winter"><Lock className="h-3.5 w-3.5" aria-hidden="true" />Password protected</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Page>
  )
}
