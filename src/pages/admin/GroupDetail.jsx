import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Archive, ArchiveRestore, ArrowLeft, ExternalLink, Gift, KeyRound, Loader2, Pencil, Trash2, UserPlus, X } from 'lucide-react'
import { doc, onSnapshot, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { changeGroupPasswordFn, deleteGroupFn, fnError } from '../../lib/adminApi'
import { toDate, toLocalInput, useMembers } from '../../lib/adminData'
import { formatDate } from '../../lib/format'
import { AdminEmpty, ConfirmDialog, CopyButton, Field, Modal, StatusBadge, btnGhost, inputCls, useToast } from '../../components/admin/ui'
import { MembersPanel } from './GroupMembers'

function EditGroup({ group, groupId, onClose }) {
  const toast = useToast()
  const [f, setF] = useState({ groupName: group.groupName, description: group.description || '', partyDate: toLocalInput(toDate(group.partyDate)) })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!f.groupName.trim()) er.groupName = 'Enter a group name.'
    if (!f.partyDate) er.partyDate = 'Choose the party date and time.'
    setErrors(er)
    if (Object.keys(er).length) return
    setBusy(true)
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        groupName: f.groupName.trim(), description: f.description.trim(),
        partyDate: Timestamp.fromDate(new Date(f.partyDate)), updatedAt: serverTimestamp(),
      })
      toast('Group updated.'); onClose()
    } catch { toast('Could not update the group.', 'error'); setBusy(false) }
  }
  return (
    <Modal title="Edit group information" onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Group name" id="eg" error={errors.groupName}><input id="eg" className={inputCls} value={f.groupName} onChange={set('groupName')} maxLength={100} /></Field>
        <Field label="Description (optional)" id="ed"><textarea id="ed" rows={3} className={inputCls} value={f.description} onChange={set('description')} maxLength={500} /></Field>
        <Field label="Party date and time" id="ep" error={errors.partyDate}><input id="ep" type="datetime-local" className={inputCls} value={f.partyDate} onChange={set('partyDate')} /></Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className={btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Save changes</button>
        </div>
      </form>
    </Modal>
  )
}

function ChangePassword({ groupId, onClose }) {
  const toast = useToast()
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (pw.length < 8) return setError('Use at least 8 characters.')
    if (pw !== confirm) return setError('The passwords do not match.')
    setError(''); setBusy(true)
    try { await changeGroupPasswordFn(groupId, pw); toast('Group password changed.'); onClose() }
    catch (err) { toast(fnError(err), 'error'); setBusy(false) }
  }
  return (
    <Modal title="Change group password" onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <p className="text-sm text-winter">Anyone who already unlocked this group will be signed out and will need the new password.</p>
        <Field label="New password" id="np"><input id="np" type="password" autoComplete="new-password" className={inputCls} value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></Field>
        <Field label="Confirm new password" id="cp" error={error}><input id="cp" type="password" autoComplete="new-password" className={inputCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} /></Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className={btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Change password</button>
        </div>
      </form>
    </Modal>
  )
}

