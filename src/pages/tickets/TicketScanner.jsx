import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Layout from '../../components/shared/Layout';

const styles = `
  .scanner-container {
    padding: 6rem 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .scanner-header {
    margin-bottom: 2rem;
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

  .scanner-header h1 {
    color: var(--white, #ffffff);
    font-size: 2rem;
    margin: 0 0 1rem;
  }

  .scanner-header p {
    color: var(--gray-400, #9CA3AF);
    margin: 0;
  }

  .scanner-card {
    background: var(--dark-surface, #1a1a1a);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-xl, 16px);
    padding: 2rem;
    margin-bottom: 2rem;
  }

  #qr-reader {
    width: 100%;
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
  }

  #qr-reader video {
    border-radius: var(--radius-lg, 12px);
  }

  .manual-entry {
    margin-top: 2rem;
  }

  .manual-entry h3 {
    color: var(--white, #ffffff);
    font-size: 1.125rem;
    margin: 0 0 1rem;
  }

  .manual-form {
    display: flex;
    gap: 1rem;
  }

  .manual-form input {
    flex: 1;
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md, 8px);
    color: var(--white, #ffffff);
    font-size: 1rem;
  }

  .manual-form input:focus {
    outline: none;
    border-color: var(--ted-red, #EB0028);
  }

  .btn-primary {
    padding: 0.875rem 2rem;
    background: var(--ted-red, #EB0028);
    color: white;
    border: none;
    border-radius: var(--radius-md, 8px);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .btn-primary:hover {
    background: #C41E3A;
  }

  .result-card {
    background: var(--dark-surface, #1a1a1a);
    border-radius: var(--radius-xl, 16px);
    padding: 2rem;
    animation: slideIn 0.3s ease;
  }

  .result-card.success {
    border: 2px solid rgba(34, 197, 94, 0.3);
  }

  .result-card.error {
    border: 2px solid rgba(239, 68, 68, 0.3);
  }

  .result-card.already-used {
    border: 2px solid rgba(59, 130, 246, 0.3);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .result-icon {
    font-size: 2.5rem;
  }

  .result-title {
    color: var(--white, #ffffff);
    font-size: 1.5rem;
    margin: 0;
  }

  .result-subtitle {
    color: var(--gray-400, #9CA3AF);
    margin: 0.25rem 0 0;
  }

  .result-details {
    background: rgba(255, 255, 255, 0.04);
    border-radius: var(--radius-lg, 12px);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
  }

  .detail-label {
    color: var(--gray-400, #9CA3AF);
  }

  .detail-value {
    color: var(--white, #ffffff);
    font-weight: 600;
  }

  .result-actions {
    display: flex;
    gap: 1rem;
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

  @media (max-width: 768px) {
    .manual-form {
      flex-direction: column;
    }

    .result-actions {
      flex-direction: column;
    }
  }
`;

export default function TicketScanner() {
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

  const verifyTicket = (reference) => {
    const tickets = JSON.parse(localStorage.getItem('tedx_tickets') || '[]');
    const ticket = tickets.find(t => t.reference === reference);

    if (!ticket) {
      setResult({
        status: 'error',
        message: 'Ticket not found',
      });
      return;
    }

    if (ticket.status === 'used') {
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
  };

  const markAsUsed = () => {
    if (!result.ticket) return;

    const tickets = JSON.parse(localStorage.getItem('tedx_tickets') || '[]');
    const index = tickets.findIndex(t => t.reference === result.ticket.reference);
    
    if (index !== -1) {
      tickets[index].status = 'used';
      tickets[index].usedAt = new Date().toISOString();
      localStorage.setItem('tedx_tickets', JSON.stringify(tickets));

      setResult({
        status: 'success',
        ticket: tickets[index],
        message: 'Ticket marked as used',
        justMarked: true,
      });
    }
  };

  const resetScanner = () => {
    setResult(null);
    setManualRef('');
  };

  return (
    <Layout>
      <style>{styles}</style>
      <div className="scanner-container">
        <Link to="/admin/tickets" className="back-link">
          ← Back to Dashboard
        </Link>

        <div className="scanner-header">
          <h1>📷 QR Scanner</h1>
          <p>Scan attendee QR codes for event check-in</p>
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
                  <button type="submit" className="btn-primary">
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
              <span className="result-icon">
                {result.status === 'success' && '✅'}
                {result.status === 'error' && '❌'}
                {result.status === 'already-used' && 'ℹ️'}
              </span>
              <div>
                <h2 className="result-title">{result.message}</h2>
                {result.ticket && (
                  <p className="result-subtitle">
                    {result.ticket.name} - {result.ticket.tier}
                  </p>
                )}
              </div>
            </div>

            {result.ticket && (
              <>
                <div className="result-details">
                  <div className="detail-row">
                    <span className="detail-label">Reference</span>
                    <span className="detail-value">{result.ticket.reference}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{result.ticket.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{result.ticket.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{result.ticket.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tier</span>
                    <span className="detail-value">{result.ticket.tier}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Amount</span>
                    <span className="detail-value">₦{result.ticket.price.toLocaleString()}</span>
                  </div>
                  {result.usedAt && (
                    <div className="detail-row">
                      <span className="detail-label">Used At</span>
                      <span className="detail-value">
                        {new Date(result.usedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="result-actions">
                  {result.status === 'success' && !result.justMarked && (
                    <button onClick={markAsUsed} className="btn-success">
                      Mark as Used
                    </button>
                  )}
                  <button onClick={resetScanner} className="btn-secondary">
                    Scan Another
                  </button>
                </div>
              </>
            )}

            {result.status === 'error' && (
              <div className="result-actions">
                <button onClick={resetScanner} className="btn-secondary">
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
