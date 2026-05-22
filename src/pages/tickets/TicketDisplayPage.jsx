import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import Layout from '../../components/shared/Layout';

const styles = `
  .ticket-page {
    min-height: calc(100vh - 80px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: var(--dark);
  }

  .page-title {
    text-align: center;
    margin-bottom: 2rem;
    animation: fadeDown 0.5s ease;
  }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .page-title h2 {
    color: var(--white);
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.375rem;
  }

  .page-title p {
    color: var(--gray-400);
    font-size: 0.875rem;
    margin: 0;
  }

  /* ─── Landscape Ticket Card ─── */
  .ticket-card {
    background: var(--white);
    border-radius: 20px;
    display: flex;
    overflow: hidden;
    max-width: 780px;
    width: 100%;
    animation: fadeUp 0.5s ease;
    border: 3px solid var(--ted-red);
    box-shadow:
      0 0 0 1px rgba(235, 0, 40, 0.2),
      0 0 30px rgba(235, 0, 40, 0.15),
      0 25px 60px rgba(0, 0, 0, 0.4);
  }

  /* Left: QR Panel */
  .ticket-qr-panel {
    background: var(--dark);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 200px;
    position: relative;
  }

  .ticket-qr-panel::after {
    content: '';
    position: absolute;
    top: 10%;
    right: -6px;
    width: 12px;
    height: 12px;
    background: var(--dark);
    border-radius: 50%;
  }

  .ticket-qr-panel::before {
    content: '';
    position: absolute;
    bottom: 10%;
    right: -6px;
    width: 12px;
    height: 12px;
    background: var(--dark);
    border-radius: 50%;
  }

  .qr-badge {
    background: var(--ted-red);
    color: var(--white);
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.375rem 0.875rem;
    border-radius: 50px;
    margin-bottom: 1rem;
  }

  .qr-wrap {
    background: white;
    padding: 0.75rem;
    border-radius: 12px;
    margin-bottom: 1rem;
  }

  .qr-wrap img {
    display: block;
    width: 120px;
    height: 120px;
  }

  .qr-ref {
    color: var(--gray-400);
    font-size: 0.6875rem;
    font-family: monospace;
    letter-spacing: 0.05em;
    text-align: center;
    word-break: break-all;
  }

  .qr-scan-text {
    color: var(--gray-500);
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-top: 0.5rem;
    text-align: center;
  }

  /* Dashed divider */
  .ticket-divider {
    width: 1px;
    background: repeating-linear-gradient(
      to bottom,
      var(--gray-200) 0,
      var(--gray-200) 6px,
      transparent 6px,
      transparent 12px
    );
  }

  /* Right: Details Panel */
  .ticket-details-panel {
    flex: 1;
    padding: 1.75rem 2rem;
    display: flex;
    flex-direction: column;
  }

  .ticket-event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--gray-200);
  }

  .ticket-event-name {
    font-size: 1.125rem;
    font-weight: 800;
    color: var(--dark);
    margin: 0;
    letter-spacing: -0.02em;
  }

  .ticket-event-theme {
    font-size: 0.8125rem;
    color: var(--gray-500);
    margin: 0.25rem 0 0;
    font-style: italic;
  }

  .ticket-tier-badge {
    background: var(--ted-red);
    color: var(--white);
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    white-space: nowrap;
    flex-shrink: 0;
    margin-left: 1rem;
  }

  .ticket-tier-badge.vip {
    background: linear-gradient(135deg, #F59E0B, #D97706);
  }

  .ticket-tier-badge.vvip {
    background: linear-gradient(135deg, #8B5CF6, #6D28D9);
  }

  /* Details Grid */
  .ticket-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem 2rem;
    flex: 1;
  }

  .info-item {
    min-width: 0;
  }

  .info-label {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--gray-400);
    margin: 0 0 0.25rem;
  }

  .info-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--dark);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .info-value.price {
    color: var(--ted-red);
    font-weight: 700;
    font-size: 1rem;
  }

  /* Bottom Actions */
  .ticket-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 2rem;
    animation: fadeUp 0.5s ease 0.2s both;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-action {
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    border: none;
  }

  .btn-download {
    background: var(--ted-red);
    color: white;
  }

  .btn-download:hover {
    background: #C41E3A;
    transform: translateY(-2px);
  }

  .btn-download svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }

  .btn-ghost {
    background: rgba(255, 255, 255, 0.08);
    color: var(--gray-300);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .btn-ghost:hover {
    background: rgba(255, 255, 255, 0.12);
    color: var(--white);
  }

  /* Error State */
  .error-state {
    text-align: center;
    max-width: 480px;
  }

  .error-state h2 {
    color: #FCA5A5;
    font-size: 1.5rem;
    margin: 0 0 0.75rem;
  }

  .error-state p {
    color: var(--gray-400);
    margin: 0 0 2rem;
    line-height: 1.6;
  }

  .btn-primary {
    padding: 0.875rem 2rem;
    background: var(--ted-red);
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
  }

  .btn-primary:hover {
    background: #C41E3A;
    transform: translateY(-2px);
  }

  /* ─── Responsive ─── */
  @media (max-width: 640px) {
    .ticket-card {
      flex-direction: column;
      max-width: 400px;
    }

    .ticket-qr-panel {
      min-width: auto;
      padding: 1.5rem;
      flex-direction: row;
      gap: 1.25rem;
    }

    .ticket-qr-panel::after,
    .ticket-qr-panel::before {
      display: none;
    }

    .qr-wrap img {
      width: 80px;
      height: 80px;
    }

    .qr-badge {
      margin-bottom: 0;
    }

    .ticket-divider {
      width: 100%;
      height: 1px;
      background: repeating-linear-gradient(
        to right,
        var(--gray-200) 0,
        var(--gray-200) 6px,
        transparent 6px,
        transparent 12px
      );
    }

    .ticket-details-panel {
      padding: 1.5rem;
    }

    .ticket-event-header {
      flex-direction: column;
      gap: 0.75rem;
    }

    .ticket-tier-badge {
      margin-left: 0;
      align-self: flex-start;
    }

    .ticket-info-grid {
      gap: 0.625rem 1.5rem;
    }
  }
`;

