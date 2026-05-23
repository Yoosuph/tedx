import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteData } from '../../context/SiteDataContext';
import AdminLayout from '../admin/AdminLayout';

const styles = `
  .dashboard-page {
    max-width: 1100px;
  }

  /* Header */
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .admin-header-left h1 {
    color: var(--white);
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    letter-spacing: -0.02em;
  }

  .admin-header-left p {
    color: var(--gray-400);
    font-size: 1rem;
    margin: 0;
  }

  .admin-header-right {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .user-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    background: var(--dark-surface);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 50px;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--ted-red), #C41E3A);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 0.875rem;
  }

  .user-info {
    display: flex;
    flex-direction: column;
  }

  .user-name {
    color: var(--white);
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
  }

  .user-role {
    color: var(--gray-400);
    font-size: 0.75rem;
    margin: 0;
  }

  .btn-logout {
    padding: 0.75rem 1.5rem;
    background: transparent;
    color: var(--gray-400);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-logout:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #FCA5A5;
  }

  .btn-logout svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    grid-column: span 2;
    background: var(--dark-surface);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.25rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .stat-card:nth-child(4),
  .stat-card:nth-child(5) {
    grid-column: span 3;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--ted-red), #C41E3A);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .stat-card:hover {
    border-color: var(--ted-red);
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  }

  .stat-card:hover::before {
    opacity: 1;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  .stat-icon.total { background: rgba(235, 0, 40, 0.15); }
  .stat-icon.revenue { background: rgba(34, 197, 94, 0.15); }
  .stat-icon.regular { background: rgba(107, 114, 128, 0.15); }
  .stat-icon.vip { background: rgba(245, 158, 11, 0.15); }
  .stat-icon.vvip { background: rgba(139, 92, 246, 0.15); }

  .stat-label {
    color: var(--gray-400);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 0.375rem;
  }

  .stat-value {
    color: var(--white);
    font-size: 1.875rem;
    font-weight: 800;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .stat-value.revenue {
    color: #86EFAC;
  }

  .stat-subtext {
    color: var(--gray-500);
    font-size: 0.8125rem;
    margin: 0;
  }

  /* Action Buttons */
  .admin-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .btn-action {
    padding: 1rem 1.25rem;
    background: var(--dark-surface);
    color: var(--white);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s ease;
  }

  .btn-action:hover {
    border-color: var(--ted-red);
    background: rgba(235, 0, 40, 0.1);
    transform: translateY(-2px);
  }

  .btn-action.primary {
    background: var(--ted-red);
    border-color: var(--ted-red);
  }

  .btn-action.primary:hover {
    background: #C41E3A;
  }

  .btn-action-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .btn-action.primary .btn-action-icon {
    background: rgba(255, 255, 255, 0.2);
  }

  .btn-action-text {
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .btn-action-title {
    font-weight: 600;
    margin: 0;
  }

  .btn-action-desc {
    font-size: 0.8125rem;
    color: var(--gray-400);
    margin: 0.25rem 0 0;
  }

  .btn-action.primary .btn-action-desc {
    color: rgba(255, 255, 255, 0.8);
  }

  /* Tickets Section */
  .tickets-section {
    background: var(--dark-surface);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 2.5rem;
  }

  .tickets-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .tickets-header h2 {
    color: var(--white);
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  .search-bar {
    display: flex;
    gap: 0.75rem;
    flex: 1;
    max-width: 400px;
  }

  .search-input {
    flex: 1;
    padding: 0.875rem 1.25rem;
    background: var(--dark);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 50px;
    color: var(--white);
    font-size: 0.9375rem;
    transition: all 0.3s ease;
  }

  .search-input::placeholder {
    color: var(--gray-500);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--ted-red);
    box-shadow: 0 0 0 4px rgba(235, 0, 40, 0.1);
  }

  /* Table */
  .tickets-table-wrapper {
    overflow-x: auto;
    border-radius: 16px;
  }

  .tickets-table {
    width: 100%;
    border-collapse: collapse;
  }

  .tickets-table thead {
    background: var(--dark);
  }

  .tickets-table th {
    padding: 1.25rem 1rem;
    text-align: left;
    color: var(--gray-400);
    font-weight: 600;
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 2px solid rgba(255, 255, 255, 0.08);
  }

  .tickets-table td {
    padding: 1.25rem 1rem;
    color: var(--gray-300);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .tickets-table tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .tickets-table tr:last-child td {
    border-bottom: none;
  }

  .status-badge {
    display: inline-block;
    padding: 0.375rem 0.875rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-paid {
    background: rgba(34, 197, 94, 0.15);
    color: #86EFAC;
  }

  .status-used {
    background: rgba(59, 130, 246, 0.15);
    color: #93C5FD;
  }

  .status-pending {
    background: rgba(251, 191, 36, 0.15);
    color: #FCD34D;
  }

  .view-link {
    color: var(--ted-red);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.875rem;
    transition: opacity 0.3s ease;
  }

  .view-link:hover {
    opacity: 0.7;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 5rem 2rem;
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
  }

  .empty-state h3 {
    color: var(--gray-300);
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
  }

  .empty-state p {
    color: var(--gray-500);
    font-size: 0.9375rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    .admin-header {
      flex-direction: column;
      align-items: stretch;
    }

    .admin-header-right {
      justify-content: space-between;
    }

    .stats-grid {
      grid-template-columns: repeat(6, 1fr);
      gap: 0.5rem;
    }

    .stat-card {
      grid-column: span 2;
      padding: 0.875rem;
      border-radius: 12px;
    }

    .stat-card:nth-child(4),
    .stat-card:nth-child(5) {
      grid-column: span 3;
    }

    .stat-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      margin-bottom: 0.625rem;
      font-size: 1rem;
    }

    .stat-label {
      font-size: 0.625rem;
      margin: 0 0 0.25rem;
    }

    .stat-value {
      font-size: 1.375rem;
      margin: 0 0 0.125rem;
    }

    .stat-subtext {
      font-size: 0.6875rem;
    }

    .admin-actions {
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .btn-action {
      padding: 0.75rem 0.875rem;
      border-radius: 12px;
      font-size: 0.75rem;
      gap: 0.5rem;
    }

    .btn-action-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 1rem;
    }

    .btn-action-title {
      font-size: 0.75rem;
    }

    .btn-action-desc {
      display: none;
    }

    .tickets-header {
      flex-direction: column;
      align-items: stretch;
    }

    .search-bar {
      max-width: none;
    }
  }
`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { ticketTiers } = useSiteData();
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    revenue: 0,
    regular: 0,
    vip: 0,
    vvip: 0,
    checkedIn: 0,
  });

  useEffect(() => {
    // Load tickets from localStorage
    const stored = JSON.parse(localStorage.getItem('tedx_tickets') || '[]');
    setTickets(stored);

    // Calculate stats
    const revenue = stored.reduce((sum, t) => sum + t.price, 0);
    const regular = stored.filter(t => t.tier === 'Regular').length;
    const vip = stored.filter(t => t.tier === 'VIP').length;
    const vvip = stored.filter(t => t.tier === 'VVIP').length;
    const checkedIn = stored.filter(t => t.status === 'used').length;

    setStats({
      total: stored.length,
      revenue,
      regular,
      vip,
      vvip,
      checkedIn,
    });
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const term = searchTerm.toLowerCase();
    return (
      ticket.name.toLowerCase().includes(term) ||
      ticket.email.toLowerCase().includes(term) ||
      ticket.reference.toLowerCase().includes(term) ||
      ticket.phone.includes(term)
    );
  });

  const handleExportCSV = () => {
    const headers = ['Reference', 'Name', 'Email', 'Phone', 'Tier', 'Amount', 'Status'];
    const rows = tickets.map(t => [
      t.reference,
      t.name,
      t.email,
      t.phone,
      t.tier,
      t.price,
      t.status || 'paid',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tedx-tickets-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="dashboard-page">
          {/* Header */}
          <div className="admin-header">
            <div className="admin-header-left">
              <h1>Ticket Management</h1>
              <p>Manage tickets, track sales, and handle event check-in</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">🎫</div>
              <p className="stat-label">Total Tickets</p>
              <p className="stat-value">{stats.total}</p>
              <p className="stat-subtext">{stats.checkedIn} checked in</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon revenue">💰</div>
              <p className="stat-label">Revenue</p>
              <p className="stat-value revenue">₦{stats.revenue.toLocaleString()}</p>
              <p className="stat-subtext">Total sales</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon regular">🎟️</div>
              <p className="stat-label">Regular</p>
              <p className="stat-value">{stats.regular}</p>
              <p className="stat-subtext">₦{(ticketTiers.find(t => t.id === 'regular')?.price || 3000).toLocaleString()} each</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon vip">⭐</div>
              <p className="stat-label">VIP</p>
              <p className="stat-value">{stats.vip}</p>
              <p className="stat-subtext">₦{(ticketTiers.find(t => t.id === 'vip')?.price || 10000).toLocaleString()} each</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon vvip">👑</div>
              <p className="stat-label">VVIP</p>
              <p className="stat-value">{stats.vvip}</p>
              <p className="stat-subtext">₦{(ticketTiers.find(t => t.id === 'vvip')?.price || 25000).toLocaleString()} each</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="admin-actions">
            <Link to="/admin/tickets/scanner" className="btn-action primary">
              <div className="btn-action-icon">📷</div>
              <div className="btn-action-text">
                <p className="btn-action-title">QR Scanner</p>
                <p className="btn-action-desc">Scan tickets at event</p>
              </div>
            </Link>
            <Link to="/admin/tickets/verify" className="btn-action">
              <div className="btn-action-icon">🔍</div>
              <div className="btn-action-text">
                <p className="btn-action-title">Verify Ticket</p>
                <p className="btn-action-desc">Manual verification</p>
              </div>
            </Link>
            <button onClick={handleExportCSV} className="btn-action">
              <div className="btn-action-icon">📊</div>
              <div className="btn-action-text">
                <p className="btn-action-title">Export CSV</p>
                <p className="btn-action-desc">Download all tickets</p>
              </div>
            </button>
          </div>

          {/* Tickets Section */}
          <div className="tickets-section">
            <div className="tickets-header">
              <h2>All Tickets</h2>
              <div className="search-bar">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, email, reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎫</div>
                <h3>No tickets found</h3>
                <p>{searchTerm ? 'Try a different search term' : 'Tickets will appear here once purchases are made'}</p>
              </div>
            ) : (
              <div className="tickets-table-wrapper">
                <table className="tickets-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Tier</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.reference}>
                        <td>{ticket.reference}</td>
                        <td>{ticket.name}</td>
                        <td>{ticket.email}</td>
                        <td>{ticket.phone}</td>
                        <td>{ticket.tier}</td>
                        <td>₦{ticket.price.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge status-${ticket.status || 'paid'}`}>
                            {ticket.status || 'paid'}
                          </span>
                        </td>
                        <td>
                          <Link to={`/admin/tickets/${ticket.reference}`} className="view-link">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>
      <Outlet />
    </AdminLayout>
  );
}
