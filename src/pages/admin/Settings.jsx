import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { btnGhost, useToast } from '../../components/admin/ui'

export default function Settings() {
  const { user, resetPassword, logout } = useAuth()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const reset = async () => {
    setBusy(true)
    try { await resetPassword(user.email); toast(`Password reset email sent to ${user.email}.`) }
    catch { toast('Could not send the reset email. Try again.', 'error') }
    setBusy(false)
  }
  return (
    <>
      <h1 className="text-4xl font-semibold">Settings</h1>
      <div className="mt-8 max-w-xl space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-icy/60">
        <div><p className="text-sm text-winter">Signed in as</p><p className="text-lg font-semibold">{user.email}</p></div>
        <div className="flex flex-wrap gap-3">
          <button className={btnGhost} onClick={reset} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Send password reset email</button>
          <button className={btnGhost} onClick={logout}>Log out</button>
        </div>
      </div>
    </>
  )
}
