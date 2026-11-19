import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/find-group', label: 'Find Your Group' },
  { to: '/#about', label: 'About', hash: true },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const cls = ({ isActive }) =>
    `rounded-full px-4 py-2 text-[15px] font-medium transition ${isActive ? 'bg-white/15 text-white' : 'text-icy hover:bg-white/10 hover:text-white'}`
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-midnight/70 backdrop-blur-lg">
      <nav className="container-w flex h-16 items-center justify-between" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) =>
            l.hash ? (
              <a key={l.to} href={l.to} className="rounded-full px-4 py-2 text-[15px] font-medium text-icy transition hover:bg-white/10 hover:text-white">{l.label}</a>
            ) : (
              <NavLink key={l.to} to={l.to} end={l.end} className={cls}>{l.label}</NavLink>
            )
          )}
          <Link to="/admin/login" className="btn-ghost ml-2 !min-h-[40px] !px-5">Administrator Login</Link>
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-full text-white hover:bg-white/10 md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="container-w flex flex-col gap-1 pb-4 md:hidden">
          {links.map((l) =>
            l.hash ? (
              <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-icy hover:bg-white/10">{l.label}</a>
            ) : (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className={cls}>{l.label}</NavLink>
            )
          )}
          <Link to="/admin/login" onClick={() => setOpen(false)} className="btn-ghost mt-2">Administrator Login</Link>
        </div>
      )}
    </header>
  )
}
