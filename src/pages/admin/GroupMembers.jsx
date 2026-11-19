import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, Gift, Loader2, Pencil, Plus, Trash2, UserPlus } from 'lucide-react'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { deleteMemberFn, fnError } from '../../lib/adminApi'
import { safeHttp, useMembers } from '../../lib/adminData'
import Avatar from '../../components/Avatar'
import { AdminEmpty, ConfirmDialog, Field, Modal, btnGhost, inputCls, useToast } from '../../components/admin/ui'

function MemberForm({ groupId, member, onClose, onSaved }) {
  const toast = useToast()
  const [f, setF] = useState({ fullName: member?.fullName || '', email: member?.email || '', photoURL: member?.photoURL || '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!f.fullName.trim()) er.fullName = 'Enter the full name.'
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email.trim())) er.email = 'Enter a valid email or leave it blank.'
    if (f.photoURL && !safeHttp(f.photoURL.trim())) er.photoURL = 'Enter a link that starts with http:// or https://, or leave it blank.'
    setErrors(er)
    if (Object.keys(er).length) return
    setBusy(true)
    const data = { fullName: f.fullName.trim(), email: f.email.trim(), photoURL: f.photoURL.trim(), updatedAt: serverTimestamp() }
    try {
      if (member) await updateDoc(doc(db, `groups/${groupId}/members`, member.id), data)
      else await addDoc(collection(db, `groups/${groupId}/members`), { ...data, createdAt: serverTimestamp() })
      toast(member ? 'Member updated.' : 'Member added.')
      onSaved(); onClose()
    } catch { toast('Could not save the member.', 'error'); setBusy(false) }
  }

  return (
    <Modal title={member ? 'Edit member' : 'Add member'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Full name" id="mn" error={errors.fullName}><input id="mn" className={inputCls} value={f.fullName} onChange={set('fullName')} maxLength={100} autoFocus /></Field>
        <Field label="Email (optional)" id="me" hint="For your reference only. It is never shown to participants." error={errors.email}><input id="me" type="email" className={inputCls} value={f.email} onChange={set('email')} /></Field>
        <Field label="Profile picture link (optional)" id="mp" error={errors.photoURL}><input id="mp" className={inputCls} value={f.photoURL} onChange={set('photoURL')} placeholder="https://" /></Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className={btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Save member</button>
        </div>
      </form>
    </Modal>
  )
}

export function MembersPanel({ groupId, members, loading, error, reload }) {
  const toast = useToast()
  const [form, setForm] = useState(null) // null | 'new' | member
  const [del, setDel] = useState(null)
  const [busy, setBusy] = useState(false)

  const remove = async () => {
    setBusy(true)
    try { await deleteMemberFn(groupId, del.id); toast(`${del.fullName} removed.`); setDel(null); reload() }
    catch (e) { toast(fnError(e), 'error') }
    setBusy(false)
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold">Members</h2>
        <button className="btn-primary" onClick={() => setForm('new')}><UserPlus className="h-4 w-4" aria-hidden="true" />Add Member</button>
      </div>
      <div className="mt-5">
        {loading ? <p className="text-winter">Loading members…</p>
          : error ? <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</p>
          : members.length === 0 ? <AdminEmpty title="No members yet" text="Add the people in this group, then encode their wishlists."><button className="btn-primary" onClick={() => setForm('new')}><Plus className="h-4 w-4" aria-hidden="true" />Add Member</button></AdminEmpty>
          : (
            <ul className="grid gap-4 md:grid-cols-2">
              {members.map((m) => (
                <li key={m.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-icy/60">
                  <div className="flex items-center gap-4">
                    <Avatar name={m.fullName} src={m.photoURL} size="h-14 w-14 text-lg" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-xl font-semibold">{m.fullName}</h3>
                      {m.email && <p className="truncate text-sm text-winter">{m.email}</p>}
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 text-winter"><Gift className="h-4 w-4" aria-hidden="true" />{m.itemCount} {m.itemCount === 1 ? 'item' : 'items'}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m.itemCount ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{m.itemCount ? 'Wishlist ready' : 'Wishlist empty'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/admin/groups/${groupId}/members/${m.id}`} className="btn-primary !min-h-[40px] !px-4"><Gift className="h-4 w-4" aria-hidden="true" />Manage Wishlist</Link>
                    <Link to={`/admin/groups/${groupId}/members/${m.id}?preview=1`} className={`${btnGhost} !min-h-[40px] !px-4`}><Eye className="h-4 w-4" aria-hidden="true" />View Wishlist</Link>
                    <button className={`${btnGhost} !min-h-[40px] !px-3`} onClick={() => setForm(m)} aria-label={`Edit ${m.fullName}`}><Pencil className="h-4 w-4" /></button>
                    <button className={`${btnGhost} !min-h-[40px] !px-3 !text-red-600`} onClick={() => setDel(m)} aria-label={`Delete ${m.fullName}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
      </div>
      {form && <MemberForm groupId={groupId} member={form === 'new' ? null : form} onClose={() => setForm(null)} onSaved={reload} />}
      {del && <ConfirmDialog title="Delete this member?" message={`${del.fullName} and their wishlist will be permanently deleted.`} busy={busy} onConfirm={remove} onClose={() => !busy && setDel(null)} />}
    </section>
  )
}

export default function GroupMembers() {
  const { groupId } = useParams()
  const data = useMembers(groupId)
  return (
    <>
      <Link to={`/admin/groups/${groupId}`} className="inline-flex items-center gap-2 text-winter hover:text-royal"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Group overview</Link>
      <div className="mt-4"><MembersPanel groupId={groupId} {...data} /></div>
    </>
  )
}
