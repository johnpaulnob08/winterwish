import { useEffect, useRef } from 'react'

export default function Snowfall({ count = 70 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = ref.current
    const ctx = c.getContext('2d')
    let w = 0, h = 0, raf
    const resize = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2)
      w = c.clientWidth; h = c.clientHeight
      c.width = w * d; c.height = h * d
      ctx.setTransform(d, 0, 0, d, 0, 0)
    }
    resize()
    const n = window.innerWidth < 640 ? Math.round(count * 0.5) : count
    const flakes = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2.2 + 0.6, s: Math.random() * 0.6 + 0.25, d: Math.random() * 6.28,
    }))
    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(255,255,255,.85)'
      for (const f of flakes) {
        f.d += 0.01; f.y += f.s; f.x += Math.sin(f.d) * 0.35
        if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(tick) }
    tick()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', vis)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [count])
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
}
