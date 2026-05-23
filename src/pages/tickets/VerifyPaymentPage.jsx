import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useSiteData } from '../../context/SiteDataContext';
import Layout from '../../components/shared/Layout';
import { ticketsAPI } from '../../lib/supabase';

const styles = `
  .verify-page {
    min-height: calc(100vh - 80px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    background: radial-gradient(circle at 50% 50%, rgba(235, 0, 40, 0.05) 0%, #0A0A0A 80%);
  }

  /* Loading State */
  .verify-loading {
    text-align: center;
    color: #9CA3AF;
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid #374151;
    border-top-color: #EB0028;
    border-radius: 50%;
    margin: 0 auto 1.5rem;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .verify-loading p {
    font-size: 1.125rem;
    margin: 0;
  }

  /* Error State */
  .verify-error {
    text-align: center;
    max-width: 480px;
    background: #1A1A1A;
    padding: 3rem;
    border-radius: 32px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .error-icon-wrap {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 1.75rem;
    color: #F87171;
    border: 2px solid rgba(239, 68, 68, 0.2);
  }

  .verify-error h2 {
    color: #FFFFFF;
    font-size: 1.5rem;
    margin: 0 0 0.75rem;
    font-weight: 800;
  }

  .verify-error p {
    color: #9CA3AF;
    margin: 0 0 2rem;
    line-height: 1.6;
  }

  .btn-primary {
    padding: 0.875rem 2rem;
    background: #EB0028;
    color: white;
    border: none;
    border-radius: 100px;
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

  /* Success State */
  .success-header {
    text-align: center;
    margin-bottom: 3rem;
    animation: fadeDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .success-check {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(34, 197, 94, 0.15);
    border: 2px solid rgba(34, 197, 94, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.25rem;
  }

  .success-check svg {
    width: 32px;
    height: 32px;
    stroke: #22C55E;
    stroke-width: 2.5;
    fill: none;
  }

  .success-header h2 {
    color: #FFFFFF;
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.5rem;
    letter-spacing: -0.02em;
  }

  .success-header p {
    color: #9CA3AF;
    font-size: 1rem;
    margin: 0;
  }

  /* ─── Landscape Ticket Card ─── */
  .ticket-container-wrapper {
    width: 100%;
    max-width: 820px;
    perspective: 1000px;
  }

  .ticket-card {
    background: #FFFFFF;
    border-radius: 24px;
    display: flex;
    overflow: hidden;
    width: 100%;
    min-height: 340px;
    animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 0 0 1px rgba(235, 0, 40, 0.1),
      0 15px 40px rgba(0, 0, 0, 0.5),
      0 30px 80px rgba(235, 0, 40, 0.08);
    position: relative;
  }

  /* Left: QR Stub Panel */
  .ticket-qr-panel {
    background: #0D0D0D;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 240px;
    flex-shrink: 0;
    position: relative;
    border-right: 1px dashed rgba(255, 255, 255, 0.15);
  }

  .qr-badge {
    background: #EB0028;
    color: #FFFFFF;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 0.5rem 1.25rem;
    border-radius: 100px;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 12px rgba(235, 0, 40, 0.3);
  }

  .qr-badge.vip {
    background: linear-gradient(135deg, #FFD700 0%, #D97706 100%);
    color: #0A0A0A;
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
  }

  .qr-badge.vvip {
    background: linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%);
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
  }

  .qr-wrap {
    background: #FFFFFF;
    padding: 0.875rem;
    border-radius: 16px;
    margin-bottom: 1.25rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    transition: transform 0.3s ease;
  }

  .qr-wrap:hover {
    transform: scale(1.03);
  }

  .qr-wrap img {
    display: block;
    width: 120px;
    height: 120px;
  }

  .qr-ref-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.375rem 0.875rem;
    border-radius: 100px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .qr-ref {
    color: #D1D5DB;
    font-size: 0.75rem;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .btn-copy-ref {
    background: transparent;
    border: none;
    color: #9CA3AF;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: color 0.2s ease;
  }

  .btn-copy-ref:hover {
    color: #EB0028;
  }

  .btn-copy-ref svg {
    width: 13px;
    height: 13px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
  }

  .qr-scan-text {
    color: #6B7280;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 0.75rem;
  }

  /* Dashed divider stub cutouts */
  .ticket-divider {
    width: 2px;
    position: relative;
    background: transparent;
  }

  .ticket-divider::before,
  .ticket-divider::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    background: #0A0A0A;
    border-radius: 50%;
    left: -12px;
    z-index: 10;
  }

  .ticket-divider::before {
    top: -12px;
  }

  .ticket-divider::after {
    bottom: -12px;
  }

  /* Right: Details Panel */
  .ticket-details-panel {
    flex: 1;
    padding: 2.5rem 3rem;
    display: flex;
    flex-direction: column;
    background: #FFFFFF;
    color: #0A0A0A;
  }

  .ticket-event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid #E5E7EB;
  }

  .ticket-event-logo {
    display: flex;
    flex-direction: column;
  }

  .ticket-event-name {
    font-size: 1.5rem;
    font-weight: 900;
    color: #0A0A0A;
    margin: 0;
    letter-spacing: -0.03em;
  }

  .ticket-event-name span {
    color: #EB0028;
  }

  .ticket-event-theme {
    font-size: 0.8125rem;
    color: #6B7280;
    margin: 0.25rem 0 0;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .ticket-tier-badge {
    background: rgba(235, 0, 40, 0.08);
    color: #EB0028;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    white-space: nowrap;
    border: 1px solid rgba(235, 0, 40, 0.15);
  }

  .ticket-tier-badge.vip {
    background: rgba(255, 215, 0, 0.08);
    color: #D97706;
    border-color: rgba(255, 215, 0, 0.2);
  }

  .ticket-tier-badge.vvip {
    background: rgba(139, 92, 246, 0.08);
    color: #6D28D9;
    border-color: rgba(139, 92, 246, 0.2);
  }

  /* Details Grid */
  .ticket-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem 2rem;
    flex: 1;
  }

  .info-item {
    min-width: 0;
  }

  .info-label {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9CA3AF;
    margin: 0 0 0.375rem;
  }

  .info-value {
    font-size: 1rem;
    font-weight: 700;
    color: #111111;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .info-value.price {
    color: #EB0028;
    font-weight: 900;
    font-size: 1.125rem;
  }

  /* Bottom Actions */
  .ticket-actions {
    display: flex;
    gap: 1rem;
    margin-top: 3rem;
    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-action {
    padding: 0.875rem 2rem;
    border-radius: 100px;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border: none;
  }

  .btn-download {
    background: #EB0028;
    color: white;
    box-shadow: 0 10px 20px rgba(235, 0, 40, 0.2);
  }

  .btn-download:hover {
    background: #C4001F;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(235, 0, 40, 0.4);
  }

  .btn-download svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 2.5;
    fill: none;
  }

  .btn-ghost {
    background: rgba(255, 255, 255, 0.04);
    color: #D1D5DB;
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
  }

  .btn-ghost:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  /* Responsive (Landscape maintained) */
  @media (max-width: 680px) {
    .ticket-card {
      flex-direction: row;
      min-height: auto;
      border-radius: 20px;
    }

    .ticket-qr-panel {
      width: 150px;
      padding: 1.5rem 1rem;
    }

    .qr-badge {
      font-size: 0.625rem;
      padding: 0.375rem 0.875rem;
      margin-bottom: 1rem;
    }

    .qr-wrap {
      padding: 0.5rem;
      border-radius: 10px;
      margin-bottom: 0.75rem;
    }

    .qr-wrap img {
      width: 90px;
      height: 90px;
    }

    .qr-ref-container {
      padding: 0.25rem 0.5rem;
      gap: 0.375rem;
    }

    .qr-ref {
      font-size: 0.625rem;
    }

    .qr-scan-text {
      display: none;
    }

    .ticket-divider::before,
    .ticket-divider::after {
      width: 16px;
      height: 16px;
      left: -8px;
    }
    .ticket-divider::before { top: -8px; }
    .ticket-divider::after { bottom: -8px; }

    .ticket-details-panel {
      padding: 1.5rem;
    }

    .ticket-event-header {
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
    }

    .ticket-event-name {
      font-size: 1.125rem;
    }

    .ticket-event-theme {
      font-size: 0.6875rem;
    }

    .ticket-tier-badge {
      font-size: 0.625rem;
      padding: 0.375rem 0.625rem;
    }

    .ticket-info-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .info-label {
      font-size: 0.5625rem;
      margin: 0 0 0.125rem;
    }

    .info-value {
      font-size: 0.8125rem;
    }

    .info-value.price {
      font-size: 0.875rem;
    }
  }
`;

