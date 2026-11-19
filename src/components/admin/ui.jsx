import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { collection, getCountFromServer } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export const inputCls = 'min-h-[44px] w-full rounded-xl border border-silver bg-white px-3.5 py-2.5 text-midnight placeholder:text-slate-400 focus:border-royal focus:outline-none focus:ring-2 focus:ring-royal/30'
export const btnGhost = 'btn border border-silver bg-white text-winter hover:bg-ice'
export const btnDanger = 'btn bg-red-600 text-white hover:bg-red-700'

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setItems((i) => [...i, { id, message, type }])
    setTimeout(() => setItems((i) => i.filter((x) => x.id !== id)), 4500)
  }, [])
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} role="status" className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-sm text-white shadow-lg ${t.type === 'error' ? 'bg-red-600' : 'bg-midnight'}`}>
            {t.type === 'error' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-midnight/60 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-3xl bg-white p-6 text-midnight shadow-2xl`}>
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-ice"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ title, message, confirmLabel = 'Delete', busy, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-winter">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className={btnGhost} onClick={onClose} disabled={busy}>Cancel</button>
        <button className={btnDanger} onClick={onConfirm} disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export function Field({ label, id, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function AdminEmpty({ title, text, children }) {
  return (
    <div className="rounded-3xl border border-dashed border-icy bg-white px-6 py-14 text-center">
      <svg viewBox="0 0 100 100" className="mx-auto h-20 w-20" aria-hidden="true">
        <polygon points="50,8 24,48 76,48" fill="#2563EB" /><polygon points="50,8 40,26 60,26" fill="#fff" stroke="#BFDBFE" />
        <polygon points="50,30 18,76 82,76" fill="#1d4f91" /><polygon points="50,30 38,52 62,52" fill="#fff" stroke="#BFDBFE" />
        <rect x="45" y="76" width="10" height="14" fill="#0b1d3d" /><circle cx="50" cy="6" r="4" fill="#F5D76E" />
      </svg>
      <h3 className="mt-3 text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-winter">{text}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}

export function StatusBadge({ status }) {
  const active = status === 'active'
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>{active ? 'Active' : 'Archived'}</span>
}

export function GroupStats({ groupId }) {
  const [n, setN] = useState(null)
  useEffect(() => {
    getCountFromServer(collection(db, `groups/${groupId}/members`)).then((c) => setN(c.data().count)).catch(() => setN(0))
  }, [groupId])
  return <span>{n === null ? '…' : n} {n === 1 ? 'member' : 'members'}</span>
}

export function CopyButton({ text, label = 'Copy' }) {
  const toast = useToast()
  return (
    <button type="button" className={`${btnGhost} !min-h-[36px] !px-4 !py-1.5 !text-sm`} onClick={() => navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard.'), () => toast('Could not copy. Select the text and copy it.', 'error'))}>
      {label}
    </button>
  )
}
