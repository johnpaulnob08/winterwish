import { Flake } from './Logo'

const art = {
  tree: (
    <svg viewBox="0 0 100 100" className="h-24 w-24" aria-hidden="true">
      <polygon points="50,8 24,48 76,48" fill="#2563EB" /><polygon points="50,8 40,26 60,26" fill="#fff" />
      <polygon points="50,30 18,76 82,76" fill="#1d4f91" /><polygon points="50,30 38,52 62,52" fill="#fff" />
      <rect x="45" y="76" width="10" height="14" fill="#0b1d3d" /><circle cx="50" cy="6" r="4" fill="#F5D76E" />
    </svg>
  ),
  flake: <Flake className="h-20 w-20" />,
}

export default function EmptyState({ title, text, icon = 'flake', children }) {
  return (
    <div className="glass mx-auto flex max-w-lg flex-col items-center px-6 py-12 text-center">
      {art[icon]}
      <h3 className="mt-4 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-icy">{text}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
