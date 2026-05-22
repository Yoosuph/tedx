import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/shared/Layout';

const styles = `
  .detail-container {
    padding: 6rem 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray-400, #9CA3AF);
    text-decoration: none;
    margin-bottom: 2rem;
    transition: color 0.3s ease;
  }

  .back-link:hover {
    color: var(--ted-red, #EB0028);
  }

  .detail-card {
    background: var(--dark-surface, #1a1a1a);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-xl, 16px);
    padding: 2.5rem;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .detail-header h1 {
    color: var(--white, #ffffff);
    font-size: 2rem;
    margin: 0 0 0.5rem;
  }

  .detail-header p {
    color: var(--gray-400, #9CA3AF);
    margin: 0;
  }

  .status-badge {
    padding: 0.5rem 1.25rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-paid {
    background: rgba(34, 197, 94, 0.1);
    color: #86EFAC;
  }

  .status-used {
    background: rgba(59, 130, 246, 0.1);
    color: #93C5FD;
  }

  .detail-section {
    background: rgba(255, 255, 255, 0.04);
    border-radius: var(--radius-lg, 12px);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .detail-section h3 {
    color: var(--white, #ffffff);
    font-size: 1.125rem;
    margin: 0 0 1rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .detail-label {
    color: var(--gray-400, #9CA3AF);
    font-weight: 500;
  }

  .detail-value {
    color: var(--white, #ffffff);
    font-weight: 600;
    text-align: right;
  }

  .detail-value.amount {
    color: var(--ted-red, #EB0028);
    font-size: 1.25rem;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .btn-success {
    flex: 1;
    padding: 1rem 2rem;
    background: #22C55E;
    color: white;
    border: none;
    border-radius: var(--radius-lg, 12px);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-success:hover {
    background: #16A34A;
    transform: translateY(-2px);
  }

  .btn-secondary {
    flex: 1;
    padding: 1rem 2rem;
    background: transparent;
    color: var(--gray-300, #D1D5DB);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg, 12px);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    transition: all 0.3s ease;
  }

  .btn-secondary:hover {
    border-color: var(--ted-red, #EB0028);
    color: var(--ted-red, #EB0028);
  }

  .not-found {
    text-align: center;
    padding: 4rem 2rem;
  }

  .not-found h1 {
    color: #FCA5A5;
    font-size: 2rem;
    margin: 0 0 1rem;
  }

  .not-found p {
    color: var(--gray-400, #9CA3AF);
    margin: 0 0 2rem;
  }

  @media (max-width: 768px) {
    .action-buttons {
      flex-direction: column;
    }
  }
`;

export default function TicketDetail() {
  const { reference } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const tickets = JSON.parse(localStorage.getItem('tedx_tickets') || '[]');
    const found = tickets.find(t => t.reference === reference);
    setTicket(found || null);
  }, [reference]);

  const markAsUsed = () => {
    const tickets = JSON.parse(localStorage.getItem('tedx_tickets') || '[]');
    const index = tickets.findIndex(t => t.reference === reference);
    
    if (index !== -1) {
      tickets[index].status = 'used';
      tickets[index].usedAt = new Date().toISOString();
      localStorage.setItem('tedx_tickets', JSON.stringify(tickets));
      setTicket(tickets[index]);
    }
  };

  if (!ticket) {
    return (
      <Layout>
        <style>{styles}</style>
        <div className="detail-container">
          <div className="not-found">
            <h1>Ticket Not Found</h1>
            <p>We couldn't find a ticket with reference: {reference}</p>
            <Link to="/admin/tickets" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{styles}</style>
      <div className="detail-container">
        <Link to="/admin/tickets" className="back-link">
          ← Back to Dashboard
        </Link>

        <div className="detail-card">
          <div className="detail-header">
            <div>
              <h1>{ticket.name}</h1>
              <p>{ticket.tier} Ticket</p>
            </div>
            <span className={`status-badge status-${ticket.status || 'paid'}`}>
              {ticket.status || 'paid'}
            </span>
          </div>

          <div className="detail-section">
            <h3>Attendee Information</h3>
            <div className="detail-row">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{ticket.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{ticket.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{ticket.phone}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Ticket Details</h3>
            <div className="detail-row">
              <span className="detail-label">Reference</span>
              <span className="detail-value">{ticket.reference}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tier</span>
              <span className="detail-value">{ticket.tier}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Amount Paid</span>
              <span className="detail-value amount">₦{ticket.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Event Information</h3>
            <div className="detail-row">
              <span className="detail-label">Event</span>
              <span className="detail-value">{ticket.event}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date</span>
              <span className="detail-value">{ticket.date}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Venue</span>
              <span className="detail-value">{ticket.venue}</span>
            </div>
          </div>

          {ticket.usedAt && (
            <div className="detail-section">
              <h3>Check-in Information</h3>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value">Checked In</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Checked In At</span>
                <span className="detail-value">
                  {new Date(ticket.usedAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="action-buttons">
            {(!ticket.status || ticket.status === 'paid') && (
              <button onClick={markAsUsed} className="btn-success">
                Mark as Used
              </button>
            )}
            <Link to="/admin/tickets" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
