import { Link, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Gift } from 'lucide-react'
import Page from '../components/Page'
import Avatar from '../components/Avatar'
import EmptyState from '../components/EmptyState'
import PriorityBadge from '../components/PriorityBadge'
import { sortWishlist } from '../lib/format'

const safeUrl = (u) => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : null } catch { return null } }

export default function MemberWishlist() {
  const { groupCode, group, members } = useOutletContext()
  const { memberId } = useParams()
  const member = members.find((m) => m.id === memberId)
  const back = (
    <Link to={`/group/${groupCode}/dashboard`} className="inline-flex items-center gap-2 text-icy hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to {group.groupName}</Link>
  )

  if (!member) return <Page className="container-w py-12">{back}<div className="mt-8"><EmptyState title="Member not found" text="This member is not part of the group." /></div></Page>
  const items = sortWishlist(member.wishlist)

  return (
    <Page className="container-w py-12">
      {back}
      <div className="mt-8 flex items-center gap-5">
        <Avatar name={member.fullName} src={member.photoURL} size="h-20 w-20 text-2xl" />
        <div>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">{member.fullName}</h1>
          <p className="mt-1 text-icy">{items.length} wishlist {items.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="mt-10">
        {items.length === 0 ? (
          <EmptyState title="This wishlist is empty" text="Nothing has been added for this member yet. Check back later." />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {items.map((it) => {
              const link = it.productLink && safeUrl(it.productLink)
              const img = it.imageURL && safeUrl(it.imageURL)
              return (
                <li key={it.id} className="card-snow flex flex-col overflow-hidden sm:flex-row">
                  {img ? (
                    <img src={img} alt="" loading="lazy" className="h-44 w-full object-cover sm:h-auto sm:w-40" />
                  ) : (
                    <div className="grid h-24 w-full place-items-center bg-ice text-royal sm:h-auto sm:w-32"><Gift className="h-9 w-9" aria-hidden="true" /></div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <PriorityBadge priority={it.priority} />
                    <h2 className="mt-3 text-xl font-semibold leading-snug">{it.itemName}</h2>
                    {it.description && <p className="mt-1 text-winter">{it.description}</p>}
                    {link && (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-royal hover:underline">
                        View product<ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Page>
  )
}
