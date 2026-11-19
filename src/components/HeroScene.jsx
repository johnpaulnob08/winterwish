import { useMemo } from 'react'

export function Tree({ className = '', style }) {
  const tiers = [[6, 52, 26], [34, 86, 34], [62, 122, 42]]
  const lights = [[50, 30], [38, 62], [62, 70], [28, 100], [72, 108], [50, 96]]
  return (
    <svg viewBox="0 -4 100 144" className={className} style={style} aria-hidden="true">
      <rect x="45" y="120" width="10" height="18" fill="#0b1d3d" />
      {tiers.map(([top, bottom, w], i) => {
        const capY = top + (bottom - top) * 0.42, capW = w * 0.42
        return (
          <g key={i}>
            <polygon points={`50,${top} ${50 - w},${bottom} ${50 + w},${bottom}`} fill={i % 2 ? '#1d4f91' : '#2563EB'} />
            <polygon points={`50,${top} ${50 - capW},${capY} ${50 + capW},${capY}`} fill="#fff" />
          </g>
        )
      })}
      {lights.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.2" fill="#F5D76E" className="animate-glow" style={{ animationDelay: `${i * 0.35}s` }} />
      ))}
      <polygon points="50,-2 52.4,4 58,4 53.6,7.6 55.4,13 50,9.8 44.6,13 46.4,7.6 42,4 47.6,4" fill="#F5D76E" />
    </svg>
  )
}

function Ornament({ x, len, color, delay }) {
  return (
    <div className="absolute top-0 origin-top animate-sway" style={{ left: `${x}%`, animationDelay: `${delay}s` }} aria-hidden="true">
      <div className="mx-auto w-px bg-silver/60" style={{ height: len }} />
      <div className="-mt-px h-2 w-3 -translate-x-[5px] rounded-sm bg-silver" />
      <div className="h-8 w-8 -translate-x-[15px] rounded-full shadow-[inset_-4px_-4px_8px_rgba(0,0,0,.25),0_0_18px_rgba(191,219,254,.4)]" style={{ background: `radial-gradient(circle at 30% 28%, #fff 0, ${color} 45%, #173B70 100%)` }} />
    </div>
  )
}

export default function HeroScene() {
  const stars = useMemo(
    () => Array.from({ length: 38 }, (_, i) => ({
      x: (i * 53.7) % 100, y: (i * 29.3) % 62, s: 1 + (i % 3), d: (i % 9) * 0.45,
    })), [])
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {stars.map((s, i) => (
        <span key={i} className="absolute animate-twinkle rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />
      ))}
      <Ornament x={8} len={70} color="#2563EB" delay={0} />
      <Ornament x={22} len={130} color="#F5D76E" delay={1.2} />
      <Ornament x={78} len={100} color="#BFDBFE" delay={0.6} />
      <Ornament x={92} len={60} color="#2563EB" delay={1.8} />
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-40 w-full sm:h-56">
        <path d="M0 120 Q240 40 520 110 T1040 90 T1440 100 V220 H0Z" fill="#DBEAFE" opacity=".35" />
        <path d="M0 160 Q300 90 640 150 T1440 130 V220 H0Z" fill="#BFDBFE" opacity=".6" />
        <path d="M0 190 Q360 140 760 180 T1440 170 V220 H0Z" fill="#F0F7FF" />
      </svg>
      <Tree className="absolute bottom-12 left-[3%] h-44 sm:h-72" />
      <Tree className="absolute bottom-16 left-[17%] hidden h-32 opacity-80 sm:block" />
      <Tree className="absolute bottom-14 right-[4%] h-52 sm:h-80" />
      <Tree className="absolute bottom-20 right-[19%] hidden h-28 opacity-80 sm:block" />
    </div>
  )
}
