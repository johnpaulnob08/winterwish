import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, CheckCircle2, Gift, Layers, Plus, Users } from 'lucide-react'
import { collection, collectionGroup, getCountFromServer, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function Overview() {
  const [s, setS] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    (async () => {
      try {
        const [groups, members, items] = await Promise.all([
          getDocs(collection(db, 'groups')),
          getCountFromServer(collectionGroup(db, 'members')),
          getCountFromServer(collectionGroup(db, 'wishlist')),
        ])
        const active = groups.docs.filter((d) => d.get('status') === 'active').length
        setS({ total: groups.size, members: members.data().count, items: items.data().count, active, archived: groups.size - active })
      } catch { setError('Could not load the totals. Check that the Firestore rules are deployed.') }
    })()
  }, [])
  const cards = s && [
    ['Total Groups', s.total, Layers], ['Total Members', s.members, Users], ['Total Wishlist Items', s.items, Gift],
    ['Active Groups', s.active, CheckCircle2], ['Archived Groups', s.archived, Archive],
  ]
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-semibold">Overview</h1>
        <Link to="/admin/groups/create" className="btn-primary"><Plus className="h-4 w-4" aria-hidden="true" />Create a Group</Link>
      </div>
      {error && <p role="alert" className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(cards || Array.from({ length: 5 }, (_, i) => [`s${i}`, '…', Layers])).map(([label, v, Icon]) => (
          <div key={label} className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-icy/60">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ice text-royal"><Icon className="h-6 w-6" aria-hidden="true" /></span>
            <div><p className="font-display text-4xl font-semibold tabular-nums">{v}</p><p className="text-sm text-winter">{cards ? label : 'Loading'}</p></div>
          </div>
        ))}
      </div>
    </>
  )
}
