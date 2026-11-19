import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { AdminEmpty, GroupStats, StatusBadge } from '../../components/admin/ui'

export default function MembersAndWishlists() {
  const [groups, setGroups] = useState(null)
  useEffect(() => onSnapshot(query(collection(db, 'groups'), orderBy('createdAt', 'desc')), (s) => setGroups(s.docs.map((d) => ({ id: d.id, ...d.data() }))), () => setGroups([])), [])
  return (
    <>
      <h1 className="text-4xl font-semibold">Members and Wishlists</h1>
      <p className="mt-2 text-winter">Choose a group to manage its members and their wishlists.</p>
      <div className="mt-6">
        {groups === null ? <p className="text-winter">Loading groups…</p>
          : groups.length === 0 ? <AdminEmpty title="No groups yet" text="Create a group first, then add its members."><Link to="/admin/groups/create" className="btn-primary">Create a Group</Link></AdminEmpty>
          : (
            <ul className="grid gap-4 md:grid-cols-2">
              {groups.map((g) => (
                <li key={g.id}>
                  <Link to={`/admin/groups/${g.id}/members`} className="flex items-center justify-between gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-icy/60 transition hover:ring-royal">
                    <div className="min-w-0"><h2 className="truncate text-xl font-semibold">{g.groupName}</h2><p className="text-sm text-winter"><GroupStats groupId={g.id} /></p></div>
                    <StatusBadge status={g.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
      </div>
    </>
  )
}
