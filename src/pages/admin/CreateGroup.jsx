import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createGroupFn, fnError } from '../../lib/adminApi'
import { Field, inputCls, useToast } from '../../components/admin/ui'

export default function CreateGroup() {
  const nav = useNavigate()
  const toast = useToast()
  const [f, setF] = useState({ groupName: '', description: '', partyDate: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!f.groupName.trim()) er.groupName = 'Enter a group name.'
    if (!f.partyDate || Number.isNaN(new Date(f.partyDate).getTime())) er.partyDate = 'Choose the party date and time.'
    if (f.password.length < 8) er.password = 'Use at least 8 characters.'
    if (f.confirm !== f.password) er.confirm = 'The passwords do not match.'
    setErrors(er)
    if (Object.keys(er).length) return
    setBusy(true)
    try {
      const { groupId, groupCode } = await createGroupFn({
        groupName: f.groupName.trim(), description: f.description.trim(),
        partyDate: new Date(f.partyDate).toISOString(), password: f.password,
      })
      toast(`Group created. Code: ${groupCode}`)
      nav(`/admin/groups/${groupId}`, { state: { created: groupCode } })
    } catch (err) { toast(fnError(err), 'error'); setBusy(false) }
  }

  return (
    <>
      <Link to="/admin/groups" className="inline-flex items-center gap-2 text-winter hover:text-royal"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Manage Groups</Link>
      <h1 className="mt-3 text-4xl font-semibold">Create a Group</h1>
      <form onSubmit={submit} noValidate className="mt-8 max-w-xl space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-icy/60 sm:p-8">
        <Field label="Group name" id="gn" error={errors.groupName}><input id="gn" className={inputCls} value={f.groupName} onChange={set('groupName')} maxLength={100} /></Field>
        <Field label="Description (optional)" id="gd"><textarea id="gd" rows={3} className={inputCls} value={f.description} onChange={set('description')} maxLength={500} /></Field>
        <Field label="Party date and time" id="gp" error={errors.partyDate}><input id="gp" type="datetime-local" className={inputCls} value={f.partyDate} onChange={set('partyDate')} /></Field>
        <Field label="Group password" id="gw" hint="Share this with the group. Members need it to unlock their group." error={errors.password}><input id="gw" type="password" autoComplete="new-password" className={inputCls} value={f.password} onChange={set('password')} /></Field>
        <Field label="Confirm password" id="gc" error={errors.confirm}><input id="gc" type="password" autoComplete="new-password" className={inputCls} value={f.confirm} onChange={set('confirm')} /></Field>
        <button className="btn-primary" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{busy ? 'Creating group' : 'Create group'}</button>
      </form>
    </>
  )
}
