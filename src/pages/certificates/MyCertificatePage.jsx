import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import Layout from '../../components/shared/Layout';
import { useSiteData } from '../../context/SiteDataContext';
import { ticketsAPI, speakersAPI } from '../../lib/supabase';

const googleFonts = `
@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
`;

const styles = `
  .my-cert-page {
    min-height: calc(100vh - 80px);
    padding: 6rem 2rem 4rem;
    background: radial-gradient(circle at 50% 30%, rgba(235, 0, 40, 0.04) 0%, #0A0A0A 70%);
  }

  .my-cert-container {
    max-width: 720px;
    margin: 0 auto;
  }

  .my-cert-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .my-cert-header h1 {
    color: var(--white);
    font-size: 2.5rem;
    font-weight: 900;
    margin: 0 0 0.5rem;
    letter-spacing: -0.03em;
  }

  .my-cert-header h1 span {
    color: var(--ted-red);
  }

  .my-cert-header p {
    color: var(--gray-400);
    font-size: 1.0625rem;
    margin: 0;
    line-height: 1.6;
  }

  /* Scanner Section */
  .my-cert-scanner-section {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 24px;
    padding: 2.5rem;
    margin-bottom: 2rem;
  }

  .my-cert-scanner-section h2 {
    color: var(--white);
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
  }

  .my-cert-scanner-section > p {
    color: var(--gray-500);
    font-size: 0.875rem;
    margin: 0 0 1.5rem;
  }

  .my-cert-qr-scanner {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    border-radius: 16px;
    overflow: hidden;
    background: #000;
  }

  .my-cert-qr-scanner video {
    border-radius: 16px;
  }

  .my-cert-scanner-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 1.5rem;
    flex-wrap: wrap;
  }

  .my-cert-btn {
    padding: 0.75rem 1.75rem;
    background: var(--ted-red);
    color: white;
    border: none;
    border-radius: 100px;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .my-cert-btn:hover:not(:disabled) {
    background: var(--ted-red-dark);
    transform: translateY(-1px);
  }

  .my-cert-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .my-cert-btn.secondary {
    background: transparent;
    color: var(--gray-400);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .my-cert-btn.secondary:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.25);
    color: var(--gray-200);
  }

  .my-cert-camera-select {
    margin-top: 1rem;
    text-align: center;
  }

  .my-cert-camera-select select {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--gray-300);
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
    cursor: pointer;
  }

  .my-cert-camera-select select:focus {
    outline: none;
    border-color: var(--ted-red);
  }

  .my-cert-scanner-error {
    background: rgba(235, 0, 40, 0.08);
    border: 1px solid rgba(235, 0, 40, 0.2);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    margin-top: 1rem;
    color: #FCA5A5;
    font-size: 0.875rem;
    text-align: center;
  }

  .my-cert-scanner-error p {
    margin: 0;
  }

  /* Loading / Processing */
  .my-cert-loading {
    text-align: center;
    padding: 3rem 2rem;
  }

  .my-cert-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--ted-red);
    border-radius: 50%;
    animation: my-cert-spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes my-cert-spin {
    to { transform: rotate(360deg); }
  }

  .my-cert-loading p {
    color: var(--gray-400);
    font-size: 0.9375rem;
    margin: 0;
  }

  /* Result Card */
  .my-cert-result {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 2.5rem;
    text-align: center;
    animation: fadeUp 0.4s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .my-cert-result-icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 1.25rem;
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }

  .my-cert-result-icon.error {
    background: rgba(235, 0, 40, 0.12);
    border-color: rgba(235, 0, 40, 0.2);
  }

  .my-cert-result h3 {
    color: var(--white);
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0 0 0.375rem;
  }

  .my-cert-result .cert-owner {
    color: var(--ted-red);
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
  }

  .my-cert-result .cert-meta {
    color: var(--gray-500);
    font-size: 0.8125rem;
    margin: 0 0 1.75rem;
  }

  .my-cert-result .cert-error-msg {
    color: var(--gray-400);
    font-size: 0.9375rem;
    line-height: 1.6;
    margin: 0 0 1.5rem;
  }

  .my-cert-result .cert-error-msg a {
    color: var(--ted-red);
    text-decoration: underline;
  }

  .my-cert-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .my-cert-download {
    padding: 0.875rem 2rem;
    background: var(--ted-red);
    color: white;
    border: none;
    border-radius: 100px;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    transition: all 0.3s ease;
  }

  .my-cert-download:hover:not(:disabled) {
    background: var(--ted-red-dark);
    transform: translateY(-1px);
  }

  .my-cert-download:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .my-cert-download svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 2.5;
    fill: none;
  }

  .my-cert-back {
    padding: 0.875rem 2rem;
    background: transparent;
    color: var(--gray-400);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 100px;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .my-cert-back:hover {
    border-color: rgba(255, 255, 255, 0.25);
    color: var(--gray-200);
  }

  /* Hidden certificate template */
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

  .cert-accent-left {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 18px;
    background: #EB0028;
  }

  .cert-accent-right {
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 18px;
    background: #EB0028;
  }

  .cert-top-line {
    position: absolute;
    top: 0; left: 18px; right: 18px;
    height: 3px;
    background: #EB0028;
  }

  .cert-bottom-line {
    position: absolute;
    bottom: 0; left: 18px; right: 18px;
    height: 3px;
    background: #EB0028;
  }

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
    .my-cert-header h1 {
      font-size: 1.75rem;
    }

    .my-cert-scanner-section {
      padding: 1.5rem;
    }

    .my-cert-actions {
      flex-direction: column;
    }

    .my-cert-download,
    .my-cert-back {
      justify-content: center;
      width: 100%;
    }

    .my-cert-scanner-actions {
      flex-direction: column;
    }

    .my-cert-btn {
      justify-content: center;
    }
  }
`;

