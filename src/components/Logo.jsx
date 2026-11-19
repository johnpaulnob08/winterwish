import { Link } from 'react-router-dom'

export function Flake({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path d="M16 3v26M5 9.5l22 13M27 9.5l-22 13" stroke="#BFDBFE" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12.5 5.5L16 9l3.5-3.5M12.5 26.5L16 23l3.5 3.5" stroke="#BFDBFE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="2.6" fill="#F5D76E" />
    </svg>
  )
}

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-full" aria-label="WinterWish home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-winter ring-1 ring-icy/40"><Flake className="h-6 w-6" /></span>
      <span className="font-display text-xl font-semibold tracking-tight text-white">WinterWish</span>
    </Link>
  )
}
