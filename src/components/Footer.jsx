import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/10 bg-midnight/60">
      <div className="container-w flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-icy/80">Make Christmas More Magical.</p>
        </div>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-icy">
          <li><a className="hover:text-white" href="/#about">About</a></li>
          <li><Link className="hover:text-white" to="/privacy">Privacy Policy</Link></li>
          <li><Link className="hover:text-white" to="/terms">Terms and Conditions</Link></li>
        </ul>
      </div>
      <p className="container-w pb-8 text-xs text-icy/60">&copy; {new Date().getFullYear()} WinterWish. All rights reserved.</p>
    </footer>
  )
}