export default function MyCertificatePage() {
  const { siteConfig } = useSiteData();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null); // { type: 'ticket'|'speaker', data, eligible: bool }
  const [qrUrl, setQrUrl] = useState('');

  // Camera state
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [cameraError, setCameraError] = useState('');

  const html5QrCodeRef = useRef(null);

  // Inject Google Fonts
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = googleFonts;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
      }
    };
  }, []);

  // Generate QR when result changes
  useEffect(() => {
    if (!result || !result.eligible) { setQrUrl(''); return; }
    
    const gen = async () => {
      const eventName = siteConfig.eventName || 'TEDxDutse';
      const eventYear = siteConfig.eventYear || 2026;
      const theme = siteConfig.theme || 'Roots and Wings';
      const eventDate = siteConfig.date || 'November 28, 2026';
      const venue = siteConfig.venueShort || siteConfig.venue || 'Dutse, Jigawa State';

      let data;
      if (result.type === 'ticket') {
        data = {
          event: `${eventName} ${eventYear}`,
          theme,
          date: eventDate,
          venue,
          organizer: eventName,
          contact: siteConfig.contactEmail || 'info@tedxdutse.com',
          recipient: result.data.name,
          email: result.data.email,
          phone: result.data.phone || '',
          tier: result.data.tier,
          reference: result.data.reference,
          type: 'Certificate of Attendance',
          category: 'Attendee',
          verified: true
        };
      } else {
        data = {
          event: `${eventName} ${eventYear}`,
          theme,
          date: eventDate,
          venue,
          organizer: eventName,
          contact: siteConfig.contactEmail || 'info@tedxdutse.com',
          recipient: result.data.name,
          role: 'Speaker',
          talk: result.data.title || '',
          type: 'Certificate of Appreciation',
          category: 'Speaker',
          verified: true
        };
      }

      try {
        const url = await QRCode.toDataURL(JSON.stringify(data), {
          width: 240, margin: 1,
          color: { dark: '#1A1A1A', light: '#FFFFFF' }
        });
        setQrUrl(url);
      } catch (err) { console.error('QR error:', err); }
    };
    gen();
  }, [result, siteConfig]);

  const startScanning = async (cameraId = '') => {
    setCameraError('');
    setIsScanning(true);

    // Stop any existing scanner
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) { console.warn(e); }
    }

    const scanner = new Html5Qrcode("my-cert-scanner");
    html5QrCodeRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: (width, height) => {
        const minSize = Math.min(width, height);
        const qrSize = Math.floor(minSize * 0.7);
        return { width: qrSize, height: qrSize };
      }
    };

    const targetCamera = cameraId ? cameraId : { facingMode: "environment" };

    try {
      await scanner.start(
        targetCamera,
        config,
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {} // ignore frame errors
      );

      // Fetch cameras
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          if (!cameraId) {
            const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          } else {
            setSelectedCameraId(cameraId);
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve cameras", err);
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError("Camera access denied. Please allow camera permissions in your browser settings.");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) { console.error(e); }
    }
    setIsScanning(false);
  };

  const handleScan = (decodedText) => {
    stopScanning();
    let reference = decodedText;

    try {
      const data = JSON.parse(decodedText);
      reference = data.reference || decodedText;
    } catch {
      // raw text — use as-is
    }

    lookupCertificate(reference);
  };

  const lookupCertificate = async (reference) => {
    setLoading(true);
    setResult(null);

    try {
      // First try: look up as ticket
      const allTickets = await ticketsAPI.getAll();
      const ticket = allTickets.find(t =>
        t.reference === reference ||
        t.name.toLowerCase() === reference.toLowerCase() ||
        t.email.toLowerCase() === reference.toLowerCase()
      );

      if (ticket) {
        const isVVIP = ticket.tier?.toLowerCase() === 'vvip';
        const isCheckedIn = ticket.checked_in || ticket.status === 'used';

        setResult({
          type: 'ticket',
          data: ticket,
          eligible: isVVIP && isCheckedIn
        });
        setLoading(false);
        return;
      }

      // Second try: look up as speaker
      const speakers = await speakersAPI.getAll();
      const speaker = speakers.find(s =>
        s.name.toLowerCase() === reference.toLowerCase() ||
        (s.title && s.title.toLowerCase() === reference.toLowerCase())
      );

      if (speaker) {
        setResult({
          type: 'speaker',
          data: speaker,
          eligible: true
        });
        setLoading(false);
        return;
      }

      // Not found at all
      setResult({
        type: 'not-found',
        data: null,
        eligible: false
      });
    } catch (err) {
      console.error('Lookup error:', err);
      setResult({ type: 'error', data: null, eligible: false });
    }

    setLoading(false);
  };

  const generatePDF = async () => {
    if (!result || !result.eligible) return;
    setGenerating(true);

    try {
      const el = document.getElementById('my-cert-template');
      if (!el) { setGenerating(false); return; }

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

      const name = result.data.name.replace(/\s+/g, '_');
      const suffix = result.type === 'speaker' ? 'Speaker' : 'Attendance';
      pdf.save(`TEDxDutse-Certificate-${suffix}-${name}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    }

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
    <Layout>
      <style>{styles}</style>
      <div className="my-cert-page">
        <div className="my-cert-container">
          {/* Header */}
          <div className="my-cert-header">
            <h1>My <span>Certificate</span></h1>
            <p>
              Scan your ticket QR code to retrieve your certificate.
              Available for VVIP attendees and speakers.
            </p>
          </div>

          {/* Scanner Section */}
          {!result && !loading && (
            <div className="my-cert-scanner-section">
              <h2>Scan Your Ticket</h2>
              <p>Point your camera at the QR code on your ticket to verify your eligibility</p>

              <div id="my-cert-scanner" className="my-cert-qr-scanner" style={{ display: isScanning ? 'block' : 'none' }} />

              {!isScanning && (
                <div className="my-cert-scanner-actions">
                  <button className="my-cert-btn" onClick={() => startScanning()}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Open Camera
                  </button>
                </div>
              )}

              {isScanning && (
                <div className="my-cert-scanner-actions">
                  <button className="my-cert-btn secondary" onClick={stopScanning}>
                    Stop Camera
                  </button>
                </div>
              )}

              {isScanning && cameras.length > 1 && (
                <div className="my-cert-camera-select">
                  <select
                    value={selectedCameraId}
                    onChange={(e) => {
                      setSelectedCameraId(e.target.value);
                      startScanning(e.target.value);
                    }}
                  >
                    {cameras.map(cam => (
                      <option key={cam.id} value={cam.id}>{cam.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {cameraError && (
                <div className="my-cert-scanner-error">
                  <p>{cameraError}</p>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="my-cert-loading">
              <div className="my-cert-spinner" />
              <p>Verifying your ticket...</p>
            </div>
          )}

          {/* Result: Eligible */}
          {result && result.eligible && (
            <div className="my-cert-result">
              <div className="my-cert-result-icon">✓</div>
              <h3>Certificate Found</h3>
              <p className="cert-owner">{result.data.name}</p>
              <p className="cert-meta">
                {result.type === 'ticket'
                  ? `${result.data.tier} Ticket — ${result.data.reference}`
                  : `Speaker${result.data.title ? ` — "${result.data.title}"` : ''}`
                }
              </p>
              <div className="my-cert-actions">
                <button
                  className="my-cert-download"
                  onClick={generatePDF}
                  disabled={generating}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {generating ? 'Generating PDF...' : 'Download PDF'}
                </button>
                <button className="my-cert-back" onClick={handleReset}>
                  Scan Another
                </button>
              </div>
            </div>
          )}

          {/* Result: Not Eligible (found but not VVIP/speaker) */}
          {result && !result.eligible && result.type === 'ticket' && (
            <div className="my-cert-result">
              <div className="my-cert-result-icon error">✗</div>
              <h3>Certificate Not Available</h3>
              <p className="cert-owner">{result.data.name}</p>
              <p className="cert-meta">{result.data.tier} Ticket — {result.data.reference}</p>
              <p className="cert-error-msg">
                Self-service certificates are currently available only for <strong>VVIP ticket holders</strong> who checked in at the event.
                <br /><br />
                If you believe you should have access to a certificate, please contact the organisers at{' '}
                <a href={`mailto:${siteConfig.contactEmail || 'info@tedxdutse.com'}`}>
                  {siteConfig.contactEmail || 'info@tedxdutse.com'}
                </a>
              </p>
              <div className="my-cert-actions">
                <button className="my-cert-back" onClick={handleReset}>
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Result: Not Found */}
          {result && result.type === 'not-found' && (
            <div className="my-cert-result">
              <div className="my-cert-result-icon error">?</div>
              <h3>Ticket Not Found</h3>
              <p className="cert-error-msg">
                We couldn't find a ticket or speaker record matching your scan.
                <br /><br />
                Please make sure you're scanning the correct QR code from your TEDxDutse ticket.
                If you believe this is an error, contact the organisers at{' '}
                <a href={`mailto:${siteConfig.contactEmail || 'info@tedxdutse.com'}`}>
                  {siteConfig.contactEmail || 'info@tedxdutse.com'}
                </a>
              </p>
              <div className="my-cert-actions">
                <button className="my-cert-back" onClick={handleReset}>
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Result: Error */}
          {result && result.type === 'error' && (
            <div className="my-cert-result">
              <div className="my-cert-result-icon error">!</div>
              <h3>Something Went Wrong</h3>
              <p className="cert-error-msg">
                An error occurred while looking up your certificate. Please try again or contact{' '}
                <a href={`mailto:${siteConfig.contactEmail || 'info@tedxdutse.com'}`}>
                  {siteConfig.contactEmail || 'info@tedxdutse.com'}
                </a>
              </p>
              <div className="my-cert-actions">
                <button className="my-cert-back" onClick={handleReset}>
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden template for PDF generation */}
      {result && result.eligible && (
        <div className="cert-template-wrapper">
          <div id="my-cert-template" className="cert-template">
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
              <div className="cert-type">
                {result.type === 'speaker' ? 'Certificate of Appreciation' : 'Certificate of Attendance'}
              </div>
              <div className="cert-presented">This is proudly presented to</div>
              <div className="cert-recipient">{result.data.name.toUpperCase()}</div>
              <div className="cert-recipient-line" />
              <div className="cert-description">
                {result.type === 'speaker' ? (
                  <>
                    In grateful recognition of your invaluable contribution as a speaker at {eventName} {eventYear},
                    themed &ldquo;{theme}&rdquo;, held on {eventDate} at {venue}.
                    {result.data.title && <> Your talk &ldquo;{result.data.title}&rdquo; inspired our audience.</>}
                    {' '}Your ideas, passion, and commitment have enriched the spirit of ideas worth sharing.
                  </>
                ) : (
                  <>
                    In recognition of their attendance at {eventName} {eventYear}, themed &ldquo;{theme}&rdquo;,
                    held on {eventDate} at {venue}.
                    Your presence contributed to the spread of ideas worth sharing, in the spirit of TEDx.
                  </>
                )}
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
                  <div className="cert-footer-label">{result.type === 'speaker' ? 'Role' : 'Reference'}</div>
                  <div className="cert-footer-value">{result.type === 'speaker' ? 'Speaker' : result.data.reference}</div>
                </div>
              </div>
            </div>
            {qrUrl && (
              <>
                <div className="cert-qr-code">
                  <img src={qrUrl} alt="Verification QR" />
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
        </div>
      )}
    </Layout>
  );
}
