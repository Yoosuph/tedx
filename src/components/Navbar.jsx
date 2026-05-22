import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [lastScroll, setLastScroll] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 50)
      setHidden(y > lastScroll && y > 100)
      setLastScroll(y)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastScroll])

  const scrollTo = (id) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      const top = el.offsetTop - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const links = [
    { label: 'Home', href: 'home' },
    { label: 'About', href: 'about' },
    { label: 'Speakers', href: 'speakers' },
    { label: 'Schedule', href: 'schedule' },
    { label: 'Partners', href: 'sponsors' },
    { label: 'Contact', href: 'contact' },
  ]

  return (
    <nav
      style={{
        position: 'fixed', top: 0, width: '100%',
        background: 'rgba(10,10,35,0.9)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)', zIndex: 1000,
        padding: scrolled ? '0.75rem 0' : '1rem 0',
        transition: 'var(--transition)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
      }}
    >
      <div style={{
        maxWidth: 1400, margin: '0 auto', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', padding: '0 2rem',
      }}>
        <div
          onClick={() => scrollTo('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <i className="fas fa-comment-dots" style={{
            fontSize: '1.5rem',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }} />
          <span style={{
            fontSize: '1.8rem', fontWeight: 700,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            TEDx<span style={{ color: '#fff', fontWeight: 400, WebkitTextFillColor: '#fff' }}>Dutse</span>
          </span>
        </div>

        <ul style={{
          display: 'flex', listStyle: 'none', gap: '1.5rem',
          ...(menuOpen ? {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
            background: 'var(--secondary)', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', gap: '2rem',
            zIndex: 999, opacity: 1,
          } : {}),
        }}>
          {links.map(l => (
            <li key={l.href}>
              <a
                href={`#${l.href}`}
                onClick={(e) => { e.preventDefault(); scrollTo(l.href) }}
                style={{
                  color: '#fff', fontWeight: 500, fontSize: menuOpen ? '1.5rem' : '0.95rem',
                  padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-xl)',
                  transition: 'var(--transition)', position: 'relative',
                }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none', flexDirection: 'column', cursor: 'pointer',
            padding: '0.5rem', zIndex: 1001,
          }}
          className={menuOpen ? 'mobile-menu active' : 'mobile-menu'}
        >
          <span style={{
            width: 28, height: 3, background: '#fff', margin: '3px 0',
            borderRadius: 2, transition: 'var(--transition)',
            transformOrigin: 'left center',
            transform: menuOpen ? 'rotate(45deg) translate(1px, -1px)' : 'none',
          }} />
          <span style={{
            width: 28, height: 3, background: '#fff', margin: '3px 0',
            borderRadius: 2, transition: 'var(--transition)',
            opacity: menuOpen ? 0 : 1,
          }} />
          <span style={{
            width: 28, height: 3, background: '#fff', margin: '3px 0',
            borderRadius: 2, transition: 'var(--transition)',
            transformOrigin: 'left center',
            transform: menuOpen ? 'rotate(-45deg) translate(1px, 1px)' : 'none',
          }} />
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu { display: flex !important; }
          nav ul { display: none; }
          nav ul.active { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
