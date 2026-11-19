import { Link } from 'react-router-dom'
import Page from '../components/Page'
import EmptyState from '../components/EmptyState'

export function Legal({ title, children }) {
  return (
    <Page className="container-w py-14">
      <article className="glass mx-auto max-w-3xl space-y-4 p-8 text-icy sm:p-12">
        <h1 className="text-4xl font-semibold text-white">{title}</h1>
        {children}
      </article>
    </Page>
  )
}

export const Privacy = () => (
  <Legal title="Privacy Policy">
    <p>WinterWish stores the group details, member names and wishlists that your organizer enters. Participants do not create accounts, and we do not ask you for personal information to browse a group.</p>
    <p>Your group password unlocks that group for a short time in your current browser tab. Closing the tab ends your access.</p>
    <p>Replace this text with your final policy before launch.</p>
  </Legal>
)
export const Terms = () => (
  <Legal title="Terms and Conditions">
    <p>WinterWish is a read-only viewer for Secret Santa groups. Only the administrator can add or change groups, members and wishlists.</p>
    <p>Keep your group code and password to yourself and the people in your group.</p>
    <p>Replace this text with your final terms before launch.</p>
  </Legal>
)
export const NotFound = () => (
  <Page className="container-w py-20">
    <EmptyState title="This page is lost in the snow" text="The address may be wrong or the page may have moved."><Link to="/" className="btn-primary">Back to home</Link></EmptyState>
  </Page>
)
export const AdminSoon = () => (
  <Page className="container-w py-20">
    <EmptyState title="Administrator area is coming next" text="Login and the dashboard are built in the next phase."><Link to="/" className="btn-primary">Back to home</Link></EmptyState>
  </Page>
)
