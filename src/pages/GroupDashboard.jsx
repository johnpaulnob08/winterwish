import { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { Gift, LogOut, Search, Users } from 'lucide-react'
import Page from '../components/Page'
import Avatar from '../components/Avatar'
import Countdown from '../components/Countdown'
import EmptyState from '../components/EmptyState'
import { clearSession } from '../lib/session'
import { formatDate } from '../lib/format'

export default function GroupDashboard() {
  const { groupCode, group, members } = useOutletContext()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const shown = members.filter((m) => m.fullName.toLowerCase().includes(q.trim().toLowerCase()))
  const leave = () => { clearSession(groupCode); nav('/find-group') }

  return (
    <Page className="container-w py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">{group.groupName}</h1>
          {group.description && <p className="mt-3 text-lg text-icy">{group.description}</p>}
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-icy">
            <span>{formatDate(group.partyDate)}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" aria-hidden="true" />{members.length} members</span>
          </p>
        </div>
        <button onClick={leave} className="btn-ghost"><LogOut className="h-4 w-4" aria-hidden="true" />Leave group</button>
      </div>

      <div className="mt-8 max-w-3xl"><Countdown target={group.partyDate} /></div>

      <h2 className="mt-14 text-3xl font-semibold text-white">Members</h2>
      {members.length > 6 && (
        <div className="relative mt-4 max-w-sm">
          <label htmlFor="mq" className="sr-only">Search members</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-icy" aria-hidden="true" />
          <input id="mq" className="input !pl-12" placeholder="Search members" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      )}

      <div className="mt-6">
        {members.length === 0 ? (
          <EmptyState icon="tree" title="No members yet" text="Your organizer has not added anyone to this group." />
        ) : shown.length === 0 ? (
          <EmptyState title="No one matches that name" text="Try a different spelling." />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {shown.map((m) => (
            <li key={m.id}>
              <Link to={`/group/${groupCode}/member/${m.id}`} className="card-snow flex h-full flex-col items-center p-4 text-center transition hover:-translate-y-1 hover:shadow-[0_18px_44px_-12px_rgba(37,99,235,.55)] sm:p-5">
                <Avatar name={m.fullName} src={m.photoURL} size="h-20 w-20 text-2xl sm:h-24 sm:w-24" />
                <h3 className="mt-3 w-full truncate text-lg font-semibold sm:text-xl">{m.fullName}</h3>
                <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-winter"><Gift className="h-4 w-4" aria-hidden="true" />{m.wishlist?.length || 0} {m.wishlist?.length === 1 ? 'item' : 'items'}</p>
                <span className="mt-3 w-full rounded-full bg-royal py-2 text-sm font-semibold text-white">View wishlist</span>
              </Link>
            </li>
            ))}
          </ul>
        )}
      </div>
    </Page>
  )
}
