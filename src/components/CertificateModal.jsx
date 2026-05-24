import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { useSiteData } from '../context/SiteDataContext';
import { ticketsAPI, speakersAPI } from '../lib/supabase';

const googleFonts = `
@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
`;

const styles = `
  .cert-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: cert-modal-fade-in 0.3s ease;
  }

  @keyframes cert-modal-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .cert-modal {
    background: #0F0F0F;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    max-width: 520px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    animation: cert-modal-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes cert-modal-slide-up {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .cert-modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--gray-400);
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
  }

  .cert-modal-close:hover {
    background: rgba(235, 0, 40, 0.15);
    border-color: var(--ted-red);
    color: var(--ted-red);
  }

  .cert-modal-header {
    padding: 2rem 2rem 1rem;
    text-align: center;
  }

  .cert-modal-header h2 {
    color: var(--white);
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0 0 0.375rem;
  }

  .cert-modal-header p {
    color: var(--gray-500);
    font-size: 0.875rem;
    margin: 0;
  }

  .cert-modal-body {
    padding: 1rem 2rem 2rem;
  }

  /* Scanner */
  .cert-modal-scanner-area {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    max-width: 320px;
    margin: 0 auto 1.5rem;
    border-radius: 16px;
    overflow: hidden;
    background: #000;
    border: 2px solid rgba(255, 255, 255, 0.08);
  }

  .cert-modal-scanner-area video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cert-modal-scan-line {
    position: absolute;
    left: 10%;
    right: 10%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #EB0028, transparent);
    box-shadow: 0 0 8px #EB0028;
    animation: cert-scan-anim 2s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes cert-scan-anim {
    0%, 100% { top: 10%; }
    50% { top: calc(100% - 10%); }
  }

  .cert-modal-scanner-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--gray-500);
    font-size: 0.875rem;
  }

  .cert-modal-scanner-placeholder svg {
    width: 48px;
    height: 48px;
    stroke: var(--gray-600);
    fill: none;
    stroke-width: 1.5;
  }

  .cert-modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .cert-modal-btn {
    padding: 0.75rem 1.5rem;
    background: var(--ted-red);
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

  .cert-modal-btn:hover:not(:disabled) {
    background: var(--ted-red-dark);
    transform: translateY(-1px);
  }

  .cert-modal-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cert-modal-btn.secondary {
    background: transparent;
    color: var(--gray-400);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .cert-modal-btn.secondary:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.25);
    color: var(--gray-200);
  }

  .cert-modal-camera-select {
    margin-top: 1rem;
    text-align: center;
  }

  .cert-modal-camera-select select {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--gray-300);
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    cursor: pointer;
  }

  .cert-modal-camera-select select:focus {
    outline: none;
    border-color: var(--ted-red);
  }

  .cert-modal-error {
    background: rgba(235, 0, 40, 0.08);
    border: 1px solid rgba(235, 0, 40, 0.2);
    border-radius: 10px;
    padding: 0.875rem 1.25rem;
    margin-top: 1rem;
    color: #FCA5A5;
    font-size: 0.8125rem;
    text-align: center;
  }

  /* Loading */
  .cert-modal-loading {
    text-align: center;
    padding: 2rem 0;
  }

  .cert-modal-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--ted-red);
    border-radius: 50%;
    animation: cert-spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes cert-spin {
    to { transform: rotate(360deg); }
  }

  .cert-modal-loading p {
    color: var(--gray-400);
    font-size: 0.875rem;
    margin: 0;
  }

  /* Result */
  .cert-modal-result {
    text-align: center;
    padding: 1rem 0;
  }

  .cert-modal-result-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
  }

  .cert-modal-result-icon.success {
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  .cert-modal-result-icon.error {
    background: rgba(235, 0, 40, 0.12);
    border: 1px solid rgba(235, 0, 40, 0.2);
  }

  .cert-modal-result h3 {
    color: var(--white);
    font-size: 1.25rem;
    font-weight: 800;
    margin: 0 0 0.25rem;
  }

  .cert-modal-result .owner {
    color: var(--ted-red);
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 0.375rem;
  }

  .cert-modal-result .meta {
    color: var(--gray-500);
    font-size: 0.8125rem;
    margin: 0 0 1.25rem;
  }

  .cert-modal-result .error-msg {
    color: var(--gray-400);
    font-size: 0.875rem;
    line-height: 1.6;
    margin: 0 0 1.25rem;
  }

  .cert-modal-result .error-msg a {
    color: var(--ted-red);
    text-decoration: underline;
  }

  /* Hidden template */
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

  .cert-accent-left, .cert-accent-right {
    position: absolute;
    top: 0; bottom: 0;
    width: 18px;
    background: #EB0028;
  }
  .cert-accent-left { left: 0; }
  .cert-accent-right { right: 0; }

  .cert-top-line, .cert-bottom-line {
    position: absolute;
    left: 18px; right: 18px;
    height: 3px;
    background: #EB0028;
  }
  .cert-top-line { top: 0; }
  .cert-bottom-line { bottom: 0; }

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

  .cert-logo-text span { color: #EB0028; }

  .cert-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.35em;
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
    margin-bottom: 0.5rem;
  }

  .cert-recipient {
    font-family: 'Crimson Text', serif;
    font-size: 3.5rem;
    font-weight: 700;
    color: #1A1A1A;
    margin-bottom: 0.25rem;
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
  }

  .cert-footer {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 750px;
    gap: 2rem;
  }

  .cert-footer-item { text-align: center; flex: 1; }

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

  .cert-qr-code {
    position: absolute;
    bottom: 50px; right: 60px;
    width: 120px; height: 120px;
  }
  .cert-qr-code img { width: 100%; height: 100%; display: block; }

  .cert-qr-label {
    position: absolute;
    bottom: 32px; right: 60px;
    font-family: 'Inter', sans-serif;
    font-size: 0.5rem;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
    text-align: center;
    width: 120px;
  }

  .cert-seal {
    position: absolute;
    bottom: 60px; left: 60px;
    width: 110px; height: 110px;
  }
  .cert-seal svg { width: 100%; height: 100%; }

  @media (max-width: 640px) {
    .cert-modal {
      border-radius: 16px;
    }
    .cert-modal-header {
      padding: 1.5rem 1.5rem 0.75rem;
    }
    .cert-modal-body {
      padding: 0.75rem 1.5rem 1.5rem;
    }
    .cert-modal-actions {
      flex-direction: column;
    }
    .cert-modal-btn {
      justify-content: center;
    }
  }
`;

