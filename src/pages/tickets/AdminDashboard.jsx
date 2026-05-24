import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteData } from '../../context/SiteDataContext';
import AdminLayout from '../admin/AdminLayout';
import { ticketsAPI } from '../../lib/supabase';

const styles = `
  .dashboard-page {
    max-width: 1100px;
  }

  /* Header */
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .admin-header-left h1 {
    color: var(--white);
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .admin-header-left p {
    color: var(--gray-400);
    font-size: 1rem;
    margin: 0;
  }

  /* Quick Check-In Bar */
  .quick-checkin-bar {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.25rem;
    backdrop-filter: blur(10px);
  }

  .quick-checkin-info h3 {
    color: var(--white);
    font-size: 1.125rem;
    margin: 0 0 0.25rem;
    font-weight: 700;
  }

  .quick-checkin-info p {
    color: var(--gray-400);
    margin: 0;
    font-size: 0.8125rem;
  }

  .quick-checkin-form {
    display: flex;
    gap: 0.75rem;
    flex: 1;
    max-width: 420px;
    width: 100%;
  }

  .quick-checkin-input {
    flex: 1;
    padding: 0.75rem 1.25rem;
    background: var(--black);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    color: var(--white);
    font-size: 0.875rem;
    transition: all 0.3s ease;
  }

  .quick-checkin-input:focus {
    outline: none;
    border-color: var(--ted-red);
    box-shadow: 0 0 15px rgba(235, 0, 40, 0.1);
  }

  .btn-quick-lookup {
    padding: 0.75rem 1.75rem;
    background: var(--ted-red);
    color: white;
    font-size: 0.875rem;
    font-weight: 700;
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .btn-quick-lookup:hover {
    background: var(--ted-red-dark);
    transform: translateY(-1px);
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    grid-column: span 2;
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    padding: 1.5rem;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }

  .stat-card:nth-child(4),
  .stat-card:nth-child(5),
  .stat-card:nth-child(6) {
    grid-column: span 2;
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
    background: rgba(255, 255, 255, 0.03);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  }

  .stat-card:hover::before {
    opacity: 1;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem;
    font-size: 1.35rem;
  }

  .stat-icon.total { background: rgba(235, 0, 40, 0.12); border: 1px solid rgba(235, 0, 40, 0.15); }
  .stat-icon.revenue { background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.15); }
  .stat-icon.regular { background: rgba(156, 163, 175, 0.1); border: 1px solid rgba(156, 163, 175, 0.15); }
  .stat-icon.vip { background: rgba(255, 215, 0, 0.08); border: 1px solid rgba(255, 215, 0, 0.15); }
  .stat-icon.vvip { background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.15); }
  .stat-icon.checkedin { background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.15); }

  .stat-label {
    color: var(--gray-400);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 0.5rem;
  }

  .stat-value {
    color: var(--white);
    font-size: 2rem;
    font-weight: 900;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .stat-value.revenue {
    color: #86EFAC;
  }

  .stat-value.checkedin {
    color: #86EFAC;
  }

  .stat-subtext {
    color: var(--gray-500);
    font-size: 0.8125rem;
    margin: 0;
    font-weight: 600;
  }

  /* Action Buttons */
  .admin-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .btn-action {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.01);
    color: var(--white);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .btn-action:hover {
    border-color: var(--ted-red);
    background: rgba(235, 0, 40, 0.04);
    transform: translateY(-2px);
  }

  .btn-action.primary {
    background: var(--ted-red);
    border-color: var(--ted-red);
    box-shadow: 0 10px 20px rgba(235, 0, 40, 0.15);
  }

  .btn-action.primary:hover {
    background: var(--ted-red-dark);
    box-shadow: 0 15px 30px rgba(235, 0, 40, 0.3);
  }

  .btn-action-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .btn-action.primary .btn-action-icon {
    background: rgba(255, 255, 255, 0.15);
  }

  .btn-action-text {
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .btn-action-title {
    font-weight: 700;
    margin: 0;
    font-size: 0.9375rem;
  }

  .btn-action-desc {
    font-size: 0.8125rem;
    color: var(--gray-400);
    margin: 0.25rem 0 0;
    font-weight: 500;
  }

  .btn-action.primary .btn-action-desc {
    color: rgba(255, 255, 255, 0.8);
  }

  /* Tickets Section */
  .tickets-section {
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 28px;
    padding: 2.5rem;
  }

  .tickets-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .tickets-header h2 {
    color: var(--white);
    font-size: 1.625rem;
    font-weight: 800;
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
    padding: 0.875rem 1.5rem;
    background: var(--black);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    color: var(--white);
    font-size: 0.9375rem;
    transition: all 0.3s ease;
  }

  .search-input::placeholder {
    color: var(--gray-600);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--ted-red);
    box-shadow: 0 0 15px rgba(235, 0, 40, 0.1);
  }

  /* Table */
  .tickets-table-wrapper {
    overflow-x: auto;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .tickets-table {
    width: 100%;
    border-collapse: collapse;
  }

  .tickets-table thead {
    background: rgba(255, 255, 255, 0.02);
  }

  .tickets-table th {
    padding: 1.25rem 1.5rem;
    text-align: left;
    color: var(--gray-400);
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tickets-table td {
    padding: 1.25rem 1.5rem;
    color: var(--gray-300);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 0.9375rem;
  }

  .tickets-table tr:hover {
    background: rgba(255, 255, 255, 0.01);
  }

  .tickets-table tr:last-child td {
    border-bottom: none;
  }

  /* Table Ref Copy Column */
  .table-ref-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .table-ref-text {
    font-family: var(--font-mono);
    font-weight: 600;
  }

  .btn-table-copy {
    background: transparent;
    border: none;
    color: var(--gray-500);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .btn-table-copy:hover {
    color: var(--ted-red);
    background: rgba(255, 255, 255, 0.04);
  }

  .btn-table-copy svg {
    width: 12px;
    height: 12px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
  }

  .status-badge {
    display: inline-block;
    padding: 0.375rem 0.875rem;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-paid {
    background: rgba(34, 197, 94, 0.12);
    color: #86EFAC;
    border: 1px solid rgba(34, 197, 94, 0.15);
  }

  .status-used {
    background: rgba(59, 130, 246, 0.12);
    color: #93C5FD;
    border: 1px solid rgba(59, 130, 246, 0.15);
  }

  .status-pending {
    background: rgba(251, 191, 36, 0.12);
    color: #FCD34D;
    border: 1px solid rgba(251, 191, 36, 0.15);
  }

  .view-link {
    color: var(--ted-red);
    text-decoration: none;
    font-weight: 700;
    font-size: 0.875rem;
    transition: color 0.3s ease;
  }

  .view-link:hover {
    color: var(--ted-red-light);
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
    background: rgba(255, 255, 255, 0.03);
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

  @media (max-width: 992px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
    .stat-card {
      grid-column: span 2;
    }
  }

  @media (max-width: 768px) {
    .admin-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .quick-checkin-bar {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .quick-checkin-form {
      max-width: none;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .stat-card {
      grid-column: span 1;
      padding: 1.25rem 1rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }

    .admin-actions {
      grid-template-columns: 1fr;
      gap: 0.75rem;
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
  const [quickRef, setQuickRef] = useState('');
  const [copiedRef, setCopiedRef] = useState('');
  
  const [stats, setStats] = useState({
    total: 0,
    revenue: 0,
    regular: 0,
    vip: 0,
    vvip: 0,
    checkedIn: 0,
  });

  const fetchTickets = useCallback(async () => {
    const stored = await ticketsAPI.getAll();
    setTickets(stored);

    const revenue = stored.reduce((sum, t) => sum + t.price, 0);
    const regular = stored.filter(t => t.tier?.toLowerCase() === 'regular').length;
    const vip = stored.filter(t => t.tier?.toLowerCase() === 'vip').length;
    const vvip = stored.filter(t => t.tier?.toLowerCase() === 'vvip').length;
    const checkedIn = stored.filter(t => t.status === 'used' || t.checked_in).length;

    setStats({
      total: stored.length,
      revenue,
      regular,
      vip,
      vvip,
      checkedIn,
    });
  }, [ticketTiers]);

  useEffect(() => {
    fetchTickets();

    const handleTicketsChanged = () => {
      console.log('🔄 AdminDashboard: Tickets changed event received, fetching updates...');
      fetchTickets();
    };

    window.addEventListener('tickets-changed', handleTicketsChanged);
    return () => {
      window.removeEventListener('tickets-changed', handleTicketsChanged);
    };
  }, [fetchTickets]);

  const filteredTickets = tickets.filter(ticket => {
    const term = searchTerm.toLowerCase();
    return (
      ticket.name.toLowerCase().includes(term) ||
      ticket.email.toLowerCase().includes(term) ||
      ticket.reference.toLowerCase().includes(term) ||
      (ticket.phone && ticket.phone.includes(term))
    );
  });

  const handleQuickLookup = (e) => {
    e.preventDefault();
    if (quickRef.trim()) {
      navigate(`/admin/tickets/${quickRef.trim().toUpperCase()}`);
      setQuickRef('');
    }
  };

  const handleCopyRef = (ref) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(''), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Reference', 'Name', 'Email', 'Phone', 'Tier', 'Amount', 'Status'];
    const rows = tickets.map(t => [
      t.reference,
      t.name,
      t.email,
      t.phone || '',
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

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="dashboard-page">
          {/* Header */}
          <div className="admin-header">
            <div className="admin-header-left">
              <h1>Ticket Management</h1>
              <p>Manage tickets, track sales, and handle door check-in</p>
            </div>
          </div>

          {/* Quick Check-In Bar */}
          <div className="quick-checkin-bar">
            <div className="quick-checkin-info">
              <h3>Fast Ticket Lookup</h3>
              <p>Enter a reference code below to check in an attendee instantly</p>
            </div>
            <form onSubmit={handleQuickLookup} className="quick-checkin-form">
              <input
                type="text"
                className="quick-checkin-input"
                placeholder="e.g., TEDX1716493205"
                value={quickRef}
                onChange={(e) => setQuickRef(e.target.value)}
              />
              <button type="submit" className="btn-quick-lookup">
                Lookup Ticket
              </button>
            </form>
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
            <div className="stat-card">
              <div className="stat-icon checkedin">✅</div>
              <p className="stat-label">Checked In</p>
              <p className="stat-value checkedin">{stats.checkedIn}</p>
              <p className="stat-subtext">{stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}% of {stats.total} tickets</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="admin-actions">
            <Link to="/admin/tickets/scanner" className="btn-action primary">
              <div className="btn-action-icon">📷</div>
              <div className="btn-action-text">
                <p className="btn-action-title">QR Scanner</p>
                <p className="btn-action-desc">Verify with device camera</p>
              </div>
            </Link>
            <Link to="/admin/tickets/verify" className="btn-action">
              <div className="btn-action-icon">🔍</div>
              <div className="btn-action-text">
                <p className="btn-action-title">Verify Ticket</p>
                <p className="btn-action-desc">Manual verification page</p>
              </div>
            </Link>
            <button onClick={handleExportCSV} className="btn-action">
              <div className="btn-action-icon">📊</div>
              <div className="btn-action-text">
                <p className="btn-action-title">Export CSV</p>
                <p className="btn-action-desc">Download sales data</p>
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
                        <td>
                          <div className="table-ref-cell">
                            <span className="table-ref-text">{ticket.reference}</span>
                            <button 
                              className="btn-table-copy" 
                              onClick={() => handleCopyRef(ticket.reference)}
                              title="Copy Reference"
                            >
                              {copiedRef === ticket.reference ? (
                                <span style={{ color: '#22C55E', fontSize: '9px', fontWeight: 'bold' }}>✓</span>
                              ) : (
                                <svg viewBox="0 0 24 24">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                        <td>{ticket.name}</td>
                        <td>{ticket.email}</td>
                        <td>{ticket.phone || '—'}</td>
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
