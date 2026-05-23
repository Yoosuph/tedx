import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/shared/Layout';
import { ticketsAPI } from '../../lib/supabase';
import { useSiteData } from '../../context/SiteDataContext';

const styles = `
  .verify-page {
    min-height: calc(100vh - 80px);
    background: radial-gradient(circle at 50% 50%, rgba(235, 0, 40, 0.03) 0%, var(--black) 90%);
    padding: 3rem 2rem;
  }

  .verify-container {
    max-width: 800px;
    margin: 0 auto;
  }

  /* Header */
  .verify-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .verify-header-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .back-button {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    color: var(--gray-400);
  }

  .back-button:hover {
    border-color: var(--ted-red);
    color: var(--ted-red);
    background: rgba(235, 0, 40, 0.05);
    transform: translateX(-4px);
  }

  .back-button svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2.5;
    fill: none;
  }

  .verify-title h1 {
    color: var(--white);
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .verify-title p {
    color: var(--gray-400);
    font-size: 0.9375rem;
    margin: 0;
  }

  .user-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    backdrop-filter: blur(10px);
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--ted-red), #C41E3A);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 800;
    font-size: 0.8125rem;
  }

  .user-info {
    display: flex;
    flex-direction: column;
  }

  .user-name {
    color: var(--white);
    font-size: 0.8125rem;
    font-weight: 700;
    margin: 0;
  }

  .user-role {
    color: var(--gray-500);
    font-size: 0.6875rem;
    margin: 0;
    font-weight: 600;
  }

  /* Verify Card */
  .verify-card {
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 32px;
    padding: 3.5rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(20px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
  }

  .verify-card h2 {
    color: var(--white);
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0 0 1.5rem;
    letter-spacing: -0.01em;
  }

  .verify-form {
    display: flex;
    gap: 1rem;
  }

  .verify-form input {
    flex: 1;
    padding: 1.125rem 1.75rem;
    background: rgba(0, 0, 0, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    color: var(--white);
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .verify-form input::placeholder {
    color: var(--gray-600);
  }

  .verify-form input:focus {
    outline: none;
    border-color: var(--ted-red);
    box-shadow: 0 0 20px rgba(235, 0, 40, 0.15);
    background: rgba(0, 0, 0, 0.5);
  }

  .btn-verify {
    padding: 1.125rem 2.5rem;
    background: var(--ted-red);
    color: white;
    border: none;
    border-radius: 100px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
  }

  .btn-verify svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2.5;
    fill: none;
  }

  .btn-verify:hover {
    background: #C41E3A;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(235, 0, 40, 0.35);
  }

  /* Result Cards */
  .result-card {
    background: rgba(255, 255, 255, 0.01);
    border-radius: 32px;
    padding: 3rem;
    animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(20px);
    width: 100%;
  }

  .result-card.success {
    border: 2px solid rgba(34, 197, 94, 0.3);
    box-shadow: 0 20px 50px rgba(34, 197, 94, 0.08);
  }

  .result-card.error {
    border: 2px solid rgba(239, 68, 68, 0.3);
    box-shadow: 0 20px 50px rgba(239, 68, 68, 0.08);
  }

  .result-card.already-used {
    border: 2px solid rgba(59, 130, 246, 0.3);
    box-shadow: 0 20px 50px rgba(59, 130, 246, 0.08);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2.5rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .result-icon-wrapper {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .result-card.success .result-icon-wrapper { background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.2); }
  .result-card.error .result-icon-wrapper { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.2); }
  .result-card.already-used .result-icon-wrapper { background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.2); }

  .result-info h2 {
    color: var(--white);
    font-size: 1.875rem;
    font-weight: 800;
    margin: 0 0 0.375rem;
    letter-spacing: -0.01em;
  }

  .result-info p {
    color: var(--gray-400);
    font-size: 1rem;
    margin: 0;
  }

  /* Ticket Details */
  .ticket-details {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    padding: 2rem;
    margin-bottom: 2.5rem;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.75rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .detail-label {
    color: var(--gray-500);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .detail-value {
    color: var(--white);
    font-size: 1rem;
    font-weight: 600;
    word-break: break-word;
  }

  .tier-badge {
    display: inline-block;
    padding: 0.375rem 0.875rem;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 1px solid transparent;
    width: fit-content;
  }

  .tier-badge.regular {
    background: rgba(156, 163, 175, 0.1);
    color: #D1D5DB;
    border-color: rgba(156, 163, 175, 0.15);
  }

  .tier-badge.vip {
    background: rgba(255, 215, 0, 0.08);
    color: var(--gold);
    border-color: rgba(255, 215, 0, 0.15);
  }

  .tier-badge.vvip {
    background: rgba(139, 92, 246, 0.08);
    color: #C4B5FD;
    border-color: rgba(139, 92, 246, 0.15);
  }

  .status-badge {
    display: inline-block;
    padding: 0.375rem 0.875rem;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    width: fit-content;
  }

  .status-badge.paid {
    background: rgba(34, 197, 94, 0.12);
    color: #86EFAC;
    border: 1px solid rgba(34, 197, 94, 0.15);
  }

  .status-badge.used {
    background: rgba(59, 130, 246, 0.12);
    color: #93C5FD;
    border: 1px solid rgba(59, 130, 246, 0.15);
  }

  /* Action Buttons */
  .result-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .btn-action {
    flex: 1;
    min-width: 180px;
    padding: 1.125rem 2rem;
    border-radius: 100px;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    text-decoration: none;
  }

  .btn-action svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 2.5;
    fill: none;
  }

  .btn-success {
    background: #22C55E;
    color: white;
    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.2);
  }

  .btn-success:hover {
    background: #16A34A;
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(34, 197, 94, 0.4);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.04);
    color: var(--gray-300);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .btn-secondary:hover {
    border-color: var(--ted-red);
    color: var(--white);
    background: rgba(235, 0, 40, 0.05);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .verify-page {
      padding: 2rem 1.5rem;
    }

    .verify-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1.25rem;
    }

    .verify-header-left {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .verify-card {
      padding: 2rem 1.5rem;
      border-radius: 24px;
    }

    .verify-form {
      flex-direction: column;
    }

    .btn-verify {
      width: 100%;
    }

    .result-card {
      padding: 2rem 1.5rem;
      border-radius: 24px;
    }

    .result-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.25rem;
    }

    .result-actions {
      flex-direction: column;
    }

    .btn-action {
      min-width: 100%;
    }

    .details-grid {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }
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
`;

