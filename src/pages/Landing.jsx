import { Link } from 'react-router-dom'
import { Lock, Gift, Search, Timer } from 'lucide-react'
import Page from '../components/Page'
import HeroScene from '../components/HeroScene'

const steps = [
  ['Find your group', 'Search by group name or the code your organizer shared.'],
  ['Enter your group password', 'Each group has its own password, so only your people get in.'],
  ['Explore the members', 'See everyone who is part of your Secret Santa group.'],
  ['Discover their wishlists', 'Open any member to see what would make their Christmas.'],
]
const features = [
  [Lock, 'Private group access', 'Every group is locked behind its own password.'],
  [Gift, 'Organized member wishlists', 'Items come with descriptions, links, photos and a priority.'],
  [Search, 'Easy group searching', 'Find your group by name or code in seconds.'],
  [Timer, 'Christmas party countdown', 'A live countdown to your group\'s party date.'],
]

export default function Landing() {
  return (
    <Page>
      <section className="relative isolate overflow-hidden">
        <HeroScene />
        <div className="container-w relative flex min-h-[92vh] flex-col items-center justify-center pb-56 pt-20 text-center sm:pb-64">
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-7xl">Make Christmas More Magical.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-icy">
            Bring everyone together this Christmas. Find your Secret Santa group, explore everyone's wishlists, and make every gift a little more meaningful.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/find-group" className="btn-primary">Find Your Group</Link>
            <a href="#how-it-works" className="btn-ghost">How It Works</a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container-w scroll-mt-20 py-20">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">How it works</h2>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([t, d], i) => (
            <li key={t} className="glass p-6">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gold font-display text-lg font-semibold text-midnight">{i + 1}</span>
              <h3 className="mt-4 text-xl font-semibold text-white">{t}</h3>
              <p className="mt-2 text-icy">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-w py-8">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Built for your gift circle</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {features.map(([Icon, t, d]) => (
            <div key={t} className="card-snow flex gap-4 p-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ice text-royal"><Icon className="h-6 w-6" aria-hidden="true" /></span>
              <div>
                <h3 className="text-xl font-semibold">{t}</h3>
                <p className="mt-1 text-winter">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="container-w scroll-mt-20 py-20">
        <div className="glass max-w-3xl p-8 sm:p-12">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">About WinterWish</h2>
          <p className="mt-4 text-lg leading-relaxed text-icy">
            WinterWish keeps your Secret Santa group in one place. Your organizer sets up the group and adds every member and wishlist, so there is nothing to sign up for. Unlock your group with its password, browse the wishlists, and pick a gift that fits.
          </p>
        </div>
      </section>
    </Page>
  )
}
