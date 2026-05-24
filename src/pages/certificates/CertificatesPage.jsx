import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { useSiteData } from '../../context/SiteDataContext';
import { ticketsAPI } from '../../lib/supabase';

// Import Google Fonts
const googleFonts = `
@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
`;

const styles = `
  .cert-page {
    min-height: calc(100vh - 80px);
    padding: 6rem 2rem 4rem;
    background: radial-gradient(circle at 50% 30%, rgba(235, 0, 40, 0.04) 0%, #0A0A0A 70%);
  }

  .cert-container {
    max-width: 720px;
    margin: 0 auto;
  }

  .cert-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .cert-header h1 {
    color: var(--white);
    font-size: 2.5rem;
    font-weight: 900;
    margin: 0 0 0.5rem;
    letter-spacing: -0.03em;
  }

  .cert-header h1 span {
    color: var(--ted-red);
  }

  .cert-header p {
    color: var(--gray-400);
    font-size: 1.0625rem;
    margin: 0;
    line-height: 1.6;
  }

  /* Search Form */
  .cert-search {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    padding: 2rem;
    margin-bottom: 2.5rem;
  }

  .cert-search h3 {
    color: var(--white);
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 1.25rem;
  }

  .cert-search-form {
    display: flex;
    gap: 0.75rem;
  }

  .cert-search-input {
    flex: 1;
    padding: 0.875rem 1.5rem;
    background: var(--black);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    color: var(--white);
    font-size: 0.9375rem;
    transition: all 0.3s ease;
  }

  .cert-search-input::placeholder {
    color: var(--gray-600);
  }

  .cert-search-input:focus {
    outline: none;
    border-color: var(--ted-red);
    box-shadow: 0 0 15px rgba(235, 0, 40, 0.1);
  }

  .cert-search-btn {
    padding: 0.875rem 2rem;
    background: var(--ted-red);
    color: white;
    border: none;
    border-radius: 100px;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .cert-search-btn:hover:not(:disabled) {
    background: var(--ted-red-dark);
    transform: translateY(-1px);
  }

  .cert-search-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Results */
  .cert-results {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .cert-result-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s ease;
  }

  .cert-result-card:hover {
    border-color: rgba(235, 0, 40, 0.3);
    background: rgba(255, 255, 255, 0.03);
  }

  .cert-result-info h4 {
    color: var(--white);
    font-size: 1.0625rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
    text-transform: uppercase;
  }

  .cert-result-info p {
    color: var(--gray-400);
    font-size: 0.8125rem;
    margin: 0;
  }

  .cert-result-info .cert-ref {
    font-family: 'JetBrains Mono', monospace;
    color: var(--gray-500);
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  .cert-download-btn {
    padding: 0.625rem 1.5rem;
    background: var(--ted-red);
    color: white;
    border: none;
    border-radius: 100px;
    font-size: 0.8125rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .cert-download-btn:hover:not(:disabled) {
    background: var(--ted-red-dark);
    transform: translateY(-1px);
  }

  .cert-download-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cert-download-btn svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2.5;
    fill: none;
  }

  /* Not found / not checked in */
  .cert-not-found {
    text-align: center;
    padding: 3rem 2rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
  }

  .cert-not-found h3 {
    color: var(--gray-300);
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
  }

  .cert-not-found p {
    color: var(--gray-500);
    font-size: 0.9375rem;
    margin: 0 0 1.5rem;
    line-height: 1.6;
  }

  .cert-not-found .warn {
    color: #FCD34D;
  }

  /* ─── Certificate Template ─── */
  .cert-template-wrapper {
    position: fixed;
    left: -9999px;
    top: 0;
    z-index: -1;
  }

  .cert-template {
    width: 1120px;
    height: 790px;
    background: #FFFFFF;
    position: relative;
    overflow: hidden;
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  }

  /* Left accent bar */
  .cert-accent-left {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 18px;
    background: #EB0028;
  }

  /* Right accent bar */
  .cert-accent-right {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 18px;
    background: #EB0028;
  }

  /* Top thin red line */
  .cert-top-line {
    position: absolute;
    top: 0;
    left: 18px;
    right: 18px;
    height: 3px;
    background: #EB0028;
  }

  /* Bottom thin red line */
  .cert-bottom-line {
    position: absolute;
    bottom: 0;
    left: 18px;
    right: 18px;
    height: 3px;
    background: #EB0028;
  }

  /* Inner border */
  .cert-inner-frame {
    position: absolute;
    inset: 30px;
    border: 1px solid #E5E7EB;
  }

  .cert-content {
    position: absolute;
    inset: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
  }

  .cert-logo-text {
    font-family: 'Crimson Text', serif;
    font-size: 3rem;
    font-weight: 700;
    color: #1A1A1A;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }

  .cert-logo-text span {
    color: #EB0028;
  }

  .cert-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.35em;
    font-weight: 400;
    margin-bottom: 2rem;
  }

  .cert-divider-top {
    width: 60px;
    height: 2px;
    background: #EB0028;
    margin-bottom: 1.5rem;
  }

  .cert-type {
    font-family: 'Crimson Text', serif;
    font-size: 1rem;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .cert-presented {
    font-family: 'Inter', sans-serif;
    font-size: 0.6875rem;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-weight: 400;
    margin-bottom: 0.5rem;
  }

  .cert-recipient {
    font-family: 'Crimson Text', serif;
    font-size: 3.5rem;
    font-weight: 700;
    color: #1A1A1A;
    letter-spacing: 0.02em;
    margin-bottom: 0.25rem;
    line-height: 1.2;
  }

  .cert-recipient-line {
    width: 200px;
    height: 2px;
    background: #EB0028;
    margin: 0.5rem auto 1.25rem;
  }

  .cert-description {
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    color: #4B5563;
    line-height: 1.9;
    max-width: 680px;
    margin-bottom: 2rem;
    font-weight: 400;
  }

  .cert-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    max-width: 750px;
    gap: 2rem;
  }

  .cert-footer-item {
    text-align: center;
    flex: 1;
  }

  .cert-footer-line {
    width: 100%;
    height: 1.5px;
    background: #9CA3AF;
    margin-bottom: 0.5rem;
  }

  .cert-footer-label {
    font-family: 'Inter', sans-serif;
    font-size: 0.625rem;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .cert-footer-value {
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    color: #111827;
    font-weight: 700;
  }

  /* QR Code */
  .cert-qr-code {
    position: absolute;
    bottom: 50px;
    right: 60px;
    width: 120px;
    height: 120px;
    z-index: 5;
  }

  .cert-qr-code img {
    width: 100%;
    height: 100%;
    display: block;
  }

  .cert-qr-label {
    position: absolute;
    bottom: 32px;
    right: 60px;
    font-family: 'Inter', sans-serif;
    font-size: 0.5rem;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
    text-align: center;
    width: 120px;
    z-index: 5;
  }

  /* Official Seal */
  .cert-seal {
    position: absolute;
    bottom: 60px;
    left: 60px;
    width: 110px;
    height: 110px;
    z-index: 5;
  }

  .cert-seal svg {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 640px) {
    .cert-header h1 {
      font-size: 1.75rem;
    }

    .cert-search {
      padding: 1.5rem;
    }

    .cert-search-form {
      flex-direction: column;
    }

    .cert-result-card {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .cert-download-btn {
      justify-content: center;
    }
  }
`;