export default function GroupDetail() {
  const { groupId } = useParams()
  const nav = useNavigate()
  const toast = useToast()
  const { state } = useLocation()
  const [group, setGroup] = useState(undefined)
  const [modal, setModal] = useState(null)
  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState(state?.created || '')
  const members = useMembers(groupId)

  useEffect(() => onSnapshot(doc(db, 'groups', groupId), (s) => setGroup(s.exists() ? s.data() : null), () => setGroup(null)), [groupId])

  if (group === undefined) return <p className="text-winter">Loading group…</p>
  if (group === null) return <AdminEmpty title="Group not found" text="It may have been deleted."><Link to="/admin/groups" className="btn-primary">Manage Groups</Link></AdminEmpty>

  const totalItems = members.members.reduce((n, m) => n + m.itemCount, 0)
  const setStatus = async (status) => {
    try { await updateDoc(doc(db, 'groups', groupId), { status, updatedAt: serverTimestamp() }); toast(status === 'archived' ? 'Group archived.' : 'Group restored.'); setModal(null) }
    catch { toast('Could not update the group.', 'error') }
  }
  const remove = async () => {
    setBusy(true)
    try { await deleteGroupFn(groupId); toast('Group deleted.'); nav('/admin/groups') }
    catch (e) { toast(fnError(e), 'error'); setBusy(false) }
  }

  const info = [
    ['Party date', group.partyDate ? formatDate(toDate(group.partyDate)) : ''],
    ['Members', members.loading ? '…' : members.members.length],
    ['Wishlist items', members.loading ? '…' : totalItems],
    ['Created', group.createdAt ? formatDate(toDate(group.createdAt)) : ''],
  ]

  return (
    <>
      <Link to="/admin/groups" className="inline-flex items-center gap-2 text-winter hover:text-royal"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Manage Groups</Link>

      {banner && (
        <div role="status" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-midnight px-5 py-4 text-white">
          <p>Group created. Share this code with your participants: <span className="ml-1 font-mono text-lg font-semibold text-gold">{banner}</span></p>
          <div className="flex items-center gap-2"><CopyButton text={banner} label="Copy code" /><button className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" onClick={() => setBanner('')} aria-label="Dismiss"><X className="h-5 w-5" /></button></div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-4xl font-semibold">{group.groupName}</h1><StatusBadge status={group.status} /></div>
          {group.description && <p className="mt-2 max-w-2xl text-lg text-winter">{group.description}</p>}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-icy/60 sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-winter">Group code</p>
          <p className="mt-1 break-all font-mono text-lg font-semibold text-royal">{group.groupCode}</p>
          <div className="mt-2"><CopyButton text={group.groupCode} /></div>
        </div>
        {info.map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white p-4 ring-1 ring-icy/60"><p className="text-sm text-winter">{k}</p><p className="mt-1 text-lg font-semibold">{v}</p></div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button className={btnGhost} onClick={() => setModal('edit')}><Pencil className="h-4 w-4" aria-hidden="true" />Edit Group Information</button>
        <button className={btnGhost} onClick={() => setModal('password')}><KeyRound className="h-4 w-4" aria-hidden="true" />Change Group Password</button>
        <Link to={`/admin/groups/${groupId}/members`} className={btnGhost}><UserPlus className="h-4 w-4" aria-hidden="true" />Add Members</Link>
        <Link to={`/admin/groups/${groupId}/members`} className={btnGhost}><Gift className="h-4 w-4" aria-hidden="true" />Manage Wishlists</Link>
        <a href={`/group/${group.groupCode}`} target="_blank" rel="noopener noreferrer" className={btnGhost}><ExternalLink className="h-4 w-4" aria-hidden="true" />Preview Public Group Page<span className="sr-only"> (opens in a new tab)</span></a>
        {group.status === 'active'
          ? <button className={btnGhost} onClick={() => setModal('archive')}><Archive className="h-4 w-4" aria-hidden="true" />Archive Group</button>
          : <button className={btnGhost} onClick={() => setStatus('active')}><ArchiveRestore className="h-4 w-4" aria-hidden="true" />Restore Group</button>}
        <button className={`${btnGhost} !text-red-600`} onClick={() => setModal('delete')}><Trash2 className="h-4 w-4" aria-hidden="true" />Delete Group</button>
      </div>

      <div className="mt-12"><MembersPanel groupId={groupId} {...members} /></div>

      {modal === 'edit' && <EditGroup group={group} groupId={groupId} onClose={() => setModal(null)} />}
      {modal === 'password' && <ChangePassword groupId={groupId} onClose={() => setModal(null)} />}
      {modal === 'archive' && <ConfirmDialog title="Archive this group?" confirmLabel="Archive" message="Archived groups disappear from public search and nobody can unlock them. You can restore the group at any time." onConfirm={() => setStatus('archived')} onClose={() => setModal(null)} />}
      {modal === 'delete' && <ConfirmDialog title="Delete this group?" message={`"${group.groupName}" and all of its members and wishlists will be permanently deleted. This cannot be undone.`} busy={busy} onConfirm={remove} onClose={() => !busy && setModal(null)} />}
    </>
  )
}
