import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';

const navItems = [
  { label: 'Dashboard', path: '/admin/tickets', icon: '📊' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
  { label: 'Pricing', path: '/admin/pricing', icon: '💰' },
  { label: 'Speakers', path: '/admin/speakers', icon: '🎤' },
  { label: 'Schedule', path: '/admin/schedule', icon: '📅' },
  { label: 'Gallery', path: '/admin/gallery', icon: '🖼️' },
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      <Navbar />
      <style>{`
        .admin-container {
          padding-top: var(--nav-height);
          min-height: 100vh;
          background: var(--dark);
        }
        .admin-shell {
          display: flex;
          min-height: calc(100vh - var(--nav-height));
        }
        .admin-sidebar {
          width: 260px;
          background: var(--dark-surface);
          border-right: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: var(--nav-height);
          height: calc(100vh - var(--nav-height));
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1.5rem 0.75rem;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          color: var(--gray-400);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .sidebar-link:hover {
          background: rgba(255,255,255,0.05);
          color: var(--white);
        }
        .sidebar-link.active {
          background: rgba(235, 0, 40, 0.12);
          color: var(--ted-red);
          font-weight: 600;
        }
        .sidebar-link span.icon {
          font-size: 1.125rem;
          width: 24px;
          text-align: center;
        }
        .sidebar-footer {
          padding: 1rem 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin-top: auto;
        }
        .btn-sidebar-logout {
          width: 100%;
          padding: 0.625rem 1rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: var(--gray-400);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-sidebar-logout:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #FCA5A5;
        }
        .admin-main {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          max-width: 1400px;
        }

        /* Mobile: hamburger-style sidebar */
        .mobile-admin-toggle {
          display: none;
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--ted-red);
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(235, 0, 40, 0.4);
        }
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 998;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            left: -280px;
            top: 0;
            bottom: 0;
            z-index: 999;
            transition: left 0.3s ease;
            height: 100vh;
            padding-top: var(--nav-height);
          }
          .admin-sidebar.open {
            left: 0;
          }
          .sidebar-overlay.open {
            display: block;
          }
          .mobile-admin-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .admin-main {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>

      <div className="admin-container">
        <div className="admin-shell">
          <SidebarNav
            location={location}
            onLogout={handleLogout}
          />
          <div className="admin-main">
            {children}
          </div>
          <MobileToggle />
        </div>
      </div>
    </>
  );
}

function SidebarNav({ location, onLogout, onClose }) {
  return (
    <>
      <div className="admin-sidebar" id="admin-sidebar">
        <div className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="sidebar-footer">
          <button className="btn-sidebar-logout" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

function MobileToggle() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="mobile-admin-toggle" onClick={() => setOpen(!open)}>
        {open ? '✕' : '☰'}
      </button>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      {open && (
        <style>{`
          .admin-sidebar { left: 0 !important; }
        `}</style>
      )}
    </>
  );
}
