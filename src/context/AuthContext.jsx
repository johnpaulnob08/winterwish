import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function authMessage(e) {
  switch (e?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Email or password is incorrect.'
    case 'auth/invalid-email': return 'Enter a valid email address.'
    case 'auth/too-many-requests': return 'Too many attempts. Wait a few minutes or reset your password.'
    case 'auth/network-request-failed': return 'Network error. Check your connection.'
    case 'app/not-admin': return 'This account is not an administrator.'
    default: return 'Could not sign in. Please try again.'
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, isAdmin: false })

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) return setState({ loading: false, user: null, isAdmin: false })
    try {
      const s = await getDoc(doc(db, 'adminUsers', user.uid))
      setState({ loading: false, user, isAdmin: s.exists() })
    } catch {
      setState({ loading: false, user, isAdmin: false })
    }
  }), [])

  const value = useMemo(() => ({
    ...state,
    login: async (email, password) => {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const s = await getDoc(doc(db, 'adminUsers', cred.user.uid))
      if (!s.exists()) { await signOut(auth); throw Object.assign(new Error('not admin'), { code: 'app/not-admin' }) }
    },
    logout: () => signOut(auth),
    resetPassword: (email) => sendPasswordResetEmail(auth, email),
  }), [state])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
