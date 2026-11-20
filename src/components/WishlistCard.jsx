import { Gift } from 'lucide-react'
import { sortWishlist } from '../lib/format'

export default function WishlistCard({ items, note }) {
  const list = sortWishlist(items)
  const text = note?.trim()
  return (
    <article className="card-snow mx-auto w-full max-w-2xl p-5 sm:p-8">
      <h2 className="flex items-center gap-2 text-xl font-semibold"><Gift className="h-5 w-5 text-royal" aria-hidden="true" />Wishlist</h2>
      <ul className="mt-3 divide-y divide-icy">
        {list.map((it) => (
          <li key={it.id} className="flex gap-3 py-3">
            <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-royal" />
            <div className="min-w-0">
              <p className="font-semibold leading-snug">{it.itemName}</p>
              {it.description && <p className="mt-0.5 text-sm text-winter">{it.description}</p>}
            </div>
          </li>
        ))}
      </ul>
      {text && (
        <div className="mt-4 rounded-2xl bg-ice p-4 text-sm text-winter">
          <p className="font-semibold text-midnight">Note</p>
          <p className="mt-1 whitespace-pre-line">{text}</p>
        </div>
      )}
    </article>
  )
}