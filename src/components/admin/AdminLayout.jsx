import { useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Archive, Gift, LayoutDashboard, Loader2, LogOut, Menu, Settings, Snowflake, X } from 'lucide-react'
import { AuthProvider, useAuth } from '../../context/AuthContext'
import { ToastProvider } from './ui'

export function AdminRoot() {
  return <AuthProvider><Outlet /></AuthProvider>
}

const nav = [
  { to: '/admin', label: 'Overview', Icon: LayoutDashboard, end: true },
  { to: '/admin/groups', label: 'Manage Groups', Icon: Snowflake },
  { to: '/admin/members', label: 'Members and Wishlists', Icon: Gift },
  { to: '/admin/archived', label: 'Archived Groups', Icon: Archive },
  { to: '/admin/settings', label: 'Settings', Icon: Settings },
]

export default function AdminLayout() {
  const { loading, user, isAdmin, logout } = useAuth()
  const loc = useLocation()
  const [open, setOpen] = useState(false)

  if (loading) return <div className="grid min-h-screen place-items-center bg-frost"><Loader2 className="h-8 w-8 animate-spin text-royal" aria-label="Loading" /></div>
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />

  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-medium transition ${isActive ? 'bg-white/15 text-white' : 'text-icy hover:bg-white/10 hover:text-white'}`

  return (
    <ToastProvider>
      <div className="min-h-screen bg-frost text-midnight md:flex">
        <header className="flex h-14 items-center justify-between bg-midnight px-4 text-white md:hidden">
          <span className="font-display text-lg font-semibold">WinterWish Admin</span>
          <button onClick={() => setOpen((o) => !o)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </header>
        <aside className={`${open ? 'block' : 'hidden'} bg-midnight p-4 md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col`}>
          <p className="mb-6 hidden px-2 font-display text-xl font-semibold text-white md:block">WinterWish Admin</p>
          <nav className="flex flex-1 flex-col gap-1" aria-label="Admin">
            {nav.map(({ to, label, Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={link} onClick={() => setOpen(false)}><Icon className="h-5 w-5" aria-hidden="true" />{label}</NavLink>
            ))}
          </nav>
          <button onClick={logout} className="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-3 text-icy hover:bg-white/10 hover:text-white"><LogOut className="h-5 w-5" aria-hidden="true" />Log out</button>
        </aside>
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-6xl"><Outlet /></div>
        </main>
      </div>
    </ToastProvider>
  )
}
