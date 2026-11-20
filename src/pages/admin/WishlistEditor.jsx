import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Eye, Gift, ListPlus, Loader2, Pencil, Pencil as Edit, Plus, Trash2 } from 'lucide-react'
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { safeHttp } from '../../lib/adminData'
import Avatar from '../../components/Avatar'
import PriorityBadge from '../../components/PriorityBadge'
import WishlistCard from '../../components/WishlistCard'
import { AdminEmpty, ConfirmDialog, Field, Modal, btnGhost, inputCls, useToast } from '../../components/admin/ui'

const PRIORITIES = ['High', 'Medium', 'Low']

function ItemForm({ path, item, nextOrder, onClose }) {
  const toast = useToast()
  const [f, setF] = useState({ itemName: item?.itemName || '', description: item?.description || '', productLink: item?.productLink || '', imageURL: item?.imageURL || '', priority: item?.priority || 'Medium' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault()
    const er = {}
    if (!f.itemName.trim()) er.itemName = 'Enter the item name.'
    if (f.productLink && !safeHttp(f.productLink.trim())) er.productLink = 'Enter a link that starts with http:// or https://.'
    if (f.imageURL && !safeHttp(f.imageURL.trim())) er.imageURL = 'Enter a link that starts with http:// or https://.'
    setErrors(er)
    if (Object.keys(er).length) return
    setBusy(true)
    const data = { itemName: f.itemName.trim(), description: f.description.trim(), productLink: f.productLink.trim(), imageURL: f.imageURL.trim(), priority: f.priority, updatedAt: serverTimestamp() }
    try {
      if (item) await updateDoc(doc(db, path, item.id), data)
      else await addDoc(collection(db, path), { ...data, sortOrder: nextOrder, createdAt: serverTimestamp() })
      toast(item ? 'Item updated.' : 'Item added.'); onClose()
    } catch { toast('Could not save the item.', 'error'); setBusy(false) }
  }
  return (
    <Modal title={item ? 'Edit wishlist item' : 'Add wishlist item'} onClose={onClose} wide>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Item name" id="in" error={errors.itemName}><input id="in" className={inputCls} value={f.itemName} onChange={set('itemName')} maxLength={200} autoFocus /></Field>
        <Field label="Description" id="id"><textarea id="id" rows={3} className={inputCls} value={f.description} onChange={set('description')} maxLength={1000} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product link (optional)" id="il" error={errors.productLink}><input id="il" className={inputCls} value={f.productLink} onChange={set('productLink')} placeholder="https://" /></Field>
          <Field label="Product image link (optional)" id="ii" error={errors.imageURL}><input id="ii" className={inputCls} value={f.imageURL} onChange={set('imageURL')} placeholder="https://" /></Field>
        </div>
        <Field label="Priority" id="ip"><select id="ip" className={inputCls} value={f.priority} onChange={set('priority')}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className={btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Save item</button>
        </div>
      </form>
    </Modal>
  )
}

function BulkForm({ path, start, onClose }) {
  const toast = useToast()
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [busy, setBusy] = useState(false)
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const submit = async (e) => {
    e.preventDefault()
    if (!lines.length) return
    if (lines.length > 100) return toast('Add up to 100 items at a time.', 'error')
    setBusy(true)
    try {
      const b = writeBatch(db)
      lines.forEach((line, i) => {
        const [name, ...rest] = line.split('|')
        b.set(doc(collection(db, path)), {
          itemName: name.trim().slice(0, 200) || 'Untitled item', description: rest.join('|').trim().slice(0, 1000),
          productLink: '', imageURL: '', priority, sortOrder: start + i, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        })
      })
      await b.commit()
      toast(`${lines.length} ${lines.length === 1 ? 'item' : 'items'} added.`); onClose()
    } catch { toast('Could not add the items.', 'error'); setBusy(false) }
  }
  return (
    <Modal title="Add multiple items" onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <Field label="One item per line" id="bt" hint="Optional description after a | symbol, like: Wireless earbuds | Black, any brand">
          <textarea id="bt" rows={8} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
        </Field>
        <Field label="Priority for all items" id="bp"><select id="bp" className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value)}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></Field>
        <div className="flex items-center justify-between gap-3 pt-2">
          <p className="text-sm text-winter">{lines.length} {lines.length === 1 ? 'item' : 'items'} ready</p>
          <div className="flex gap-3">
            <button type="button" className={btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
            <button className="btn-primary" disabled={busy || !lines.length}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Add items</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

function NoteBox({ groupId, memberId, initial, onSaved }) {
  const toast = useToast()
  const [text, setText] = useState(initial)
  const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    try {
      const note = text.trim().slice(0, 500)
      await updateDoc(doc(db, `groups/${groupId}/members`, memberId), { note, updatedAt: serverTimestamp() })
      onSaved(note); toast('Note saved.')
    } catch { toast('Could not save the note.', 'error') }
    setBusy(false)
  }
  return (
    <section className="mt-8 max-w-2xl rounded-3xl bg-white p-5 shadow-sm ring-1 ring-icy/60">
      <Field label="Note shown at the bottom of this wishlist" id="nt" hint="Optional. Up to 500 characters.">
        <textarea id="nt" rows={3} maxLength={500} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <button className="btn-primary mt-3" onClick={save} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Save note</button>
    </section>
  )
}

export default function WishlistEditor() {
  const { groupId, memberId } = useParams()
  const [params, setParams] = useSearchParams()
  const toast = useToast()
  const path = `groups/${groupId}/members/${memberId}/wishlist`
  const [member, setMember] = useState(undefined)
  const [items, setItems] = useState(null)
  const [modal, setModal] = useState(null) // 'new' | 'bulk' | item
  const [del, setDel] = useState(null)
  const [busy, setBusy] = useState(false)
  const preview = params.get('preview') === '1'

  useEffect(() => {
    getDoc(doc(db, `groups/${groupId}/members`, memberId)).then((s) => setMember(s.exists() ? { id: s.id, ...s.data() } : null)).catch(() => setMember(null))
    return onSnapshot(query(collection(db, path), orderBy('sortOrder', 'asc')), (s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data() }))), () => setItems([]))
  }, [groupId, memberId, path])

  const back = `/admin/groups/${groupId}/members`
  if (member === undefined) return <p className="text-winter">Loading…</p>
  if (member === null) return <AdminEmpty title="Member not found" text="They may have been deleted."><Link to={back} className="btn-primary">Back to members</Link></AdminEmpty>

  const move = async (i, d) => {
    const a = [...items];
    [a[i], a[i + d]] = [a[i + d], a[i]]
    try {
      const b = writeBatch(db)
      a.forEach((it, idx) => { if (it.sortOrder !== idx) b.update(doc(db, path, it.id), { sortOrder: idx, updatedAt: serverTimestamp() }) })
      await b.commit()
    } catch { toast('Could not reorder the items.', 'error') }
  }
  const remove = async () => {
    setBusy(true)
    try { await deleteDoc(doc(db, path, del.id)); toast('Item deleted.'); setDel(null) }
    catch { toast('Could not delete the item.', 'error') }
    setBusy(false)
  }
  const nextOrder = items?.length ? Math.max(...items.map((i) => i.sortOrder ?? 0)) + 1 : 0

  return (
    <>
      <Link to={back} className="inline-flex items-center gap-2 text-winter hover:text-royal"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Members</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={member.fullName} src={member.photoURL} size="h-16 w-16 text-xl" />
          <div><h1 className="text-4xl font-semibold">{member.fullName}</h1><p className="text-winter">{items ? items.length : '…'} wishlist {items?.length === 1 ? 'item' : 'items'}</p></div>
        </div>
        <button className={btnGhost} onClick={() => setParams(preview ? {} : { preview: '1' })} aria-pressed={preview}>
          {preview ? <><Edit className="h-4 w-4" aria-hidden="true" />Back to editing</> : <><Eye className="h-4 w-4" aria-hidden="true" />Preview wishlist</>}
        </button>
      </div>

      {!preview && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => setModal('new')}><Plus className="h-4 w-4" aria-hidden="true" />Add Item</button>
          <button className={btnGhost} onClick={() => setModal('bulk')}><ListPlus className="h-4 w-4" aria-hidden="true" />Add Multiple Items</button>
        </div>
      )}

      <div className="mt-6">
        {items === null ? <p className="text-winter">Loading items…</p>
          : items.length === 0 ? <AdminEmpty title="This wishlist is empty" text="Add the items this member wants for Christmas."><button className="btn-primary" onClick={() => setModal('new')}><Plus className="h-4 w-4" aria-hidden="true" />Add Item</button></AdminEmpty>
          : preview ? (
            <WishlistCard items={items} note={member.note} />
          ) : (
            <ul className="space-y-3">
              {items.map((it, i) => (
                <li key={it.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-icy/60">
                  <div className="flex flex-col">
                    <button className="grid h-9 w-9 place-items-center rounded-full text-winter hover:bg-ice disabled:opacity-30" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${it.itemName} up`}><ArrowUp className="h-4 w-4" /></button>
                    <button className="grid h-9 w-9 place-items-center rounded-full text-winter hover:bg-ice disabled:opacity-30" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${it.itemName} down`}><ArrowDown className="h-4 w-4" /></button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{it.itemName}</h2><PriorityBadge priority={it.priority} /></div>
                    {it.description && <p className="mt-1 line-clamp-2 text-sm text-winter">{it.description}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button className={`${btnGhost} !min-h-[40px] !px-3`} onClick={() => setModal(it)} aria-label={`Edit ${it.itemName}`}><Pencil className="h-4 w-4" /></button>
                    <button className={`${btnGhost} !min-h-[40px] !px-3 !text-red-600`} onClick={() => setDel(it)} aria-label={`Delete ${it.itemName}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
      </div>

      {!preview && items && <NoteBox key={memberId} groupId={groupId} memberId={memberId} initial={member.note || ''} onSaved={(n) => setMember((m) => ({ ...m, note: n }))} />}
      {modal === 'new' && <ItemForm path={path} nextOrder={nextOrder} onClose={() => setModal(null)} />}
      {modal === 'bulk' && <BulkForm path={path} start={nextOrder} onClose={() => setModal(null)} />}
      {modal && modal !== 'new' && modal !== 'bulk' && <ItemForm path={path} item={modal} nextOrder={nextOrder} onClose={() => setModal(null)} />}
      {del && <ConfirmDialog title="Delete this item?" message={`"${del.itemName}" will be removed from the wishlist.`} busy={busy} onConfirm={remove} onClose={() => !busy && setDel(null)} />}
    </>
  )
}
