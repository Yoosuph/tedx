import { useEffect, useRef } from 'react'

export default function Particles() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const count = window.innerWidth < 768 ? 30 : 50

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div')
      p.style.cssText = `
        position: absolute;
        background: ${i % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(230,43,30,0.5)'};
        border-radius: 50%;
        pointer-events: none;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `
      const dur = Math.random() * 20 + 10
      const del = Math.random() * 5
      const xM = (Math.random() - 0.5) * 100
      const yM = (Math.random() - 0.5) * 100
      p.style.animation = `floatP${i} ${dur}s ease-in-out ${del}s infinite`

      const style = document.createElement('style')
      style.textContent = `
        @keyframes floatP${i} {
          0% { transform: translate(0,0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(${xM}px,${yM}px); opacity: 0; }
        }
      `
      document.head.appendChild(style)
      container.appendChild(p)
    }

    return () => {
      container.innerHTML = ''
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 1, overflow: 'hidden',
      }}
    />
  )
}