export default function VerifyTicket() {
  const navigate = useNavigate();
  const { siteConfig } = useSiteData();
  const [reference, setReference] = useState('');
  const [result, setResult] = useState(null);
  const [btnState, setBtnState] = useState('idle'); // 'idle' | 'loading' | 'success'

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!reference.trim()) {
      setResult({
        status: 'error',
        message: 'Please enter a ticket reference',
      });
      return;
    }

    try {
      const ticket = await ticketsAPI.getByReference(reference.trim().toUpperCase());

      if (!ticket) {
        setResult({
          status: 'error',
          message: 'Ticket not found',
        });
        return;
      }

      ticket.usedAt = ticket.checked_in_at || ticket.used_at;
      ticket.event = ticket.event || siteConfig.eventName;
      ticket.date = ticket.date || siteConfig.date;
      ticket.venue = ticket.venue || siteConfig.venueShort || siteConfig.venue;

      if (ticket.status === 'used' || ticket.checked_in) {
        setResult({
          status: 'already-used',
          ticket,
          message: 'Already Checked In',
          usedAt: ticket.usedAt,
        });
        return;
      }

      setResult({
        status: 'success',
        ticket,
        message: 'Ticket is Valid',
      });
    } catch (error) {
      console.error('Error verifying ticket:', error);
      setResult({
        status: 'error',
        message: 'Database connection failed',
      });
    }
  };

  const markAsUsed = async () => {
    if (!result.ticket) return;

    setBtnState('loading');
    try {
      const updated = await ticketsAPI.update(result.ticket.reference, {
        status: 'used',
        checked_in: true,
        checked_in_at: new Date().toISOString()
      });
      
      if (updated) {
        updated.usedAt = updated.checked_in_at || updated.used_at;
        updated.event = updated.event || siteConfig.eventName;
        updated.date = updated.date || siteConfig.date;
        updated.venue = updated.venue || siteConfig.venueShort || siteConfig.venue;

        setBtnState('success');
        setTimeout(() => {
          setResult({
            status: 'success',
            ticket: updated,
            message: 'Checked In Successfully',
            justMarked: true,
          });
          setBtnState('idle');
        }, 1500);

        // Sync local storage cache
        const tickets = JSON.parse(localStorage.getItem('tedx_tickets') || '[]');
        const index = tickets.findIndex(t => t.reference === result.ticket.reference);
        if (index !== -1) {
          tickets[index].status = 'used';
          tickets[index].usedAt = updated.usedAt;
          localStorage.setItem('tedx_tickets', JSON.stringify(tickets));
        }

        // Notify other components
        window.dispatchEvent(new Event('tickets-changed'));
      } else {
        setBtnState('idle');
      }
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      setBtnState('idle');
    }
  };

  const resetVerification = () => {
    setResult(null);
    setReference('');
  };

  return (
    <Layout>
      <style>{styles}</style>
      <div className="verify-page">
        <div className="verify-container">
          {/* Header */}
          <div className="verify-header">
            <div className="verify-header-left">
              <Link to="/admin/tickets" className="back-button">
                <svg viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </Link>
              <div className="verify-title">
                <h1>Verify Ticket</h1>
                <p>Manually verify tickets by reference number</p>
              </div>
            </div>
            <div className="user-badge">
              <div className="user-avatar">A</div>
              <div className="user-info">
                <p className="user-name">Admin</p>
                <p className="user-role">Administrator</p>
              </div>
            </div>
          </div>

          {!result && (
            <div className="verify-card">
              <h2>Enter Ticket Reference</h2>
              <form onSubmit={handleVerify} className="verify-form">
                <input
                  type="text"
                  placeholder="e.g., TEDX1716493205"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
                <button type="submit" className="btn-verify">
                  <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Lookup
                </button>
              </form>
            </div>
          )}

          {result && (
            <div className={`result-card ${result.status}`}>
              <div className="result-header">
                <div className="result-icon-wrapper">
                  {result.status === 'success' && '✅'}
                  {result.status === 'error' && '❌'}
                  {result.status === 'already-used' && 'ℹ️'}
                </div>
                <div className="result-info">
                  <h2>{result.message}</h2>
                  {result.ticket && (
                    <p>
                      {result.ticket.name} • {result.ticket.tier} Pass
                    </p>
                  )}
                </div>
              </div>

              {result.ticket && (
                <>
                  <div className="ticket-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Reference</span>
                        <span className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>
                          {result.ticket.reference}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Attendee</span>
                        <span className="detail-value">{result.ticket.name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Contact</span>
                        <span className="detail-value" style={{ fontSize: '0.875rem' }}>
                          {result.ticket.email}<br/>{result.ticket.phone || 'No phone'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Pass Tier</span>
                        <span className={`tier-badge ${result.ticket.tier.toLowerCase()}`}>
                          {result.ticket.tier}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Payment Status</span>
                        <span className={`status-badge ${result.ticket.status || 'paid'}`}>
                          {result.ticket.status || 'paid'}
                        </span>
                      </div>
                      {result.usedAt && (
                        <div className="detail-item">
                          <span className="detail-label">Checked In At</span>
                          <span className="detail-value" style={{ color: '#93C5FD' }}>
                            {new Date(result.usedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="result-actions">
                    {result.status === 'success' && !result.justMarked && (
                      <button 
                        onClick={markAsUsed} 
                        className="btn-action btn-success"
                        disabled={btnState !== 'idle'}
                      >
                        {btnState === 'idle' && (
                          <>
                            <svg viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Complete Check-In
                          </>
                        )}
                        {btnState === 'loading' && (
                          <div className="btn-loading-content">
                            <div className="btn-spinner" />
                            <span>Completing...</span>
                          </div>
                        )}
                        {btnState === 'success' && '✓ Checked In'}
                      </button>
                    )}
                    <button onClick={resetVerification} className="btn-action btn-secondary">
                      <svg viewBox="0 0 24 24">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      Lookup Another
                    </button>
                    <Link to="/admin/tickets" className="btn-action btn-secondary">
                      <svg viewBox="0 0 24 24">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      Dashboard
                    </Link>
                  </div>
                </>
              )}

              {result.status === 'error' && (
                <div className="result-actions">
                  <button onClick={resetVerification} className="btn-action btn-secondary">
                    <svg viewBox="0 0 24 24">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
