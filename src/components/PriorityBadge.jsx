import { ArrowUp, Minus, ArrowDown } from 'lucide-react'
const map = {
  High: { Icon: ArrowUp, cls: 'bg-gold text-midnight' },
  Medium: { Icon: Minus, cls: 'bg-royal text-white' },
  Low: { Icon: ArrowDown, cls: 'bg-silver text-midnight' },
}
export default function PriorityBadge({ priority = 'Medium' }) {
  const { Icon, cls } = map[priority] || map.Medium
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />{priority} priority
    </span>
  )
}
