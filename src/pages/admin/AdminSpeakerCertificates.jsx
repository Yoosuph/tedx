import { useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import AdminLayout from './AdminLayout';
import { useSiteData } from '../../context/SiteDataContext';

// Import Google Fonts
const googleFonts = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;700;900&family=Lora:wght@400;500;600;700&display=swap');
`;

const styles = `
  .admin-spcerts-page {
    max-width: 1100px;
  }

  .admin-spcerts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .admin-spcerts-header h1 {
    color: var(--white);
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .admin-spcerts-header p {
    color: var(--gray-400);
    font-size: 1rem;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .btn-bulk {
    padding: 0.75rem 1.5rem;
    background: #B8860B;
    color: white;
    border: none;
    border-radius: 100px;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }

  .btn-bulk:hover:not(:disabled) {
    background: #DAA520;
    transform: translateY(-1px);
  }

  .btn-bulk:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-bulk svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2.5;
    fill: none;
  }

  .btn-preview {
    padding: 0.75rem 1.5rem;
    background: transparent;
    color: var(--gray-300);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-preview:hover {
    border-color: #DAA520;
    color: #DAA520;
  }

  .spcert-stats-bar {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .spcert-stat {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    padding: 1rem 1.5rem;
    flex: 1;
    min-width: 150px;
  }

  .spcert-stat-label {
    color: var(--gray-500);
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 0.25rem;
  }

  .spcert-stat-value {
    color: var(--white);
    font-size: 1.5rem;
    font-weight: 900;
    margin: 0;
  }

  .spcert-stat-value.gold { color: #DAA520; }

  /* Speaker list */
  .spcert-section {
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 28px;
    padding: 2rem;
  }

  .spcert-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .spcert-section-header h2 {
    color: var(--white);
    font-size: 1.375rem;
    font-weight: 800;
    margin: 0;
  }

  .spcert-table-wrapper {
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .spcert-table {
    width: 100%;
    border-collapse: collapse;
  }

  .spcert-table thead {
    background: rgba(255, 255, 255, 0.02);
  }

  .spcert-table th {
    padding: 1rem 1.25rem;
    text-align: left;
    color: var(--gray-400);
    font-weight: 700;
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .spcert-table td {
    padding: 0.875rem 1.25rem;
    color: var(--gray-300);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    font-size: 0.875rem;
  }

  .spcert-table tr:hover {
    background: rgba(255, 255, 255, 0.01);
  }

  .spcert-table tr:last-child td {
    border-bottom: none;
  }

  .spcert-table .name-cell {
    font-weight: 700;
    color: var(--white);
  }

  .spcert-table .role-cell {
    color: var(--gray-400);
    font-size: 0.8125rem;
  }

  .btn-gen {
    padding: 0.5rem 1rem;
    background: rgba(218, 165, 32, 0.1);
    color: #DAA520;
    border: 1px solid rgba(218, 165, 32, 0.2);
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .btn-gen:hover:not(:disabled) {
    background: #DAA520;
    color: #0A0A0A;
    border-color: #DAA520;
  }

  .btn-gen:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-gen svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
    stroke-width: 2.5;
    fill: none;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-state h3 {
    color: var(--gray-300);
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
  }

  .empty-state p {
    color: var(--gray-500);
    font-size: 0.9375rem;
    margin: 0;
  }

  /* Bulk progress */
  .bulk-progress {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .bulk-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .bulk-progress-header span {
    color: var(--gray-400);
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .bulk-progress-header strong {
    color: var(--white);
    font-size: 0.875rem;
  }

  .bulk-progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 100px;
    overflow: hidden;
  }

  .bulk-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #B8860B, #DAA520);
    border-radius: 100px;
    transition: width 0.3s ease;
  }

  /* Preview modal */
  .cert-preview-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .cert-preview-container {
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
    position: relative;
  }

  .cert-preview-close {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
  }

  .cert-preview-close:hover {
    background: rgba(218, 165, 32, 0.3);
    border-color: #DAA520;
  }

  .cert-preview-scale {
    transform: scale(0.65);
    transform-origin: top left;
  }

  /* ─── Speaker Certificate Template — Appreciation Theme (Origami Corners) ─── */
  .cert-template-wrapper {
    position: fixed;
    left: -9999px;
    top: 0;
    z-index: -1;
  }

  .spcert-template {
    width: 1120px;
    height: 790px;
    background: #FFFEF9;
    position: relative;
    overflow: hidden;
    font-family: 'Montserrat', 'Inter', sans-serif;
  }

  /* Origami corner folds */
  .spcert-corner-fold {
    position: absolute;
    width: 140px;
    height: 140px;
    z-index: 5;
  }

  .spcert-corner-fold svg {
    width: 100%;
    height: 100%;
  }

  .spcert-corner-tl { top: 0; left: 0; }
  .spcert-corner-tr { top: 0; right: 0; transform: scaleX(-1); }
  .spcert-corner-bl { bottom: 0; left: 0; transform: scaleY(-1); }
  .spcert-corner-br { bottom: 0; right: 0; transform: scale(-1, -1); }

  /* Delicate inner border */
  .spcert-inner-border {
    position: absolute;
    inset: 24px;
    border: 1px solid rgba(235, 0, 40, 0.12);
  }

  .spcert-inner-border-double {
    position: absolute;
    inset: 28px;
    border: 1px solid rgba(235, 0, 40, 0.06);
  }

  /* Top-left logo */
  .spcert-brand-left {
    position: absolute;
    top: 45px;
    left: 50px;
    z-index: 6;
    font-family: 'Montserrat', sans-serif;
    font-weight: 900;
    font-size: 1.25rem;
    color: #1A1A1A;
    letter-spacing: -0.02em;
  }

  .spcert-brand-left span {
    color: #EB0028;
  }

  /* Top-right branding */
  .spcert-brand-right {
    position: absolute;
    top: 48px;
    right: 50px;
    z-index: 6;
    font-family: 'Montserrat', sans-serif;
    font-weight: 200;
    font-size: 0.6875rem;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.3em;
  }

  .spcert-content {
    position: absolute;
    inset: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    z-index: 2;
  }

  .spcert-type-top {
    font-family: 'Montserrat', sans-serif;
    font-weight: 900;
    font-size: 1.125rem;
    color: #1A1A1A;
    text-transform: uppercase;
    letter-spacing: 0.35em;
    margin-bottom: 0.125rem;
  }

  .spcert-type-bottom {
    font-family: 'Montserrat', sans-serif;
    font-weight: 200;
    font-size: 1.125rem;
    color: #1A1A1A;
    text-transform: uppercase;
    letter-spacing: 0.35em;
    margin-bottom: 1.5rem;
  }

  .spcert-divider {
    width: 80px;
    height: 3px;
    background: #EB0028;
    margin-bottom: 1.5rem;
  }

  .spcert-presented {
    font-family: 'Montserrat', sans-serif;
    font-weight: 300;
    font-size: 0.75rem;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    margin-bottom: 0.75rem;
  }

  .spcert-recipient {
    font-family: 'Lora', serif;
    font-size: 3.75rem;
    font-weight: 700;
    color: #1F2937;
    letter-spacing: 0.01em;
    margin-bottom: 0.75rem;
    line-height: 1.1;
  }

  .spcert-talk-title {
    font-family: 'Lora', serif;
    font-size: 1.0625rem;
    color: #EB0028;
    font-style: italic;
    font-weight: 500;
    margin-bottom: 1.5rem;
    max-width: 600px;
  }

  .spcert-description {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.875rem;
    color: #4B5563;
    line-height: 2;
    max-width: 680px;
    margin-bottom: 2.5rem;
    font-weight: 400;
  }

  .spcert-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    max-width: 700px;
    gap: 2rem;
  }

  .spcert-footer-item {
    text-align: center;
    flex: 1;
  }

  .spcert-footer-line {
    width: 100%;
    height: 2.5px;
    background: #EB0028;
    margin-bottom: 0.625rem;
  }

  .spcert-footer-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.625rem;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .spcert-footer-value {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.875rem;
    color: #111827;
    font-weight: 700;
  }

  /* QR Code */
  .spcert-qr-code {
    position: absolute;
    bottom: 50px;
    right: 60px;
    width: 120px;
    height: 120px;
    z-index: 5;
  }

  .spcert-qr-code img {
    width: 100%;
    height: 100%;
    display: block;
  }

  .spcert-qr-label {
    position: absolute;
    bottom: 32px;
    right: 60px;
    font-family: 'Montserrat', sans-serif;
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
  .spcert-seal {
    position: absolute;
    bottom: 60px;
    left: 60px;
    width: 110px;
    height: 110px;
    z-index: 5;
  }

  .spcert-seal svg {
    width: 100%;
    height: 100%;
  }

  .spcert-qr-label {
    position: absolute;
    bottom: 30px;
    right: 55px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.4375rem;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 500;
    text-align: center;
    width: 90px;
    z-index: 5;
  }

  @media (max-width: 768px) {
    .spcert-section-header {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;

function SpeakerCertificateTemplate({ speaker, siteConfig, qrUrl }) {
  const eventName = siteConfig.eventName || 'TEDxDutse';
  const eventYear = siteConfig.eventYear || 2026;
  const theme = siteConfig.theme || 'Roots and Wings';
  const eventDate = siteConfig.date || 'November 28, 2026';
  const venue = siteConfig.venueShort || siteConfig.venue || 'Dutse, Jigawa State';

  // Origami folded corner SVG - creates a 3D folded ribbon effect
  const origamiCorner = (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      {/* Main fold - deep red face */}
      <polygon points="0,0 140,0 0,140" fill="#EB0028" />
      {/* Shadow fold - darker underside */}
      <polygon points="0,0 90,0 0,90" fill="#C4001F" />
      {/* Highlight fold - lighter top edge */}
      <polygon points="0,0 50,0 0,50" fill="#FF1744" opacity="0.7" />
      {/* Crease line */}
      <line x1="0" y1="140" x2="140" y2="0" stroke="#A3001A" strokeWidth="1" opacity="0.3" />
    </svg>
  );

  return (
    <div className="spcert-template">
      {/* Delicate double inner border */}
      <div className="spcert-inner-border" />
      <div className="spcert-inner-border-double" />

      {/* Origami folded ribbon corners */}
      <div className="spcert-corner-fold spcert-corner-tl">{origamiCorner}</div>
      <div className="spcert-corner-fold spcert-corner-tr">{origamiCorner}</div>
      <div className="spcert-corner-fold spcert-corner-bl">{origamiCorner}</div>
      <div className="spcert-corner-fold spcert-corner-br">{origamiCorner}</div>

      {/* Top-left: TEDx logo */}
      <div className="spcert-brand-left">
        {eventName.includes('TEDx') ? (
          <>TEDx<span>{eventName.replace('TEDx', '')}</span></>
        ) : (
          <>{eventName}</>
        )}
      </div>

      {/* Top-right: branding mark */}
      <div className="spcert-brand-right">The X Change</div>

      <div className="spcert-content">
        <div className="spcert-type-top">Certificate</div>
        <div className="spcert-type-bottom">of Appreciation</div>
        <div className="spcert-divider" />
        <div className="spcert-presented">This is proudly presented to</div>
        <div className="spcert-recipient">{speaker.name}</div>
        {speaker.title && (
          <div className="spcert-talk-title">&ldquo;{speaker.title}&rdquo;</div>
        )}
        <div className="spcert-description">
          In grateful recognition of your invaluable contribution as a speaker at {eventName} {eventYear},
          themed &ldquo;{theme}&rdquo;, held on {eventDate} at {venue}.
          Your ideas, passion, and commitment have inspired our audience and enriched
          the spirit of ideas worth sharing.
        </div>
        <div className="spcert-footer">
          <div className="spcert-footer-item">
            <div className="spcert-footer-line" />
            <div className="spcert-footer-label">Date</div>
            <div className="spcert-footer-value">{eventDate}</div>
          </div>
          <div className="spcert-footer-item">
            <div className="spcert-footer-line" />
            <div className="spcert-footer-label">Organizer</div>
            <div className="spcert-footer-value">{eventName}</div>
          </div>
          <div className="spcert-footer-item">
            <div className="spcert-footer-line" />
            <div className="spcert-footer-label">Role</div>
            <div className="spcert-footer-value">Speaker</div>
          </div>
        </div>
      </div>
      {qrUrl && (
        <>
          <div className="spcert-qr-code">
            <img src={qrUrl} alt="Verification QR" />
          </div>
          <div className="spcert-qr-label">Scan to verify</div>
        </>
      )}
      <div className="spcert-seal">
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
  );
}

export default function AdminSpeakerCertificates() {
  const { siteConfig, speakers } = useSiteData();
  const [generating, setGenerating] = useState('');
  const [bulkProgress, setBulkProgress] = useState(null);
  const [previewSpeaker, setPreviewSpeaker] = useState(null);
  const [qrUrls, setQrUrls] = useState({});

  const speakerList = speakers || [];

  // Inject Google Fonts for Montserrat + Lora
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = googleFonts;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const gen = async () => {
      const newUrls = {};
      for (const speaker of speakerList) {
        if (qrUrls[String(speaker.id)]) continue;
        try {
          const data = JSON.stringify({
            event: `${siteConfig.eventName || 'TEDxDutse'} ${siteConfig.eventYear || 2026}`,
            theme: siteConfig.theme || 'Roots and Wings',
            date: siteConfig.date || 'November 28, 2026',
            venue: siteConfig.venueShort || siteConfig.venue || 'Dutse, Jigawa State',
            organizer: siteConfig.eventName || 'TEDxDutse',
            contact: siteConfig.contactEmail || 'info@tedxdutse.com',
            recipient: speaker.name,
            role: 'Speaker',
            talk: speaker.title || '',
            type: 'Certificate of Appreciation',
            category: 'Speaker',
            verified: true
          });
          const url = await QRCode.toDataURL(data, { width: 200, margin: 1, color: { dark: '#1A1A1A', light: '#FFFEF9' } });
          newUrls[String(speaker.id)] = url;
        } catch (err) { console.error('QR error:', err); }
      }
      if (Object.keys(newUrls).length > 0) setQrUrls(prev => ({ ...prev, ...newUrls }));
    };
    gen();
  }, [speakerList, siteConfig]);

  const generatePDF = async (speaker) => {
    setGenerating(String(speaker.id));
    try {
      const el = document.getElementById(`spcert-${speaker.id}`);
      if (!el) { setGenerating(''); return; }

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#0C0C0C',
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
      pdf.save(`TEDxDutse-Speaker-Certificate-${speaker.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to generate speaker certificate:', err);
    }
    setGenerating('');
  };

  const generateBulk = async () => {
    if (speakerList.length === 0) return;
    setBulkProgress({ current: 0, total: speakerList.length });

    for (let i = 0; i < speakerList.length; i++) {
      const speaker = speakerList[i];
      setBulkProgress({ current: i + 1, total: speakerList.length });

      try {
        const el = document.getElementById(`spcert-${speaker.id}`);
        if (!el) continue;

        const canvas = await html2canvas(el, {
          scale: 2,
          backgroundColor: '#0C0C0C',
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
        pdf.save(`TEDxDutse-Speaker-Certificate-${speaker.name.replace(/\s+/g, '_')}.pdf`);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Failed for ${speaker.name}:`, err);
      }
    }

    setBulkProgress(null);
  };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="admin-spcerts-page">
        {/* Header */}
        <div className="admin-spcerts-header">
          <div>
            <h1>Speaker Certificates</h1>
            <p>Generate appreciation certificates for your speakers</p>
          </div>
          <div className="header-actions">
            <button
              className="btn-preview"
              onClick={() => setPreviewSpeaker(speakerList[0] || { name: 'Sample Speaker', title: 'The Power of Ideas', role: 'Keynote Speaker' })}
            >
              Preview Template
            </button>
            <button
              className="btn-bulk"
              onClick={generateBulk}
              disabled={speakerList.length === 0 || bulkProgress}
            >
              <svg viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {bulkProgress ? `Generating ${bulkProgress.current}/${bulkProgress.total}...` : `Download All (${speakerList.length})`}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="spcert-stats-bar">
          <div className="spcert-stat">
            <p className="spcert-stat-label">Total Speakers</p>
            <p className="spcert-stat-value gold">{speakerList.length}</p>
          </div>
          <div className="spcert-stat">
            <p className="spcert-stat-label">Certificates Ready</p>
            <p className="spcert-stat-value">{speakerList.length}</p>
          </div>
        </div>

        {/* Bulk progress */}
        {bulkProgress && (
          <div className="bulk-progress">
            <div className="bulk-progress-header">
              <span>Generating speaker certificates...</span>
              <strong>{bulkProgress.current} / {bulkProgress.total}</strong>
            </div>
            <div className="bulk-progress-bar">
              <div
                className="bulk-progress-fill"
                style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Speaker List */}
        <div className="spcert-section">
          <div className="spcert-section-header">
            <h2>All Speakers</h2>
          </div>

          {speakerList.length === 0 ? (
            <div className="empty-state">
              <h3>No speakers added yet</h3>
              <p>Add speakers from the Speakers page to generate their certificates</p>
            </div>
          ) : (
            <div className="spcert-table-wrapper">
              <table className="spcert-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Talk Title</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {speakerList.map((speaker) => (
                    <tr key={speaker.id}>
                      <td className="name-cell">{speaker.name}</td>
                      <td className="role-cell">{speaker.role || '—'}</td>
                      <td>{speaker.title || '—'}</td>
                      <td>
                        <button
                          className="btn-gen"
                          onClick={() => generatePDF(speaker)}
                          disabled={generating === String(speaker.id)}
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {generating === String(speaker.id) ? 'Generating...' : 'Generate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Hidden templates */}
      <div className="cert-template-wrapper">
        {speakerList.map((speaker) => (
          <div key={speaker.id} id={`spcert-${speaker.id}`}>
            <SpeakerCertificateTemplate speaker={speaker} siteConfig={siteConfig} qrUrl={qrUrls[String(speaker.id)]} />
          </div>
        ))}
      </div>

      {/* Preview modal */}
      {previewSpeaker && (
        <div className="cert-preview-overlay" onClick={() => setPreviewSpeaker(null)}>
          <button className="cert-preview-close" onClick={() => setPreviewSpeaker(null)}>×</button>
          <div className="cert-preview-container" onClick={e => e.stopPropagation()}>
            <div className="cert-preview-scale">
              <SpeakerCertificateTemplate speaker={previewSpeaker} siteConfig={siteConfig} qrUrl={qrUrls[String(previewSpeaker?.id)] || null} />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
