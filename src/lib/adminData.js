import { useCallback, useEffect, useState } from 'react'
import { collection, getCountFromServer, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from './firebase'

export const toLocalInput = (d) => {
  const x = new Date(d)
  return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
export const safeHttp = (u) => { try { return /^https?:$/.test(new URL(u).protocol) } catch { return false } }
export const toDate = (t) => (t?.toDate ? t.toDate() : null)

export async function loadMembers(groupId) {
  const snap = await getDocs(query(collection(db, `groups/${groupId}/members`), orderBy('createdAt', 'asc')))
  return Promise.all(
    snap.docs.map(async (d) => {
      const c = await getCountFromServer(collection(db, `groups/${groupId}/members/${d.id}/wishlist`))
      return { id: d.id, ...d.data(), itemCount: c.data().count }
    })
  )
}

export function useMembers(groupId) {
  const [state, setState] = useState({ loading: true, members: [], error: '' })
  const reload = useCallback(async () => {
    try {
      setState({ loading: false, members: await loadMembers(groupId), error: '' })
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'Could not load members.' }))
    }
  }, [groupId])
  useEffect(() => { reload() }, [reload])
  return { ...state, reload }
}
