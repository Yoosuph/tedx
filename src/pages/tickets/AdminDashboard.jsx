import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/shared/Layout';

const styles = `
  .admin-container {
    padding: 6rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .admin-header {
    margin-bottom: 3rem;
  }

  .admin-header h1 {
    color: var(--white, #ffffff);
    font-size: 2.5rem;
    margin: 0 0 1rem;
  }

  .admin-header p {
    color: var(--gray-400, #9CA3AF);
    font-size: 1.125rem;
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    background: var(--dark-surface, #1a1a1a);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-xl, 16px);
    padding: 2rem;
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    border-color: var(--ted-red, #EB0028);
    transform: translateY(-2px);
  }

  .stat-label {
    color: var(--gray-400, #9CA3AF);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.5rem;
  }

  .stat-value {
    color: var(--white, #ffffff);
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 0.25rem;
  }

  .stat-value.revenue {
    color: var(--ted-red, #EB0028);
  }

  .stat-subtext {
    color: var(--gray-500, #6B7280);
    font-size: 0.875rem;
    margin: 0;
  }

  .admin-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }

  .btn-action {
    padding: 1rem 2rem;
    background: var(--dark-surface, #1a1a1a);
    color: var(--white, #ffffff);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg, 12px);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }

  .btn-action:hover {
    border-color: var(--ted-red, #EB0028);
    background: rgba(235, 0, 40, 0.1);
    transform: translateY(-2px);
  }

  .btn-action.primary {
    background: var(--ted-red, #EB0028);
    border-color: var(--ted-red, #EB0028);
  }

  .btn-action.primary:hover {
    background: #C41E3A;
  }

  .tickets-section {
    background: var(--dark-surface, #1a1a1a);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-xl, 16px);
    padding: 2rem;
  }

  .tickets-section h2 {
    color: var(--white, #ffffff);
    font-size: 1.5rem;
    margin: 0 0 1.5rem;
  }

  .search-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .search-bar input {
    flex: 1;
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md, 8px);
    color: var(--white, #ffffff);
    font-size: 1rem;
  }

  .search-bar input:focus {
    outline: none;
    border-color: var(--ted-red, #EB0028);
  }

  .tickets-table {
    width: 100%;
    border-collapse: collapse;
    overflow-x: auto;
    display: block;
  }

  .tickets-table thead {
    background: rgba(255, 255, 255, 0.04);
  }

  .tickets-table th {
    padding: 1rem;
    text-align: left;
    color: var(--gray-400, #9CA3AF);
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tickets-table td {
    padding: 1rem;
    color: var(--gray-300, #D1D5DB);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .tickets-table tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-paid {
    background: rgba(34, 197, 94, 0.1);
    color: #86EFAC;
  }

  .status-used {
    background: rgba(59, 130, 246, 0.1);
    color: #93C5FD;
  }

  .status-pending {
    background: rgba(251, 191, 36, 0.1);
    color: #FCD34D;
  }

  .view-link {
    color: var(--ted-red, #EB0028);
    text-decoration: none;
    font-weight: 600;
    transition: opacity 0.3s ease;
  }

  .view-link:hover {
    opacity: 0.8;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--gray-500, #6B7280);
  }

  .empty-state h3 {
    color: var(--gray-400, #9CA3AF);
    margin: 0 0 1rem;
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .admin-actions {
      flex-direction: column;
    }

    .btn-action {
      width: 100%;
      justify-content: center;
    }

    .tickets-table {
      font-size: 0.875rem;
    }

    .tickets-table th,
    .tickets-table td {
      padding: 0.75rem 0.5rem;
    }
  }
`;

export default function AdminDashboard() {
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

  return (
    <Layout>
      <style>{styles}</style>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Ticket Management</h1>
          <p>Manage tickets, track sales, and handle event check-in</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Tickets</p>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-subtext">{stats.checkedIn} checked in</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Revenue</p>
            <p className="stat-value revenue">₦{stats.revenue.toLocaleString()}</p>
            <p className="stat-subtext">Total sales</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Regular</p>
            <p className="stat-value">{stats.regular}</p>
            <p className="stat-subtext">₦3,000 each</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">VIP</p>
            <p className="stat-value">{stats.vip}</p>
            <p className="stat-subtext">₦10,000 each</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">VVIP</p>
            <p className="stat-value">{stats.vvip}</p>
            <p className="stat-subtext">₦25,000 each</p>
          </div>
        </div>

        <div className="admin-actions">
          <Link to="/admin/tickets/scanner" className="btn-action primary">
            📷 QR Scanner
          </Link>
          <Link to="/admin/tickets/verify" className="btn-action">
            🔍 Verify Ticket
          </Link>
          <button onClick={handleExportCSV} className="btn-action">
            📊 Export CSV
          </button>
        </div>

        <div className="tickets-section">
          <h2>All Tickets</h2>
          
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name, email, reference, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredTickets.length === 0 ? (
            <div className="empty-state">
              <h3>No tickets found</h3>
              <p>{searchTerm ? 'Try a different search term' : 'Tickets will appear here once purchases are made'}</p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </Layout>
  );
}