export default function CertificatesPage() {
  const { siteConfig } = useSiteData();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState('');
  const [qrCodes, setQrCodes] = useState({});

  // Inject Google Fonts
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = googleFonts;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Generate QR codes for search results
  useEffect(() => {
    if (results.length === 0) return;
    
    const generateQRs = async () => {
      const newQRs = {};
      for (const ticket of results) {
        if (qrCodes[ticket.reference]) continue; // skip if already generated
        try {
          const qrData = JSON.stringify({
            event: `${eventName} ${eventYear}`,
            theme: theme,
            date: eventDate,
            venue: siteConfig.venueShort || siteConfig.venue || 'Dutse, Jigawa State',
            recipient: ticket.name,
            email: ticket.email,
            tier: ticket.tier,
            reference: ticket.reference,
            type: 'Certificate of Attendance',
            verified: true
          });
          const dataUrl = await QRCode.toDataURL(qrData, {
            width: 200,
            margin: 1,
            color: { dark: '#1A1A1A', light: '#FFFFFF' }
          });
          newQRs[ticket.reference] = dataUrl;
        } catch (err) {
          console.error('QR generation error:', err);
        }
      }
      if (Object.keys(newQRs).length > 0) {
        setQrCodes(prev => ({ ...prev, ...newQRs }));
      }
    };
    generateQRs();
  }, [results]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    setSearched(true);

    try {
      const allTickets = await ticketsAPI.getAll();
      const term = query.trim().toLowerCase();

      const matched = allTickets.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term) ||
        t.reference.toLowerCase().includes(term)
      );

      // Only show checked-in tickets
      const checkedIn = matched.filter(t => t.checked_in || t.status === 'used');
      setResults(checkedIn);
    } catch (err) {
      console.error('Certificate search error:', err);
    }

    setLoading(false);
  };

  const generateCertificatePDF = async (ticket) => {
    setGenerating(ticket.reference);

    try {
      const el = document.getElementById(`cert-template-${ticket.reference}`);
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`TEDxDutse-Certificate-${ticket.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to generate certificate:', err);
    }

    setGenerating('');
  };

  const eventName = siteConfig.eventName || 'TEDxDutse';
  const eventYear = siteConfig.eventYear || 2026;
  const theme = siteConfig.theme || 'Roots and Wings';
  const eventDate = siteConfig.date || 'November 28, 2026';

  return (
    <Layout>
      <style>{styles}</style>
      <div className="cert-page">
        <div className="cert-container">
          {/* Header */}
          <div className="cert-header">
            <h1>Certificate <span>of Attendance</span></h1>
            <p>
              Search by your name, email, or ticket reference to download your {eventName} {eventYear} certificate.
              Only attendees who checked in at the event are eligible.
            </p>
          </div>

          {/* Search */}
          <div className="cert-search">
            <h3>Find Your Certificate</h3>
            <form className="cert-search-form" onSubmit={handleSearch}>
              <input
                type="text"
                className="cert-search-input"
                placeholder="Enter your name, email, or ticket reference..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="cert-search-btn" disabled={loading || !query.trim()}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Results */}
          {searched && !loading && results.length === 0 && (
            <div className="cert-not-found">
              <h3>No Certificates Found</h3>
              <p>
                We couldn't find any checked-in ticket matching "<strong>{query}</strong>".
                <br /><br />
                <span className="warn">⚠ Certificates are only available for attendees who checked in at the event.</span>
                <br /><br />
                If you attended but can't find your certificate, please contact us at{' '}
                <a href={`mailto:${siteConfig.contactEmail || 'info@tedxdutse.com'}`} style={{ color: 'var(--ted-red)' }}>
                  {siteConfig.contactEmail || 'info@tedxdutse.com'}
                </a>
              </p>
              <Link to="/tickets" className="cert-search-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Get a Ticket
              </Link>
            </div>
          )}

          {results.length > 0 && (
            <div className="cert-results">
              {results.map((ticket) => (
                <div key={ticket.reference} className="cert-result-card">
                  <div className="cert-result-info">
                    <h4>{ticket.name}</h4>
                    <p>{ticket.tier} Ticket — {ticket.email}</p>
                    <p className="cert-ref">{ticket.reference}</p>
                  </div>
                  <button
                    className="cert-download-btn"
                    onClick={() => generateCertificatePDF(ticket)}
                    disabled={generating === ticket.reference}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {generating === ticket.reference ? 'Generating...' : 'Download PDF'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hidden certificate templates for PDF generation */}
      <div className="cert-template-wrapper">
        {results.map((ticket) => (
          <div key={ticket.reference} id={`cert-template-${ticket.reference}`} className="cert-template">
            <div className="cert-accent-left" />
            <div className="cert-accent-right" />
            <div className="cert-top-line" />
            <div className="cert-bottom-line" />
            <div className="cert-inner-frame" />
            <div className="cert-content">
              <div className="cert-logo-text">
                {eventName.includes('TEDx') ? (
                  <>TEDx<span style={{ color: '#EB0028' }}>{eventName.replace('TEDx', '')}</span></>
                ) : (
                  <>{eventName}</>
                )}
              </div>
              <div className="cert-subtitle">{eventYear} — {theme}</div>
              <div className="cert-divider-top" />
              <div className="cert-type">Certificate of Attendance</div>
              <div className="cert-presented">This is proudly presented to</div>
              <div className="cert-recipient">{ticket.name.toUpperCase()}</div>
              <div className="cert-recipient-line" />
              <div className="cert-description">
                In recognition of their attendance at {eventName} {eventYear}, themed "{theme}",
                held on {eventDate} at {siteConfig.venueShort || siteConfig.venue || 'Dutse, Jigawa State'}.
                Your presence contributed to the spread of ideas worth sharing, in the spirit of TEDx.
              </div>
              <div className="cert-footer">
                <div className="cert-footer-item">
                  <div className="cert-footer-line" />
                  <div className="cert-footer-label">Date</div>
                  <div className="cert-footer-value">{eventDate}</div>
                </div>
                <div className="cert-footer-item">
                  <div className="cert-footer-line" />
                  <div className="cert-footer-label">Organizer</div>
                  <div className="cert-footer-value">{eventName}</div>
                </div>
                <div className="cert-footer-item">
                  <div className="cert-footer-line" />
                  <div className="cert-footer-label">Reference</div>
                  <div className="cert-footer-value">{ticket.reference}</div>
                </div>
              </div>
            </div>
            {qrCodes[ticket.reference] && (
              <>
                <div className="cert-qr-code">
                  <img src={qrCodes[ticket.reference]} alt="Verification QR" />
                </div>
                <div className="cert-qr-label">Scan to verify</div>
              </>
            )}
            <div className="cert-seal">
              <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
                <circle cx="55" cy="55" r="50" fill="#EB0028" opacity="0.08" />
                <circle cx="55" cy="55" r="46" fill="none" stroke="#EB0028" strokeWidth="2" />
                <circle cx="55" cy="55" r="40" fill="none" stroke="#EB0028" strokeWidth="1" opacity="0.5" />
                <circle cx="55" cy="55" r="35" fill="none" stroke="#EB0028" strokeWidth="0.5" opacity="0.3" />
                <text x="55" y="35" textAnchor="middle" fontSize="7" fontWeight="700" fill="#EB0028" letterSpacing="2">TEDx</text>
                <text x="55" y="50" textAnchor="middle" fontSize="9" fontWeight="900" fill="#EB0028" letterSpacing="1">VERIFIED</text>
                <text x="55" y="65" textAnchor="middle" fontSize="6" fontWeight="600" fill="#6B7280" letterSpacing="1.5">CERTIFICATE</text>
                <text x="55" y="78" textAnchor="middle" fontSize="5" fontWeight="500" fill="#9CA3AF">{eventYear}</text>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
