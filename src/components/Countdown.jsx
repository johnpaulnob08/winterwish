import useCountdown from '../lib/useCountdown'

export default function Countdown({ target }) {
  const t = useCountdown(target)
  if (t.done) {
    return <p className="glass px-6 py-5 text-center font-display text-xl text-icy">Christmas memories made. Until next time!</p>
  }
  const cells = [['Days', t.days], ['Hours', t.hours], ['Minutes', t.minutes], ['Seconds', t.seconds]]
  return (
    <div role="timer" aria-label="Time until the party" className="grid grid-cols-4 gap-2 sm:gap-4">
      {cells.map(([label, v]) => (
        <div key={label} className="rounded-2xl border border-icy/30 bg-gradient-to-b from-white/20 to-white/5 px-1 py-3 text-center shadow-[0_0_30px_-8px_rgba(191,219,254,.5)] sm:py-5">
          <div className="font-display text-3xl font-semibold tabular-nums text-white sm:text-5xl">{String(v).padStart(2, '0')}</div>
          <div className="mt-1 text-xs text-icy sm:text-sm">{label}</div>
        </div>
      ))}
    </div>
  )
}
