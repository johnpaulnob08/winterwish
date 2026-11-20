import { Link, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Page from '../components/Page'
import Avatar from '../components/Avatar'
import EmptyState from '../components/EmptyState'
import WishlistCard from '../components/WishlistCard'
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
          <WishlistCard items={items} note={member.note} />
        )}
      </div>
    </Page>
  )
}
