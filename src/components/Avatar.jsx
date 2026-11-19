import { initials } from '../lib/format'
export default function Avatar({ name, src, size = 'h-16 w-16 text-xl' }) {
  if (src) return <img src={src} alt="" loading="lazy" className={`${size} rounded-full object-cover ring-2 ring-icy`} />
  return (
    <span aria-hidden="true" className={`${size} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-royal to-winter font-display font-semibold text-white ring-2 ring-icy`}>
      {initials(name)}
    </span>
  )
}
