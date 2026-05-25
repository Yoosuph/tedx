import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsAPI } from '../../lib/supabase';
import { useSiteData } from '../../context/SiteDataContext';


const styles = `
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    overflow-y: auto;
    animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px) scale(0.98);
    }
    to { 
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-content {
    background: rgba(26, 26, 26, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 20px;
    max-width: 900px;
    width: 100%;
    position: relative;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    overflow-y: auto;
    max-height: 85vh;
    margin: auto;
  }

  .modal-close {
    position: absolute;
    top: 0.875rem;
    right: 0.875rem;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--gray-400, #9CA3AF);
    font-size: 1.125rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
  }

  .modal-close:hover {
    background: rgba(235, 0, 40, 0.15);
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
    font-size: 1.35rem;
    font-weight: 800;
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .detail-header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .detail-header p {
    color: var(--gray-400, #9CA3AF);
    margin: 0.125rem 0 0;
    font-size: 0.8125rem;
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
    background: rgba(34, 197, 94, 0.12);
    color: #86EFAC;
    border: 1px solid rgba(34, 197, 94, 0.15);
  }

  .status-used {
    background: rgba(59, 130, 246, 0.12);
    color: #93C5FD;
    border: 1px solid rgba(59, 130, 246, 0.15);
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.875rem;
    margin-bottom: 1.25rem;
  }

  .detail-section {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 0.875rem 1rem;
  }

  .detail-section h3 {
    color: var(--white, #ffffff);
    font-size: 0.6875rem;
    font-weight: 700;
    margin: 0 0 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 0.375rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.375rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    font-size: 0.8125rem;
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
    white-space: nowrap;
    word-break: break-all;
  }

  .detail-value.amount {
    color: var(--ted-red, #EB0028);
    font-weight: 800;
  }

  .checkin-banner {
    background: rgba(34, 197, 94, 0.08);
    border: 1px solid rgba(34, 197, 94, 0.15);
    border-radius: 12px;
    padding: 0.75rem 1.25rem;
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
    color: #86EFAC;
    font-size: 1.25rem;
    font-weight: bold;
  }

  .checkin-banner-text {
    color: var(--white, #ffffff);
    font-weight: 700;
    font-size: 0.9375rem;
  }

  .checkin-banner-time {
    color: var(--gray-400, #9CA3AF);
    font-size: 0.8125rem;
    margin-top: 0.125rem;
  }

  .action-buttons {
    display: flex;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .btn-success {
    flex: 1;
    padding: 0.625rem 1.5rem;
    background: #22C55E;
    color: white;
    border: none;
    border-radius: 100px;
    font-size: 0.8125rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-success:hover:not(:disabled) {
    background: #16A34A;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(34, 197, 94, 0.25);
  }

  .btn-success:disabled {
    opacity: 0.8;
    cursor: not-allowed;
  }

  .btn-secondary {
    flex: 1;
    padding: 0.625rem 1.5rem;
    background: transparent;
    color: var(--gray-300, #D1D5DB);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    font-size: 0.8125rem;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .btn-secondary:hover {
    border-color: var(--ted-red, #EB0028);
    color: var(--ted-red, #EB0028);
    background: rgba(235, 0, 40, 0.05);
    transform: translateY(-2px);
  }

  /* Button loading spinner */
  .btn-loading-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .btn-spinner {
    width: 18px;
    height: 18px;
    border: 2.5px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: btn-spin 0.6s linear infinite;
  }

  @keyframes btn-spin {
    to { transform: rotate(360deg); }
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

  @media (max-width: 900px) {
    .modal-overlay {
      align-items: flex-start;
      padding: 0.75rem;
      padding-top: 3rem;
    }

    .modal-content {
      max-width: 100%;
      margin: 0;
      max-height: 90vh;
    }
  }

  @media (max-width: 700px) {
    .detail-card {
      padding: 0.875rem;
    }

    .detail-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.875rem;
      padding-bottom: 0.75rem;
    }

    .detail-header h1 {
      font-size: 1.1rem;
    }

    .detail-header-right {
      align-self: stretch;
      justify-content: flex-end;
    }

    .detail-grid {
      grid-template-columns: 1fr 1fr;
      gap: 0.625rem;
      margin-bottom: 0.875rem;
    }

    .detail-section {
      padding: 0.625rem 0.75rem;
    }

    .detail-section h3 {
      font-size: 0.625rem;
      margin: 0 0 0.375rem;
    }

    .detail-row {
      padding: 0.25rem 0;
      font-size: 0.75rem;
    }

    .checkin-banner {
      padding: 0.625rem 0.875rem;
      margin-bottom: 0.875rem;
    }

    .action-buttons {
      flex-direction: row;
      gap: 0.5rem;
      padding-top: 0.75rem;
    }

    .btn-success,
    .btn-secondary {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .modal-overlay {
      padding: 0.5rem;
      padding-top: 3rem;
    }

    .modal-content {
      max-height: 92vh;
      border-radius: 14px;
    }

    .detail-card {
      padding: 0.75rem;
    }

    .detail-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .detail-section {
      padding: 0.5rem 0.625rem;
    }
  }
`;

export default function TicketDetail() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const { siteConfig } = useSiteData();
  const [ticket, setTicket] = useState(null);
  const [btnState, setBtnState] = useState('idle'); // 'idle' | 'loading' | 'success'

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
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.overflow = 'hidden';

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      body.style.overflow = '';
      requestAnimationFrame(() => window.scrollTo(0, scrollY));
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleClose = () => {
    navigate('/admin/tickets');
  };

  const markAsUsed = async () => {
    setBtnState('loading');
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

        setBtnState('success');
        setTimeout(() => {
          setTicket(updated);
          setBtnState('idle');
          window.dispatchEvent(new Event('tickets-changed'));
        }, 1500);
      } else {
        setBtnState('idle');
      }
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      setBtnState('idle');
    }
  };

  const modal = !ticket ? (
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
  ) : (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>
        <style>{styles}</style>
        <div className="detail-card">
          <div className="detail-header">
            <div>
              <h1>{ticket.name.toUpperCase()}</h1>
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
                <span className="detail-value">{ticket.name.toUpperCase()}</span>
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
                <span className="detail-value" style={{ fontFamily: 'monospace' }}>{ticket.reference}</span>
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
              <button 
                onClick={markAsUsed} 
                className="btn-success"
                disabled={btnState !== 'idle'}
              >
                {btnState === 'idle' && 'Mark as Used'}
                {btnState === 'loading' && (
                  <div className="btn-loading-content">
                    <div className="btn-spinner" />
                    <span>Checking in...</span>
                  </div>
                )}
                {btnState === 'success' && '✓ Checked In'}
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

  return createPortal(modal, document.body);
}
