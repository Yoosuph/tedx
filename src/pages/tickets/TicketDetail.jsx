import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsAPI } from '../../lib/supabase';
import { useSiteData } from '../../context/SiteDataContext';


const styles = `
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-content {
    background: var(--dark-surface, #1a1a1a);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-xl, 16px);
    max-width: 1000px;
    width: 100%;
    position: relative;
    animation: slideUp 0.3s ease-out;
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--gray-400, #9CA3AF);
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
  }

  .modal-close:hover {
    background: rgba(235, 0, 40, 0.1);
    border-color: var(--ted-red, #EB0028);
    color: var(--ted-red, #EB0028);
  }

  .detail-card {
    padding: 1.5rem 2rem;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .detail-header h1 {
    color: var(--white, #ffffff);
    font-size: 1.5rem;
    margin: 0;
    line-height: 1.2;
  }

  .detail-header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .detail-header p {
    color: var(--gray-400, #9CA3AF);
    margin: 0;
    font-size: 0.875rem;
  }

  .status-badge {
    padding: 0.375rem 1rem;
    border-radius: 20px;
    font-size: 0.75rem;
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

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .detail-section {
    background: rgba(255, 255, 255, 0.04);
    border-radius: var(--radius-lg, 12px);
    padding: 1rem 1.25rem;
  }

  .detail-section h3 {
    color: var(--white, #ffffff);
    font-size: 0.875rem;
    margin: 0 0 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 0.875rem;
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
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .detail-value.amount {
    color: var(--ted-red, #EB0028);
    font-size: 1rem;
  }

  .checkin-banner {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: var(--radius-lg, 12px);
    padding: 0.875rem 1.25rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .checkin-banner-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .checkin-banner-icon {
    color: #93C5FD;
    font-size: 1.25rem;
  }

  .checkin-banner-text {
    color: var(--white, #ffffff);
    font-weight: 600;
    font-size: 0.875rem;
  }

  .checkin-banner-time {
    color: var(--gray-400, #9CA3AF);
    font-size: 0.75rem;
  }

  .action-buttons {
    display: flex;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .btn-success {
    flex: 1;
    padding: 0.75rem 1.5rem;
    background: #22C55E;
    color: white;
    border: none;
    border-radius: var(--radius-lg, 12px);
    font-size: 0.875rem;
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
    padding: 0.75rem 1.5rem;
    background: transparent;
    color: var(--gray-300, #D1D5DB);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg, 12px);
    font-size: 0.875rem;
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
    padding: 3rem 2rem;
  }

  .not-found h1 {
    color: #FCA5A5;
    font-size: 1.5rem;
    margin: 0 0 0.75rem;
  }

  .not-found p {
    color: var(--gray-400, #9CA3AF);
    margin: 0 0 1.5rem;
  }

  @media (max-width: 768px) {
    .detail-grid {
      grid-template-columns: 1fr;
    }

    .detail-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .detail-header-right {
      align-self: flex-end;
    }

    .modal-content {
      max-width: 100%;
    }

    .detail-card {
      padding: 1.25rem;
    }

    .checkin-banner {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
`;

export default function TicketDetail() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const { siteConfig } = useSiteData();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      const found = await ticketsAPI.getByReference(reference);
      if (found) {
        // Normalize fields
        found.usedAt = found.checked_in_at || found.used_at;
        found.event = found.event || siteConfig.eventName;
        found.date = found.date || siteConfig.date;
        found.venue = found.venue || siteConfig.venueShort || siteConfig.venue;
      }
      setTicket(found || null);
    };
    fetchTicket();
  }, [reference, siteConfig]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleClose = () => {
    navigate('/admin/tickets');
  };

  const markAsUsed = async () => {
    try {
      const updated = await ticketsAPI.update(reference, {
        status: 'used',
        checked_in: true,
        checked_in_at: new Date().toISOString()
      });
      
      if (updated) {
        // Normalize fields
        updated.usedAt = updated.checked_in_at || updated.used_at;
        updated.event = updated.event || siteConfig.eventName;
        updated.date = updated.date || siteConfig.date;
        updated.venue = updated.venue || siteConfig.venueShort || siteConfig.venue;
        setTicket(updated);
        // Also sync local cache
        const tickets = JSON.parse(localStorage.getItem('tedx_tickets') || '[]');
        const index = tickets.findIndex(t => t.reference === reference);
        if (index !== -1) {
          tickets[index].status = 'used';
          tickets[index].usedAt = updated.usedAt;
          localStorage.setItem('tedx_tickets', JSON.stringify(tickets));
        }
      }
    } catch (error) {
      console.error('Error marking ticket as used:', error);
    }
  };

  if (!ticket) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={handleClose}>×</button>
          <style>{styles}</style>
          <div className="detail-card">
            <div className="not-found">
              <h1>Ticket Not Found</h1>
              <p>We couldn't find a ticket with reference: {reference}</p>
              <button onClick={handleClose} className="btn-secondary">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>
        <style>{styles}</style>
        <div className="detail-card">
          <div className="detail-header">
            <div>
              <h1>{ticket.name}</h1>
              <p>{ticket.tier} Ticket</p>
            </div>
            <div className="detail-header-right">
              <span className={`status-badge status-${ticket.status || 'paid'}`}>
                {ticket.status || 'paid'}
              </span>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-section">
              <h3>Attendee</h3>
              <div className="detail-row">
                <span className="detail-label">Name</span>
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
              <h3>Ticket</h3>
              <div className="detail-row">
                <span className="detail-label">Reference</span>
                <span className="detail-value">{ticket.reference}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tier</span>
                <span className="detail-value">{ticket.tier}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount</span>
                <span className="detail-value amount">₦{ticket.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Event</h3>
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
          </div>

          {ticket.usedAt && (
            <div className="checkin-banner">
              <div className="checkin-banner-left">
                <span className="checkin-banner-icon">✓</span>
                <div>
                  <div className="checkin-banner-text">Checked In</div>
                  <div className="checkin-banner-time">
                    {new Date(ticket.usedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="action-buttons">
            {(!ticket.status || ticket.status === 'paid') && (
              <button onClick={markAsUsed} className="btn-success">
                Mark as Used
              </button>
            )}
            <button onClick={handleClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