export default function VerifyPaymentPage() {
  const { siteConfig } = useSiteData();
  const [status, setStatus] = useState('loading');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reference = params.get('reference');
    const data = location.state?.ticketData;

    if (!reference || !data) {
      setStatus('error');
      return;
    }

    setTimeout(() => {
      const ticket = {
        reference,
        name: data.name.toUpperCase(),
        email: data.email,
        phone: data.phone,
        tier: data.tier.name,
        price: data.tier.price,
        event: siteConfig.eventName,
        date: siteConfig.date,
        venue: siteConfig.venueShort || siteConfig.venue,
      };

      setTicketData(ticket);
      setStatus('success');

      const qrData = JSON.stringify({
        reference: ticket.reference,
        name: ticket.name.toUpperCase(),
        tier: ticket.tier,
      });

      QRCode.toDataURL(qrData, {
        width: 240,
        margin: 1,
        color: { dark: '#0A0A0A', light: '#ffffff' },
      }).then(setQrCodeUrl);

      const tickets = JSON.parse(localStorage.getItem('tedx_tickets') || '[]');
      tickets.push(ticket);
      localStorage.setItem('tedx_tickets', JSON.stringify(tickets));

      ticketsAPI.create({
        reference: ticket.reference,
        name: ticket.name.toUpperCase(),
        email: ticket.email,
        phone: ticket.phone,
        tier: ticket.tier,
        price: ticket.price,
        status: 'paid',
        checked_in: false
      }).then((dbTicket) => {
        if (dbTicket) {
          console.log('✅ Ticket synced to Supabase:', dbTicket);
        } else {
          console.error('❌ Failed to sync ticket to Supabase');
        }
      }).catch((err) => {
        console.error('❌ Error syncing ticket to Supabase:', err);
      });
    }, 1500);
  }, [location, siteConfig]);

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `TEDx-${ticketData.reference}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handleDownloadTicket = async () => {
    const card = document.getElementById('ticket-card');
    if (!card) return;

    try {
      const canvas = await html2canvas(card, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        borderRadius: 24,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`TEDx-${ticketData.reference}-ticket.pdf`);
    } catch (err) {
      console.error('Failed to capture ticket:', err);
    }
  };

  const handleCopyRef = () => {
    if (!ticketData) return;
    navigator.clipboard.writeText(ticketData.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tierClass = ticketData?.tier?.toLowerCase() || '';

  if (status === 'loading') {
    return (
      <Layout>
        <style>{styles}</style>
        <div className="verify-page">
          <div className="verify-loading">
            <div className="loading-spinner" />
            <p>Verifying your payment...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === 'error') {
    return (
      <Layout>
        <style>{styles}</style>
        <div className="verify-page">
          <div className="verify-error">
            <div className="error-icon-wrap">✕</div>
            <h2>Verification Failed</h2>
            <p>We couldn't verify your payment. Please try again or contact support.</p>
            <Link to="/tickets" className="btn-primary">Try Again</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{styles}</style>
      <div className="verify-page">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-check">
            <svg viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2>Payment Successful</h2>
          <p>Your ticket is confirmed — save the QR code below for event check-in</p>
        </div>

        {/* Landscape Ticket Card */}
        <div className="ticket-container-wrapper">
          <div className="ticket-card" id="ticket-card">
            {/* Left: QR Stub Panel */}
            <div className="ticket-qr-panel">
              <span className={`qr-badge ${tierClass}`}>{ticketData.tier}</span>
              <div className="qr-wrap">
                {qrCodeUrl && <img src={qrCodeUrl} alt="Ticket QR Code" />}
              </div>
              <div className="qr-ref-container">
                <span className="qr-ref">{ticketData.reference}</span>
                <button onClick={handleCopyRef} className="btn-copy-ref" title="Copy Reference">
                  {copied ? (
                    <span style={{ color: '#22C55E', fontSize: '10px', fontWeight: 'bold' }}>✓</span>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
              <span className="qr-scan-text">Scan at entry</span>
            </div>

            {/* Stub divider cutouts */}
            <div className="ticket-divider" />

            {/* Right: Details Panel */}
            <div className="ticket-details-panel">
              <div className="ticket-event-header">
                <div className="ticket-event-logo">
                  <h3 className="ticket-event-name">TEDx<span>Dutse</span></h3>
                  <p className="ticket-event-theme">{siteConfig.theme}</p>
                </div>
                <span className={`ticket-tier-badge ${tierClass}`}>{ticketData.tier}</span>
              </div>

              <div className="ticket-info-grid">
                <div className="info-item">
                  <p className="info-label">Attendee</p>
                  <p className="info-value" style={{ textTransform: 'uppercase' }}>{ticketData.name.toUpperCase()}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Reference</p>
                  <p className="info-value" style={{ fontFamily: 'monospace' }}>{ticketData.reference}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Email</p>
                  <p className="info-value">{ticketData.email}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Amount Paid</p>
                  <p className="info-value price">₦{ticketData.price.toLocaleString()}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Date & Time</p>
                  <p className="info-value">{ticketData.date}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Venue</p>
                  <p className="info-value">{ticketData.venue}</p>
                </div>
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
            Download PDF
          </button>
          <button onClick={handleDownloadQR} className="btn-action btn-ghost">
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, stroke: 'currentColor', strokeWidth: 2, fill: 'none' }}>
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
          <Link to={`/ticket/${ticketData.reference}`} className="btn-action btn-ghost">
            View Ticket
          </Link>
          <Link to="/" className="btn-action btn-ghost">
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