export default function CertificateModal({ onClose }) {
  const { siteConfig } = useSiteData();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [qrUrl, setQrUrl] = useState('');

  // Camera state
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [cameraError, setCameraError] = useState('');

  const html5QrCodeRef = useRef(null);

  // Inject fonts
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = googleFonts;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Generate QR for certificate
  useEffect(() => {
    if (!result?.eligible) { setQrUrl(''); return; }
    const gen = async () => {
      const eventName = siteConfig.eventName || 'TEDxDutse';
      const eventYear = siteConfig.eventYear || 2026;
      const theme = siteConfig.theme || 'Roots and Wings';
      const eventDate = siteConfig.date || 'November 28, 2026';
      const venue = siteConfig.venueShort || siteConfig.venue || 'Dutse, Jigawa State';

      let data;
      if (result.type === 'ticket') {
        data = {
          event: `${eventName} ${eventYear}`, theme, date: eventDate, venue,
          organizer: eventName, contact: siteConfig.contactEmail || 'info@tedxdutse.com',
          recipient: result.data.name, email: result.data.email,
          phone: result.data.phone || '', tier: result.data.tier,
          reference: result.data.reference,
          type: 'Certificate of Attendance', category: 'Attendee', verified: true
        };
      } else {
        data = {
          event: `${eventName} ${eventYear}`, theme, date: eventDate, venue,
          organizer: eventName, contact: siteConfig.contactEmail || 'info@tedxdutse.com',
          recipient: result.data.name, role: 'Speaker',
          talk: result.data.title || '',
          type: 'Certificate of Appreciation', category: 'Speaker', verified: true
        };
      }
      try {
        const url = await QRCode.toDataURL(JSON.stringify(data), {
          width: 240, margin: 1, color: { dark: '#1A1A1A', light: '#FFFFFF' }
        });
        setQrUrl(url);
      } catch (err) { console.error(err); }
    };
    gen();
  }, [result, siteConfig]);

  const startScanning = async (cameraId = '') => {
    setCameraError('');
    setIsScanning(true);
    setResult(null);

    if (html5QrCodeRef.current) {
      try { await html5QrCodeRef.current.stop(); html5QrCodeRef.current.clear(); } catch {}
    }

    const scanner = new Html5Qrcode("cert-modal-scanner");
    html5QrCodeRef.current = scanner;

    try {
      await scanner.start(
        cameraId || { facingMode: "environment" },
        { fps: 10, qrbox: (w, h) => { const s = Math.floor(Math.min(w, h) * 0.7); return { width: s, height: s }; } },
        (decodedText) => { stopScanning(); handleScan(decodedText); },
        () => {}
      );

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices?.length > 0) {
          setCameras(devices);
          if (!cameraId) {
            const back = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
            setSelectedCameraId(back ? back.id : devices[0].id);
          } else {
            setSelectedCameraId(cameraId);
          }
        }
      } catch {}
    } catch (err) {
      setCameraError("Camera access denied. Please allow camera permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try { if (html5QrCodeRef.current.isScanning) await html5QrCodeRef.current.stop(); html5QrCodeRef.current.clear(); } catch {}
    }
    setIsScanning(false);
  };

  const handleScan = (decodedText) => {
    let reference = decodedText;
    try {
      const data = JSON.parse(decodedText);
      reference = data.reference || decodedText;
    } catch {}
    lookupCertificate(reference);
  };

  const lookupCertificate = async (reference) => {
    setLoading(true);
    setResult(null);
    try {
      const allTickets = await ticketsAPI.getAll();
      const ticket = allTickets.find(t =>
        t.reference === reference ||
        t.name.toLowerCase() === reference.toLowerCase() ||
        t.email.toLowerCase() === reference.toLowerCase()
      );
      if (ticket) {
        const isVVIP = ticket.tier?.toLowerCase() === 'vvip';
        const isCheckedIn = ticket.checked_in || ticket.status === 'used';
        setResult({ type: 'ticket', data: ticket, eligible: isVVIP && isCheckedIn });
        setLoading(false);
        return;
      }
      const speakers = await speakersAPI.getAll();
      const speaker = speakers.find(s =>
        s.name.toLowerCase() === reference.toLowerCase() ||
        (s.title && s.title.toLowerCase() === reference.toLowerCase())
      );
      if (speaker) {
        setResult({ type: 'speaker', data: speaker, eligible: true });
        setLoading(false);
        return;
      }
      setResult({ type: 'not-found', data: null, eligible: false });
    } catch (err) {
      setResult({ type: 'error', data: null, eligible: false });
    }
    setLoading(false);
  };

  const generatePDF = async () => {
    if (!result?.eligible) return;
    setGenerating(true);
    try {
      const el = document.getElementById('cert-modal-template');
      if (!el) { setGenerating(false); return; }
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const name = result.data.name.replace(/\s+/g, '_');
      const suffix = result.type === 'speaker' ? 'Speaker' : 'Attendance';
      pdf.save(`TEDxDutse-Certificate-${suffix}-${name}.pdf`);
    } catch (err) { console.error(err); }
    setGenerating(false);
  };

  const handleReset = () => {
    setResult(null);
    setQrUrl('');
    setCameraError('');
  };

  const eventName = siteConfig.eventName || 'TEDxDutse';
  const eventYear = siteConfig.eventYear || 2026;
  const theme = siteConfig.theme || 'Roots and Wings';
  const eventDate = siteConfig.date || 'November 28, 2026';
  const venue = siteConfig.venueShort || siteConfig.venue || 'Dutse, Jigawa State';

  return (
    <>
      <style>{styles}</style>
      <div className="cert-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { stopScanning(); onClose(); } }}>
        <div className="cert-modal" onClick={(e) => e.stopPropagation()}>
          <button className="cert-modal-close" onClick={() => { stopScanning(); onClose(); }}>×</button>

          <div className="cert-modal-header">
            <h2>My Certificate</h2>
            <p>Scan your ticket QR code to retrieve your certificate</p>
          </div>

          <div className="cert-modal-body">
            {/* Scanner */}
            {!result && !loading && (
              <>
                <div className="cert-modal-scanner-area">
                  <div id="cert-modal-scanner" style={{ width: '100%', height: '100%', display: isScanning ? 'block' : 'none' }} />
                  {isScanning && <div className="cert-modal-scan-line" />}
                  {!isScanning && (
                    <div className="cert-modal-scanner-placeholder">
                      <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                      <span>Camera off</span>
                    </div>
                  )}
                </div>

                <div className="cert-modal-actions">
                  {!isScanning ? (
                    <button className="cert-modal-btn" onClick={() => startScanning()}>
                      Open Camera
                    </button>
                  ) : (
                    <button className="cert-modal-btn secondary" onClick={stopScanning}>
                      Stop Camera
                    </button>
                  )}
                </div>

                {isScanning && cameras.length > 1 && (
                  <div className="cert-modal-camera-select">
                    <select value={selectedCameraId} onChange={(e) => { setSelectedCameraId(e.target.value); startScanning(e.target.value); }}>
                      {cameras.map(cam => (<option key={cam.id} value={cam.id}>{cam.label}</option>))}
                    </select>
                  </div>
                )}

                {cameraError && <div className="cert-modal-error">{cameraError}</div>}
              </>
            )}

            {/* Loading */}
            {loading && (
              <div className="cert-modal-loading">
                <div className="cert-modal-spinner" />
                <p>Verifying your ticket...</p>
              </div>
            )}

            {/* Eligible */}
            {result?.eligible && (
              <div className="cert-modal-result">
                <div className="cert-modal-result-icon success">✓</div>
                <h3>Certificate Found</h3>
                <p className="owner">{result.data.name}</p>
                <p className="meta">
                  {result.type === 'ticket'
                    ? `${result.data.tier} Ticket — ${result.data.reference}`
                    : `Speaker${result.data.title ? ` — "${result.data.title}"` : ''}`}
                </p>
                <div className="cert-modal-actions">
                  <button className="cert-modal-btn" onClick={generatePDF} disabled={generating}>
                    {generating ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button className="cert-modal-btn secondary" onClick={handleReset}>
                    Scan Another
                  </button>
                </div>
              </div>
            )}

            {/* Not eligible (non-VVIP) */}
            {result && !result.eligible && result.type === 'ticket' && (
              <div className="cert-modal-result">
                <div className="cert-modal-result-icon error">✗</div>
                <h3>Certificate Not Available</h3>
                <p className="owner">{result.data.name}</p>
                <p className="meta">{result.data.tier} Ticket — {result.data.reference}</p>
                <p className="error-msg">
                  Self-service certificates are currently available only for <strong>VVIP ticket holders</strong> who checked in at the event.
                  <br /><br />
                  Please contact the organisers at{' '}
                  <a href={`mailto:${siteConfig.contactEmail || 'info@tedxdutse.com'}`}>
                    {siteConfig.contactEmail || 'info@tedxdutse.com'}
                  </a>
                </p>
                <div className="cert-modal-actions">
                  <button className="cert-modal-btn secondary" onClick={handleReset}>Try Again</button>
                </div>
              </div>
            )}

            {/* Not found */}
            {result?.type === 'not-found' && (
              <div className="cert-modal-result">
                <div className="cert-modal-result-icon error">?</div>
                <h3>Ticket Not Found</h3>
                <p className="error-msg">
                  We couldn't find a ticket or speaker record matching your scan.
                  <br /><br />
                  Please make sure you're scanning the correct QR code. If you believe this is an error, contact{' '}
                  <a href={`mailto:${siteConfig.contactEmail || 'info@tedxdutse.com'}`}>
                    {siteConfig.contactEmail || 'info@tedxdutse.com'}
                  </a>
                </p>
                <div className="cert-modal-actions">
                  <button className="cert-modal-btn secondary" onClick={handleReset}>Try Again</button>
                </div>
              </div>
            )}

            {/* Error */}
            {result?.type === 'error' && (
              <div className="cert-modal-result">
                <div className="cert-modal-result-icon error">!</div>
                <h3>Something Went Wrong</h3>
                <p className="error-msg">
                  An error occurred. Please try again or contact{' '}
                  <a href={`mailto:${siteConfig.contactEmail || 'info@tedxdutse.com'}`}>
                    {siteConfig.contactEmail || 'info@tedxdutse.com'}
                  </a>
                </p>
                <div className="cert-modal-actions">
                  <button className="cert-modal-btn secondary" onClick={handleReset}>Try Again</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden template */}
      {result?.eligible && (
        <div className="cert-template-wrapper">
          <div id="cert-modal-template" className="cert-template">
            <div className="cert-accent-left" />
            <div className="cert-accent-right" />
            <div className="cert-top-line" />
            <div className="cert-bottom-line" />
            <div className="cert-inner-frame" />
            <div className="cert-content">
              <div className="cert-logo-text">
                {eventName.includes('TEDx') ? (<>TEDx<span>{eventName.replace('TEDx', '')}</span></>) : <>{eventName}</>}
              </div>
              <div className="cert-subtitle">{eventYear} — {theme}</div>
              <div className="cert-divider-top" />
              <div className="cert-type">{result.type === 'speaker' ? 'Certificate of Appreciation' : 'Certificate of Attendance'}</div>
              <div className="cert-presented">This is proudly presented to</div>
              <div className="cert-recipient">{result.data.name.toUpperCase()}</div>
              <div className="cert-recipient-line" />
              <div className="cert-description">
                {result.type === 'speaker'
                  ? <>In grateful recognition of your invaluable contribution as a speaker at {eventName} {eventYear}, themed &ldquo;{theme}&rdquo;, held on {eventDate} at {venue}.{result.data.title ? <> Your talk &ldquo;{result.data.title}&rdquo; inspired our audience.</> : ''} Your ideas, passion, and commitment have enriched the spirit of ideas worth sharing.</>
                  : <>In recognition of their attendance at {eventName} {eventYear}, themed &ldquo;{theme}&rdquo;, held on {eventDate} at {venue}. Your presence contributed to the spread of ideas worth sharing, in the spirit of TEDx.</>
                }
              </div>
              <div className="cert-footer">
                <div className="cert-footer-item"><div className="cert-footer-line" /><div className="cert-footer-label">Date</div><div className="cert-footer-value">{eventDate}</div></div>
                <div className="cert-footer-item"><div className="cert-footer-line" /><div className="cert-footer-label">Organizer</div><div className="cert-footer-value">{eventName}</div></div>
                <div className="cert-footer-item"><div className="cert-footer-line" /><div className="cert-footer-label">{result.type === 'speaker' ? 'Role' : 'Reference'}</div><div className="cert-footer-value">{result.type === 'speaker' ? 'Speaker' : result.data.reference}</div></div>
              </div>
            </div>
            {qrUrl && (<><div className="cert-qr-code"><img src={qrUrl} alt="QR" /></div><div className="cert-qr-label">Scan to verify</div></>)}
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
        </div>
      )}
    </>
  );
}
