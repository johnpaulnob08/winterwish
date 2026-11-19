import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, ArchiveRestore, CalendarDays, Plus, Search, Trash2, Users } from 'lucide-react'
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { deleteGroupFn, fnError } from '../../lib/adminApi'
import { formatDate } from '../../lib/format'
import { AdminEmpty, ConfirmDialog, GroupStats, StatusBadge, btnGhost, inputCls, useToast } from '../../components/admin/ui'

export default function Groups({ archived = false }) {
  const toast = useToast()
  const [groups, setGroups] = useState(null)
  const [q, setQ] = useState('')
  const [del, setDel] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => onSnapshot(
    query(collection(db, 'groups'), orderBy('createdAt', 'desc')),
    (s) => setGroups(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
    () => { setGroups([]); toast('Could not load groups.', 'error') }
  ), [toast])

  const setStatus = async (g, status) => {
    try {
      await updateDoc(doc(db, 'groups', g.id), { status, updatedAt: serverTimestamp() })
      toast(status === 'archived' ? `${g.groupName} archived.` : `${g.groupName} restored.`)
    } catch { toast('Could not update the group.', 'error') }
  }
  const remove = async () => {
    setBusy(true)
    try { await deleteGroupFn(del.id); toast(`${del.groupName} deleted.`); setDel(null) }
    catch (e) { toast(fnError(e), 'error') }
    setBusy(false)
  }

  const needle = q.trim().toLowerCase()
  const list = (groups || [])
    .filter((g) => (archived ? g.status === 'archived' : true))
    .filter((g) => !needle || g.groupName.toLowerCase().includes(needle) || g.groupCode.toLowerCase().includes(needle))

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-semibold">{archived ? 'Archived Groups' : 'Manage Groups'}</h1>
        {!archived && <Link to="/admin/groups/create" className="btn-primary"><Plus className="h-4 w-4" aria-hidden="true" />Create a Group</Link>}
      </div>

      <div className="relative mt-6 max-w-md">
        <label htmlFor="gq" className="sr-only">Search groups</label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input id="gq" className={`${inputCls} !pl-11`} placeholder="Search by name or code" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="mt-6">
        {groups === null ? (
          <p className="text-winter">Loading groups…</p>
        ) : list.length === 0 ? (
          needle ? <AdminEmpty title="No groups match" text="Try a different name or code." />
            : archived ? <AdminEmpty title="No archived groups" text="Groups you archive appear here and can be restored." />
            : <AdminEmpty title="No groups yet" text="Create your first Secret Santa group to start adding members and wishlists."><Link to="/admin/groups/create" className="btn-primary">Create a Group</Link></AdminEmpty>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {list.map((g) => (
              <li key={g.id} className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-icy/60">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-semibold leading-tight">{g.groupName}</h2>
                  <StatusBadge status={g.status} />
                </div>
                <p className="mt-1 font-mono text-sm text-royal">{g.groupCode}</p>
                <div className="mt-4 space-y-1.5 text-sm text-winter">
                  <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" aria-hidden="true" />{g.partyDate ? formatDate(g.partyDate.toDate()) : ''}</p>
                  <p className="flex items-center gap-2"><Users className="h-4 w-4" aria-hidden="true" /><GroupStats groupId={g.id} /></p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to={`/admin/groups/${g.id}`} className="btn-primary !min-h-[40px] !px-5">Manage</Link>
                  {g.status === 'active'
                    ? <button className={`${btnGhost} !min-h-[40px] !px-4`} onClick={() => setStatus(g, 'archived')}><Archive className="h-4 w-4" aria-hidden="true" />Archive</button>
                    : <button className={`${btnGhost} !min-h-[40px] !px-4`} onClick={() => setStatus(g, 'active')}><ArchiveRestore className="h-4 w-4" aria-hidden="true" />Restore</button>}
                  <button className={`${btnGhost} !min-h-[40px] !px-4 !text-red-600`} onClick={() => setDel(g)} aria-label={`Delete ${g.groupName}`}><Trash2 className="h-4 w-4" aria-hidden="true" />Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {del && <ConfirmDialog title="Delete this group?" message={`"${del.groupName}" and all of its members and wishlists will be permanently deleted. This cannot be undone.`} busy={busy} onConfirm={remove} onClose={() => !busy && setDel(null)} />}
    </>
  )
}
