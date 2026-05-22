import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useScrollPosition } from '../../hooks/useScrollAnimation';

const links = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Speakers', href: '/speakers' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Partners', href: '/sponsors' },
];

export default function Navbar() {
  const { scrollY, isScrolled, scrollDirection } = useScrollPosition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const location = useLocation();

  // Hide on scroll down, show on scroll up (only when scrolled past threshold)
  useEffect(() => {
    if (mobileOpen) {
      setHidden(false);
      return;
    }
    if (scrollY > 100 && scrollDirection === 'down') {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [scrollY, scrollDirection, mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 1000,
    height: isScrolled ? 'var(--nav-height-scrolled)' : 'var(--nav-height)',
    background: isScrolled || location.pathname !== '/' ? 'rgba(10, 10, 10, 0.95)' : 'transparent',
    backdropFilter: isScrolled || location.pathname !== '/' ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: isScrolled || location.pathname !== '/' ? 'blur(12px)' : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 clamp(1.5rem, 5vw, 4rem)',
    transition: `height var(--transition-base), background var(--transition-base), transform var(--transition-base)`,
    transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
    fontFamily: 'var(--font-sans)',
    borderBottom: isScrolled || location.pathname !== '/' ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
  };

  const logoStyle = {
    fontSize: '1.8rem',
    fontWeight: 700,
    textDecoration: 'none',
    cursor: 'pointer',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  };

  const desktopNavStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  };

  const linkStyle = {
    color: 'var(--white)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    transition: 'color var(--transition-base)',
    cursor: 'pointer',
    position: 'relative',
  };

  const ticketBtnStyle = {
    background: 'var(--ted-red)',
    color: 'var(--white)',
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    textDecoration: 'none',
    transition: 'background var(--transition-base), transform var(--transition-base)',
    cursor: 'pointer',
    border: 'none',
    whiteSpace: 'nowrap',
  };

  const hamburgerStyle = {
    display: 'none',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    zIndex: 1100,
    position: 'relative',
  };

  const spanBase = {
    display: 'block',
    width: '24px',
    height: '2px',
    background: 'var(--white)',
    borderRadius: '2px',
    transition: 'transform var(--transition-base), opacity var(--transition-base)',
    position: 'absolute',
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(10, 10, 10, 0.98)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2rem',
    zIndex: 1050,
    opacity: mobileOpen ? 1 : 0,
    pointerEvents: mobileOpen ? 'auto' : 'none',
    transition: 'opacity var(--transition-base)',
  };

  const mobileLinkStyle = {
    color: 'var(--white)',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    transition: 'color var(--transition-base)',
    cursor: 'pointer',
  };

  return (
    <>
      <style>{`
        .navbar-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--ted-red);
          transition: width var(--transition-base);
        }
        .navbar-link:hover::after,
        .navbar-link.active::after {
          width: 100%;
        }
        .navbar-link:hover,
        .navbar-link.active {
          color: var(--ted-red) !important;
        }
        .ticket-btn:hover {
          background: #c5001f !important;
          transform: scale(1.05);
        }
        .mobile-link:hover {
          color: var(--ted-red) !important;
        }
        .hamburger-btn:focus-visible {
          outline: 2px solid var(--ted-red);
          outline-offset: 2px;
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-overlay {
            display: none !important;
          }
        }
      `}</style>

      <nav style={navStyle} role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <Link
          to="/"
          style={logoStyle}
          aria-label="TEDxDutse home"
        >
          <span style={{ color: 'var(--ted-red)' }}>TEDx</span>
          <span style={{ color: 'var(--white)' }}>Dutse</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav" style={desktopNavStyle}>
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`navbar-link ${location.pathname === link.href ? 'active' : ''}`}
              style={linkStyle}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/tickets"
            className="ticket-btn"
            style={ticketBtnStyle}
          >
            Get Tickets
          </Link>
        </div>

        {/* Hamburger Button */}
        <button
          className="hamburger-btn"
          style={hamburgerStyle}
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span
            style={{
              ...spanBase,
              transform: mobileOpen
                ? 'rotate(45deg) translateY(0)'
                : 'translateY(-7px)',
            }}
          />
          <span
            style={{
              ...spanBase,
              opacity: mobileOpen ? 0 : 1,
              transform: mobileOpen ? 'scaleX(0)' : 'scaleX(1)',
            }}
          />
          <span
            style={{
              ...spanBase,
              transform: mobileOpen
                ? 'rotate(-45deg) translateY(0)'
                : 'translateY(7px)',
            }}
          />
        </button>
      </nav>

      {/* Mobile Overlay */}
      <div className="mobile-overlay" style={overlayStyle} aria-hidden={!mobileOpen}>
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="mobile-link"
            style={mobileLinkStyle}
          >
            {link.label}
          </Link>
        ))}
        <Link
          to="/tickets"
          className="ticket-btn"
          style={{
            ...ticketBtnStyle,
            marginTop: '1rem',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
          }}
        >
          Get Tickets
        </Link>
      </div>
    </>
  );
}