export default function TicketDisplayPage() {
  const { reference } = useParams();
  const [ticket, setTicket] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const tickets = JSON.parse(localStorage.getItem('tedx_tickets') || '[]');
    const found = tickets.find(t => t.reference === reference);

    if (found) {
      setTicket(found);

      const qrData = JSON.stringify({
        reference: found.reference,
        name: found.name,
        tier: found.tier,
      });

      QRCode.toDataURL(qrData, {
        width: 240,
        margin: 1,
        color: { dark: '#0A0A0A', light: '#ffffff' },
      }).then(setQrCodeUrl);
    }
  }, [reference]);

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `TEDx-${ticket.reference}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handleDownloadTicket = async () => {
    const card = document.getElementById('ticket-card');
    if (!card) return;

    try {
      const canvas = await html2canvas(card, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        borderRadius: 20,
      });

      const link = document.createElement('a');
      link.download = `TEDx-${ticket.reference}-ticket.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to capture ticket:', err);
    }
  };

  const tierClass = ticket?.tier?.toLowerCase() || '';

  if (!ticket) {
    return (
      <Layout>
        <style>{styles}</style>
        <div className="ticket-page">
          <div className="error-state">
            <h2>Ticket Not Found</h2>
            <p>We couldn't find a ticket with reference: <strong>{reference}</strong></p>
            <Link to="/tickets" className="btn-primary">Get a Ticket</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{styles}</style>
      <div className="ticket-page">
        {/* Header */}
        <div className="page-title">
          <h2>Your Ticket</h2>
          <p>Present the QR code below at the event entrance</p>
        </div>

        {/* Landscape Ticket Card */}
        <div className="ticket-card" id="ticket-card">
          {/* Left: QR Panel */}
          <div className="ticket-qr-panel">
            <span className="qr-badge">{ticket.tier}</span>
            <div className="qr-wrap">
              {qrCodeUrl && <img src={qrCodeUrl} alt="Ticket QR Code" />}
            </div>
            <span className="qr-ref">{ticket.reference}</span>
            <span className="qr-scan-text">Scan at entry</span>
          </div>

          {/* Dashed Divider */}
          <div className="ticket-divider" />

          {/* Right: Details Panel */}
          <div className="ticket-details-panel">
            <div className="ticket-event-header">
              <div>
                <h3 className="ticket-event-name">{ticket.event}</h3>
                <p className="ticket-event-theme">Roots and Wings</p>
              </div>
              <span className={`ticket-tier-badge ${tierClass}`}>{ticket.tier}</span>
            </div>

            <div className="ticket-info-grid">
              <div className="info-item">
                <p className="info-label">Attendee</p>
                <p className="info-value">{ticket.name}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Amount Paid</p>
                <p className="info-value price">₦{ticket.price.toLocaleString()}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Email</p>
                <p className="info-value">{ticket.email}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Phone</p>
                <p className="info-value">{ticket.phone}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Date</p>
                <p className="info-value">{ticket.date}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Venue</p>
                <p className="info-value">{ticket.venue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="ticket-actions">
          <button onClick={handleDownloadTicket} className="btn-action btn-download">
            <svg viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Ticket
          </button>
          <button onClick={handleDownloadQR} className="btn-action btn-ghost">
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: 'currentColor', strokeWidth: 2, fill: 'none' }}>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="3" height="3" />
              <rect x="18" y="14" width="3" height="3" />
              <rect x="14" y="18" width="3" height="3" />
              <rect x="18" y="18" width="3" height="3" />
            </svg>
            Download QR
          </button>
          <Link to="/" className="btn-action btn-ghost">
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
