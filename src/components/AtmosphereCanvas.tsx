import { useEffect, useRef } from 'react'

export function AtmosphereCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    let frame = 0
    let animation = 0
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const draw = (time: number) => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = window.innerWidth
      const height = window.innerHeight
      if (canvas.width !== width * ratio || canvas.height !== height * ratio) { canvas.width = width * ratio; canvas.height = height * ratio; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; context.setTransform(ratio, 0, 0, ratio, 0, 0) }
      context.clearRect(0, 0, width, height)
      const pulse = reduce ? 0 : Math.sin(time / 5000) * 0.08
      for (let index = 0; index < 110; index += 1) {
        const x = (index * 137.17 + 80) % width
        const y = (index * 71.37 + 24) % height
        const radius = 0.6 + ((index * 17) % 5) / 4
        context.fillStyle = `rgba(${index % 4 === 0 ? '91,228,214' : '147,163,184'},${0.04 + ((index % 5) / 100) + pulse})`
        context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fill()
        if (index % 9 === 0) { context.strokeStyle = 'rgba(91,228,214,0.045)'; context.beginPath(); context.moveTo(x, y); context.lineTo((x + 150) % width, (y + 55) % height); context.stroke() }
      }
      frame += 1
      if (!reduce || frame < 2) animation = requestAnimationFrame(draw)
    }
    draw(0)
    return () => cancelAnimationFrame(animation)
  }, [])
  return <canvas className="atmosphere-canvas" ref={ref} aria-hidden="true" />
}
