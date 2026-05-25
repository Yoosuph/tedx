import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminPageTransition from './AdminPageTransition';
import { skeletonStyles } from '../../components/shared/AdminSkeleton';

const navItems = [
  { label: 'Dashboard', path: '/admin/tickets', icon: '📊' },
  { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
  { label: 'Pricing', path: '/admin/pricing', icon: '💰' },
  { label: 'Speakers', path: '/admin/speakers', icon: '🎤' },
  { label: 'Schedule', path: '/admin/schedule', icon: '📅' },
  { label: 'Gallery', path: '/admin/gallery', icon: '🖼️' },
  { label: 'Certificates', path: '/admin/certificates', icon: '📜' },
  { label: 'Speaker Certs', path: '/admin/speaker-certificates', icon: '🏆' },
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Get current page title dynamically from location path
  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item ? item.label : 'Admin';
  };

  return (
    <>
      <style>{`
        .admin-container {
          min-height: 100vh;
          background: var(--dark);
          color: var(--white);
          font-family: var(--font-sans);
        }
        .admin-shell {
          display: flex;
          min-height: 100vh;
        }
        
        /* ─── Admin Sidebar ─── */
        .admin-sidebar {
          width: 260px;
          background: var(--dark-surface);
          border-right: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }
        
        /* Sidebar Logo Branding */
        .sidebar-brand {
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-brand-link {
          font-size: 1.25rem;
          font-weight: 700;
          text-decoration: none;
          color: var(--white);
          letter-spacing: -0.02em;
        }
        .sidebar-brand-red {
          color: var(--ted-red);
        }
        .sidebar-brand-tag {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          background: rgba(255,255,255,0.08);
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          margin-left: 0.5rem;
          color: var(--gray-400);
          letter-spacing: 0.05em;
        }

        /* Dedicated Scrollable Link Container */
        .sidebar-nav-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        /* Custom Scrollbar for Sidebar Links */
        .sidebar-nav-container::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav-container::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 99px;
        }
        .sidebar-nav-container::-webkit-scrollbar-thumb:hover {
          background: var(--ted-red);
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
          transition: all 0.2s ease;
          position: relative;
        }
        .sidebar-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: var(--ted-red);
          border-radius: 0 2px 2px 0;
          transition: height 0.2s ease;
        }
        .sidebar-link:hover {
          background: rgba(255,255,255,0.04);
          color: var(--white);
          transform: translateX(2px);
        }
        .sidebar-link.active {
          background: rgba(235, 0, 40, 0.1);
          color: var(--ted-red);
          font-weight: 600;
        }
        .sidebar-link.active::before {
          height: 60%;
        }
        .sidebar-link span.icon {
          font-size: 1.125rem;
          width: 24px;
          text-align: center;
        }
        
        /* Pinned Sidebar Footer containing Sign Out */
        .sidebar-footer {
          padding: 1.25rem 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: var(--dark-surface);
          position: sticky;
          bottom: 0;
          z-index: 10;
        }
        .btn-sidebar-logout {
          width: 100%;
          padding: 0.75rem 1rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: var(--gray-400);
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .btn-sidebar-logout:hover {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.25);
          color: #FCA5A5;
        }

        /* ─── Admin Content Area ─── */
        .admin-content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0; /* Prevents layout distortion */
        }

        /* Sleek Glassmorphic Admin Header */
        .admin-header {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 3rem;
          background: rgba(17, 17, 17, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          z-index: 90;
        }
        .admin-header-left {
          display: flex;
          align-items: center;
        }
        .admin-sidebar-toggle {
          display: none; /* Desktop hidden */
          background: transparent;
          border: none;
          color: var(--gray-300);
          font-size: 1.5rem;
          padding: 0.5rem;
          margin-right: 0.75rem;
          cursor: pointer;
          line-height: 1;
        }
        .admin-header-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--white);
          margin: 0;
          letter-spacing: -0.01em;
        }
        
        /* Premium Navigation Shortcut Button */
        .btn-view-site {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 100px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--gray-300);
          font-size: 0.8125rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .btn-view-site:hover {
          background: rgba(235, 0, 40, 0.1);
          border-color: var(--ted-red);
          color: var(--white);
          transform: translateY(-1px);
        }
        .btn-view-site .text-mobile {
          display: none;
        }

        .admin-main {
          flex: 1;
          padding: 2.5rem 3rem;
          overflow-y: auto;
        }

        /* Dynamic mobile sidebar overlay */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 998;
          animation: fadeIn 0.2s ease;
        }

        /* ─── Responsive Queries ─── */
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            left: -280px;
            top: 0;
            bottom: 0;
            z-index: 999;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            height: 100vh;
          }
          .admin-sidebar.open {
            left: 0;
            box-shadow: 15px 0 40px rgba(0,0,0,0.6);
          }
          .sidebar-overlay.open {
            display: block;
          }
          
          .admin-header {
            padding: 0 1.25rem;
          }
          .admin-sidebar-toggle {
            display: block;
          }
          
          .btn-view-site .text {
            display: none;
          }
          .btn-view-site .text-mobile {
            display: inline;
          }
          
          .admin-main {
            padding: 1.5rem 1.25rem;
          }
        }
        ${skeletonStyles}
      `}</style>

      <div className="admin-container">
        <div className="admin-shell">
          <SidebarNav
            location={location}
            onLogout={handleLogout}
            onClose={() => setSidebarOpen(false)}
            open={sidebarOpen}
          />
          
          <div className="admin-content-area">
            <header className="admin-header">
              <div className="admin-header-left">
                <button 
                  className="admin-sidebar-toggle" 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-label="Open sidebar menu"
                >
                  ☰
                </button>
                <h1 className="admin-header-title">{getPageTitle()}</h1>
              </div>
              <div className="admin-header-right">
                <Link to="/" className="btn-view-site">
                  <span className="icon">🏠</span>
                  <span className="text">Go to Website</span>
                  <span className="text-mobile">View Site</span>
                </Link>
              </div>
            </header>
            
            <main className="admin-main">
              <AdminPageTransition>
                {children}
              </AdminPageTransition>
            </main>
          </div>
          
          <div 
            className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} 
            onClick={() => setSidebarOpen(false)} 
            aria-hidden="true"
          />
        </div>
      </div>
    </>
  );
}

function SidebarNav({ location, onLogout, onClose, open }) {
  return (
    <div className={`admin-sidebar ${open ? 'open' : ''}`} id="admin-sidebar">
      {/* Brand Header Section */}
      <div className="sidebar-brand">
        <Link to="/" className="sidebar-brand-link">
          <span className="sidebar-brand-red">TEDx</span>Dutse
        </Link>
        <span className="sidebar-brand-tag">Admin</span>
      </div>

      {/* Dedicated Scrollable Menu Area */}
      <div className="sidebar-nav-container">
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

      {/* Pinned Bottom Area for Sign Out */}
      <div className="sidebar-footer">
        <button className="btn-sidebar-logout" onClick={onLogout}>
          <span className="icon">🚪</span>
          Sign Out
        </button>
      </div>
    </div>
  );
}
