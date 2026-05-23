import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/shared/Layout';
import { ticketsAPI } from '../../lib/supabase';
import { useSiteData } from '../../context/SiteDataContext';


const styles = `
  .scanner-page {
    min-height: calc(100vh - 80px);
    background: var(--dark);
    padding: 2rem;
  }

  .scanner-container {
    max-width: 900px;
    margin: 0 auto;
  }

  /* Header */
  .scanner-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .scanner-header-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .back-button {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--dark-surface);
    border: 2px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: all 0.3s ease;
    color: var(--gray-400);
  }

  .back-button:hover {
    border-color: var(--ted-red);
    color: var(--ted-red);
    transform: translateX(-4px);
  }

  .back-button svg {
    width: 24px;
    height: 24px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }

  .scanner-title h1 {
    color: var(--white);
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    letter-spacing: -0.02em;
  }

  .scanner-title p {
    color: var(--gray-400);
    font-size: 1rem;
    margin: 0;
  }

  .user-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    background: var(--dark-surface);
    border: 2px solid rgba(255, 255, 255, 0.08);
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

  /* Scanner Card */
  .scanner-card {
    background: var(--dark-surface);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 2.5rem;
    margin-bottom: 2rem;
  }

  #qr-reader {
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
    background: var(--dark);
  }

  #qr-reader video {
    border-radius: 16px;
  }

  .manual-entry {
    margin-top: 2.5rem;
    padding-top: 2.5rem;
    border-top: 2px solid rgba(255, 255, 255, 0.08);
  }

  .manual-entry h3 {
    color: var(--white);
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1.25rem;
  }

  .manual-form {
    display: flex;
    gap: 0.75rem;
  }

  .manual-form input {
    flex: 1;
    padding: 1rem 1.5rem;
    background: var(--dark);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 50px;
    color: var(--white);
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .manual-form input::placeholder {
    color: var(--gray-500);
  }

  .manual-form input:focus {
    outline: none;
    border-color: var(--ted-red);
    box-shadow: 0 0 0 4px rgba(235, 0, 40, 0.1);
  }

  .btn-verify {
    padding: 1rem 2.5rem;
    background: var(--ted-red);
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .btn-verify:hover {
    background: #C41E3A;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(235, 0, 40, 0.3);
  }

  /* Result Cards */
  .result-card {
    background: var(--dark-surface);
    border-radius: 24px;
    padding: 2.5rem;
    animation: slideIn 0.4s ease;
  }

  .result-card.success {
    border: 3px solid rgba(34, 197, 94, 0.4);
    box-shadow: 0 0 40px rgba(34, 197, 94, 0.15);
  }

  .result-card.error {
    border: 3px solid rgba(239, 68, 68, 0.4);
    box-shadow: 0 0 40px rgba(239, 68, 68, 0.15);
  }

  .result-card.already-used {
    border: 3px solid rgba(59, 130, 246, 0.4);
    box-shadow: 0 0 40px rgba(59, 130, 246, 0.15);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid rgba(255, 255, 255, 0.08);
  }

  .result-icon-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    flex-shrink: 0;
  }

  .result-card.success .result-icon-wrapper {
    background: rgba(34, 197, 94, 0.15);
  }

  .result-card.error .result-icon-wrapper {
    background: rgba(239, 68, 68, 0.15);
  }

  .result-card.already-used .result-icon-wrapper {
    background: rgba(59, 130, 246, 0.15);
  }

  .result-info h2 {
    color: var(--white);
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
  }

  .result-info p {
    color: var(--gray-400);
    font-size: 1rem;
    margin: 0;
  }

  /* Ticket Details */
  .ticket-details {
    background: var(--dark);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-label {
    color: var(--gray-500);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
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
    border-radius: 50px;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tier-badge.regular {
    background: rgba(107, 114, 128, 0.2);
    color: #D1D5DB;
  }

  .tier-badge.vip {
    background: rgba(245, 158, 11, 0.2);
    color: #FCD34D;
  }

  .tier-badge.vvip {
    background: rgba(139, 92, 246, 0.2);
    color: #C4B5FD;
  }

  .status-badge {
    display: inline-block;
    padding: 0.375rem 0.875rem;
    border-radius: 50px;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-badge.paid {
    background: rgba(34, 197, 94, 0.15);
    color: #86EFAC;
  }

  .status-badge.used {
    background: rgba(59, 130, 246, 0.15);
    color: #93C5FD;
  }

  /* Action Buttons */
  .result-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .btn-action {
    flex: 1;
    min-width: 200px;
    padding: 1.25rem 2rem;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .btn-action svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }

  .btn-success {
    background: #22C55E;
    color: white;
  }

  .btn-success:hover {
    background: #16A34A;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
  }

  .btn-secondary {
    background: transparent;
    color: var(--gray-300);
    border: 2px solid rgba(255, 255, 255, 0.12);
  }

  .btn-secondary:hover {
    border-color: var(--ted-red);
    color: var(--ted-red);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    .scanner-page {
      padding: 1.5rem 1rem;
    }

    .scanner-header {
      flex-direction: column;
      align-items: stretch;
    }

    .scanner-header-left {
      flex-direction: column;
      align-items: flex-start;
    }

    .scanner-card {
      padding: 2rem 1.5rem;
    }

    .manual-form {
      flex-direction: column;
    }

    .result-card {
      padding: 2rem 1.5rem;
    }

    .result-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .result-actions {
      flex-direction: column;
    }

    .btn-action {
      min-width: 100%;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default function TicketScanner() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { siteConfig } = useSiteData();
  const [result, setResult] = useState(null);
  const [manualRef, setManualRef] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: { width: 250, height: 250 },
      fps: 10,
    }, false);

    scanner.render(handleScan, (error) => {
      // Scan error - ignore
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const handleScan = (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      verifyTicket(data.reference);
    } catch (error) {
      // If not JSON, treat as plain reference
      verifyTicket(decodedText);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualRef.trim()) {
      verifyTicket(manualRef.trim());
    }
  };

  const verifyTicket = async (reference) => {
    try {
      const ticket = await ticketsAPI.getByReference(reference);

      if (!ticket) {
        setResult({
          status: 'error',
          message: 'Ticket not found',
        });
        return;
      }

      // Normalize ticket details
      ticket.usedAt = ticket.checked_in_at || ticket.used_at;
      ticket.event = ticket.event || siteConfig.eventName;
      ticket.date = ticket.date || siteConfig.date;
      ticket.venue = ticket.venue || siteConfig.venueShort || siteConfig.venue;

      if (ticket.status === 'used' || ticket.checked_in) {
        setResult({
          status: 'already-used',
          ticket,
          message: 'This ticket has already been used',
          usedAt: ticket.usedAt,
        });
        return;
      }

      setResult({
        status: 'success',
        ticket,
        message: 'Ticket verified successfully',
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

    try {
      const updated = await ticketsAPI.update(result.ticket.reference, {
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

        setResult({
          status: 'success',
          ticket: updated,
          message: 'Ticket marked as used',
          justMarked: true,
        });

        // Sync local storage cache for checking on this device
        const tickets = JSON.parse(localStorage.getItem('tedx_tickets') || '[]');
        const index = tickets.findIndex(t => t.reference === result.ticket.reference);
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

  const resetScanner = () => {
    setResult(null);
    setManualRef('');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <Layout>
      <style>{styles}</style>
      <div className="scanner-page">
        <div className="scanner-container">
          {/* Header */}
          <div className="scanner-header">
            <div className="scanner-header-left">
              <Link to="/admin/tickets" className="back-button">
                <svg viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </Link>
              <div className="scanner-title">
                <h1>QR Scanner</h1>
                <p>Scan attendee QR codes for event check-in</p>
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
            <>
              <div className="scanner-card">
                <div id="qr-reader"></div>
                
                <div className="manual-entry">
                  <h3>Or enter reference manually:</h3>
                  <form onSubmit={handleManualSubmit} className="manual-form">
                    <input
                      type="text"
                      placeholder="Enter ticket reference..."
                      value={manualRef}
                      onChange={(e) => setManualRef(e.target.value)}
                    />
                    <button type="submit" className="btn-verify">
                      Verify
                    </button>
                  </form>
                </div>
              </div>
            </>
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
                      {result.ticket.name} - {result.ticket.tier}
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
                        <span className="detail-value">{result.ticket.reference}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Name</span>
                        <span className="detail-value">{result.ticket.name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{result.ticket.email}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{result.ticket.phone}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Tier</span>
                        <span className={`tier-badge ${result.ticket.tier.toLowerCase()}`}>
                          {result.ticket.tier}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Amount</span>
                        <span className="detail-value">₦{result.ticket.price.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status</span>
                        <span className={`status-badge ${result.ticket.status || 'paid'}`}>
                          {result.ticket.status || 'paid'}
                        </span>
                      </div>
                      {result.usedAt && (
                        <div className="detail-item">
                          <span className="detail-label">Used At</span>
                          <span className="detail-value">
                            {new Date(result.usedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="result-actions">
                    {result.status === 'success' && !result.justMarked && (
                      <button onClick={markAsUsed} className="btn-action btn-success">
                        <svg viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Mark as Used
                      </button>
                    )}
                    <button onClick={resetScanner} className="btn-action btn-secondary">
                      <svg viewBox="0 0 24 24">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      Scan Another
                    </button>
                  </div>
                </>
              )}

              {result.status === 'error' && (
                <div className="result-actions">
                  <button onClick={resetScanner} className="btn-action btn-secondary">
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
