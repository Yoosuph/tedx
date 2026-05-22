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
  const { isScrolled } = useScrollPosition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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

  return (
    <>
      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          height: var(--nav-height, 72px);
          background: ${isScrolled || location.pathname !== '/' ? 'rgba(10, 10, 10, 0.95)' : 'transparent'};
          backdrop-filter: ${isScrolled || location.pathname !== '/' ? 'blur(12px)' : 'none'};
          -webkit-backdrop-filter: ${isScrolled || location.pathname !== '/' ? 'blur(12px)' : 'none'};
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(1.5rem, 5vw, 4rem);
          transition: background 0.3s ease, backdrop-filter 0.3s ease;
          font-family: var(--font-sans);
          border-bottom: ${isScrolled || location.pathname !== '/' ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent'};
        }

        .navbar-logo {
          font-size: 1.8rem;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          letter-spacing: -0.02em;
          line-height: 1;
          color: var(--white);
        }

        .navbar-logo-red {
          color: var(--ted-red, #EB0028);
        }

        .navbar-desktop {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .navbar-link {
          color: var(--white);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          transition: color 0.3s ease;
          cursor: pointer;
          position: relative;
        }

        .navbar-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--ted-red, #EB0028);
          transition: width 0.3s ease;
        }

        .navbar-link:hover::after,
        .navbar-link.active::after {
          width: 100%;
        }

        .navbar-link:hover,
        .navbar-link.active {
          color: var(--ted-red, #EB0028) !important;
        }

        .navbar-ticket-btn {
          background: var(--ted-red, #EB0028);
          color: var(--white);
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-decoration: none;
          transition: background 0.3s ease, transform 0.3s ease;
          cursor: pointer;
          border: none;
          white-space: nowrap;
        }

        .navbar-ticket-btn:hover {
          background: #c5001f !important;
          transform: scale(1.05);
        }

        /* Hamburger Menu */
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 44px;
          height: 44px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0;
          z-index: 1100;
          position: relative;
          transition: all 0.3s ease;
        }

        .hamburger:hover {
          background: rgba(235, 0, 40, 0.1);
          border-color: rgba(235, 0, 40, 0.3);
        }

        .hamburger:focus-visible {
          outline: 2px solid var(--ted-red, #EB0028);
          outline-offset: 2px;
        }

        .hamburger-line {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--white);
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          position: absolute;
        }

        .hamburger-line:nth-child(1) {
          transform: translateY(-6px);
        }

        .hamburger-line:nth-child(2) {
          transform: translateY(0);
        }

        .hamburger-line:nth-child(3) {
          transform: translateY(6px);
        }

        .hamburger.open .hamburger-line:nth-child(1) {
          transform: rotate(45deg);
          background: var(--ted-red, #EB0028);
        }

        .hamburger.open .hamburger-line:nth-child(2) {
          opacity: 0;
          transform: translateX(-20px);
        }

        .hamburger.open .hamburger-line:nth-child(3) {
          transform: rotate(-45deg);
          background: var(--ted-red, #EB0028);
        }

        /* Mobile Menu Overlay */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 400px;
          height: 100vh;
          background: rgba(10, 10, 10, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          padding: 6rem 2rem 2rem;
          z-index: 1050;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: -20px 0 60px rgba(0, 0, 0, 0.5);
        }

        .mobile-menu.open {
          transform: translateX(0);
        }

        .mobile-menu-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .mobile-link {
          color: var(--white);
          text-decoration: none;
          font-size: 1.5rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          transition: all 0.3s ease;
          cursor: pointer;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }

        .mobile-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 4px;
          height: 100%;
          background: var(--ted-red, #EB0028);
          transform: scaleY(0);
          transition: transform 0.3s ease;
        }

        .mobile-link:hover {
          background: rgba(235, 0, 40, 0.1);
          padding-left: 2rem;
        }

        .mobile-link:hover::before {
          transform: scaleY(1);
        }

        .mobile-link.active {
          background: rgba(235, 0, 40, 0.1);
          padding-left: 2rem;
        }

        .mobile-link.active::before {
          transform: scaleY(1);
        }

        .mobile-menu-footer {
          margin-top: auto;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mobile-ticket-btn {
          background: var(--ted-red, #EB0028);
          color: var(--white);
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-decoration: none;
          text-align: center;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .mobile-ticket-btn:hover {
          background: #c5001f;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(235, 0, 40, 0.3);
        }

        .mobile-menu-info {
          color: var(--gray-500, #888);
          font-size: 0.875rem;
          line-height: 1.6;
          text-align: center;
        }

        /* Backdrop */
        .mobile-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1049;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .mobile-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }

        @media (max-width: 768px) {
          .navbar-desktop {
            display: none !important;
          }
          .hamburger {
            display: flex !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu,
          .mobile-backdrop {
            display: none !important;
          }
        }
      `}</style>

      <nav className="navbar" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <Link to="/" className="navbar-logo" aria-label="TEDxDutse home">
          <span className="navbar-logo-red">TEDx</span>
          <span>Dutse</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`navbar-link ${location.pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/tickets" className="navbar-ticket-btn">
            Get Tickets
          </Link>
        </div>

        {/* Hamburger Button */}
        <button
          className={`hamburger ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </nav>

      {/* Mobile Backdrop */}
      <div
        className={`mobile-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="mobile-menu-links">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`mobile-link ${location.pathname === link.href ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mobile-menu-footer">
          <Link to="/tickets" className="mobile-ticket-btn" onClick={() => setMobileOpen(false)}>
            Get Tickets
          </Link>
          <p className="mobile-menu-info">
            TEDxDutse 2026<br />
            November 28, 2026
          </p>
        </div>
      </div>
    </>
  );
}
