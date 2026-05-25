import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../pages/admin/AdminLayout';
import { ticketsAPI } from '../../lib/supabase';
import { useSiteData } from '../../context/SiteDataContext';

const styles = `
  .scanner-page {
    min-height: calc(100vh - 80px);
    background: radial-gradient(circle at 50% 50%, rgba(235, 0, 40, 0.03) 0%, var(--black) 90%);
    padding: 3rem 2rem;
  }

  .scanner-container {
    max-width: 800px;
    margin: 0 auto;
  }

  /* Header */
  .scanner-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    gap: 1.5rem;
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

  .scanner-title h1 {
    color: var(--white);
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .scanner-title p {
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

  /* Scanner Card */
  .scanner-card {
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 32px;
    padding: 3rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(20px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Viewfinder styling */
  .scanner-viewfinder-container {
    width: 100%;
    max-width: 380px;
    aspect-ratio: 1;
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    background: #000;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }

  #qr-scanner {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
  }

  #qr-scanner video {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    border-radius: 24px;
  }

  .scanner-laser {
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent 5%, var(--ted-red) 50%, transparent 95%);
    box-shadow: 0 0 10px var(--ted-red);
    animation: laser-bounce 2s ease-in-out infinite;
    z-index: 10;
    pointer-events: none;
  }

  @keyframes laser-bounce {
    0%, 100% { top: 10%; }
    50% { top: 90%; }
  }

  .scanner-overlay {
    position: absolute;
    inset: 0;
    border: 35px solid rgba(0, 0, 0, 0.55);
    z-index: 5;
    pointer-events: none;
  }

  .scanner-corner {
    position: absolute;
    width: 24px;
    height: 24px;
    border-color: var(--ted-red);
    border-style: solid;
    z-index: 6;
    pointer-events: none;
  }

  .corner-tl { top: 34px; left: 34px; border-width: 4px 0 0 4px; border-top-left-radius: 8px; }
  .corner-tr { top: 34px; right: 34px; border-width: 4px 4px 0 0; border-top-right-radius: 8px; }
  .corner-bl { bottom: 34px; left: 34px; border-width: 0 0 4px 4px; border-bottom-left-radius: 8px; }
  .corner-br { bottom: 34px; right: 34px; border-width: 0 4px 4px 0; border-bottom-right-radius: 8px; }

  /* Device Controls */
  .scanner-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    width: 100%;
    margin-top: 2rem;
  }

  .camera-select {
    padding: 0.875rem 1.5rem;
    background: rgba(0, 0, 0, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    color: var(--white);
    font-size: 0.875rem;
    font-weight: 600;
    max-width: 320px;
    width: 100%;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .camera-select:focus {
    outline: none;
    border-color: var(--ted-red);
  }

  .btn-scanner-toggle {
    padding: 1rem 2.5rem;
    border-radius: 100px;
    font-size: 0.9375rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .btn-scanner-start {
    background: var(--ted-red);
    color: var(--white);
    box-shadow: 0 10px 25px rgba(235, 0, 40, 0.3);
  }

  .btn-scanner-start:hover {
    background: var(--ted-red-dark);
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(235, 0, 40, 0.45);
  }

  .btn-scanner-stop {
    background: rgba(255, 255, 255, 0.05);
    color: var(--white);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .btn-scanner-stop:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.2);
    color: #EF4444;
  }

  .scanner-error-msg {
    color: #F87171;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.15);
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    margin-top: 1.5rem;
    text-align: center;
    max-width: 400px;
  }

  /* Manual Entry Container */
  .manual-entry {
    margin-top: 3rem;
    padding-top: 2.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    width: 100%;
    text-align: center;
  }

  .manual-entry h3 {
    color: var(--gray-400);
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 1.5rem;
  }

  .manual-form {
    display: flex;
    gap: 0.75rem;
    max-width: 450px;
    margin: 0 auto;
  }

  .manual-form input {
    flex: 1;
    padding: 0.875rem 1.5rem;
    background: rgba(0, 0, 0, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    color: var(--white);
    font-size: 0.9375rem;
    transition: all 0.3s ease;
  }

  .manual-form input::placeholder {
    color: var(--gray-600);
  }

  .manual-form input:focus {
    outline: none;
    border-color: var(--ted-red);
    box-shadow: 0 0 15px rgba(235, 0, 40, 0.1);
  }

  .btn-verify {
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

  .btn-verify:hover {
    background: #C41E3A;
    transform: translateY(-1px);
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

  /* Empty state/Activate view */
  .activate-container {
    text-align: center;
    padding: 3rem 0;
  }

  .activate-icon {
    font-size: 4rem;
    color: rgba(255, 255, 255, 0.1);
    margin-bottom: 1.5rem;
  }

  .activate-container h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--white);
    margin-bottom: 0.5rem;
  }

  .activate-container p {
    color: var(--gray-400);
    max-width: 320px;
    margin: 0 auto 2rem;
    font-size: 0.9375rem;
  }

  @media (max-width: 768px) {
    .scanner-page {
      padding: 2rem 1.5rem;
    }

    .scanner-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1.25rem;
    }

    .scanner-header-left {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .scanner-card {
      padding: 2rem 1.5rem;
      border-radius: 24px;
    }

    .manual-form {
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

export default function TicketScanner() {
  const navigate = useNavigate();
  const { siteConfig } = useSiteData();
  const [result, setResult] = useState(null);
  const [manualRef, setManualRef] = useState('');
  const [btnState, setBtnState] = useState('idle'); // 'idle' | 'loading' | 'success'
  
  // Camera State
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [cameraError, setCameraError] = useState('');

  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    // Cleanup scanning on component unmount
    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch((e) => console.warn(e));
        }
      }
    };
  }, []);

  const startScanning = async (cameraId = '') => {
    setCameraError('');
    setIsScanning(true);

    // Stop any existing scanner
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn(e);
      }
    }

    const scanner = new Html5Qrcode("qr-scanner");
    html5QrCodeRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: (width, height) => {
        const minSize = Math.min(width, height);
        const qrSize = Math.floor(minSize * 0.7);
        return { width: qrSize, height: qrSize };
      }
    };

    // Use environment camera by default if no cameraId specified
    const targetCamera = cameraId ? cameraId : { facingMode: "environment" };

    try {
      await scanner.start(
        targetCamera,
        config,
        (decodedText) => {
          handleScan(decodedText);
        },
        (errorMessage) => {
          // Verbose frame decoding errors - safe to ignore
        }
      );

      // Once successfully started, fetch list of cameras to populate dropdown
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          // If starting for the first time, auto-select current camera ID
          if (!cameraId) {
            const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          } else {
            setSelectedCameraId(cameraId);
          }
        }
      } catch (err) {
        console.warn("Failed to retrieve camera devices list", err);
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError("Camera access denied or device is already in use. Please check browser permissions or enter reference manually.");
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
      } catch (e) {
        console.error("Error stopping scanner stream", e);
      }
    }
    html5QrCodeRef.current = null;
    setIsScanning(false);
  };

  const handleScan = (decodedText) => {
    // Stop the video stream immediately to lock in result and save battery
    stopScanning();
    try {
      const data = JSON.parse(decodedText);
      verifyTicket(data.reference);
    } catch (error) {
      // Fallback to raw text scan
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

        window.dispatchEvent(new Event('tickets-changed'));
      } else {
        setBtnState('idle');
      }
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      setBtnState('idle');
    }
  };

  const resetScanner = () => {
    setResult(null);
    setManualRef('');
    // Wait for React to re-render scanner card before creating new scanner
    setTimeout(() => startScanning(selectedCameraId), 150);
  };

  const handleCameraChange = (e) => {
    const cameraId = e.target.value;
    setSelectedCameraId(cameraId);
    if (isScanning) {
      startScanning(cameraId);
    }
  };

  return (
    <AdminLayout>
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
                <h1>Check-In Scanner</h1>
                <p>Verify QR tickets and manage door check-ins</p>
              </div>
            </div>
            <div className="user-badge">
              <div className="user-avatar">A</div>
              <div className="user-info">
                <p className="user-name">Admin</p>
                <p className="user-role">Door Agent</p>
              </div>
            </div>
          </div>

          {!result && (
            <div className="scanner-card">
              {/* Viewfinder is always mounted to avoid DOM race conditions during camera open */}
              <div 
                className="scanner-viewfinder-container"
                style={{ display: isScanning ? 'block' : 'none', position: 'relative', width: '100%', maxWidth: '380px', margin: '0 auto' }}
              >
                <div id="qr-scanner"></div>
                <div className="scanner-overlay"></div>
                <div className="scanner-laser"></div>
                <div className="scanner-corner corner-tl"></div>
                <div className="scanner-corner corner-tr"></div>
                <div className="scanner-corner corner-bl"></div>
                <div className="scanner-corner corner-br"></div>
              </div>

              {isScanning ? (
                <div className="scanner-controls">
                  {cameras.length > 1 && (
                    <select 
                      className="camera-select" 
                      value={selectedCameraId} 
                      onChange={handleCameraChange}
                    >
                      {cameras.map((camera) => (
                        <option key={camera.id} value={camera.id}>
                          {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
                        </option>
                      ))}
                    </select>
                  )}

                  <button 
                    onClick={stopScanning} 
                    className="btn-scanner-toggle btn-scanner-stop"
                  >
                    🛑 Close Camera
                  </button>
                </div>
              ) : (
                <div className="activate-container">
                  <div className="activate-icon">📷</div>
                  <h2>Camera Scanner Offline</h2>
                  <p>Request device permissions and activate video check-in stream</p>
                  
                  <button 
                    onClick={() => startScanning(selectedCameraId)} 
                    className="btn-scanner-toggle btn-scanner-start"
                  >
                    ⚡ Start Camera Scanner
                  </button>
                  
                  {cameraError && <div className="scanner-error-msg">{cameraError}</div>}
                </div>
              )}

              <div className="manual-entry">
                <h3>Or lookup reference:</h3>
                <form onSubmit={handleManualSubmit} className="manual-form">
                  <input
                    type="text"
                    placeholder="Enter reference (e.g. TEDX12345)..."
                    value={manualRef}
                    onChange={(e) => setManualRef(e.target.value)}
                  />
                  <button type="submit" className="btn-verify">
                    Verify
                  </button>
                </form>
              </div>
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
                    <button onClick={resetScanner} className="btn-action btn-secondary">
                      <svg viewBox="0 0 24 24">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      {result.status === 'success' && !result.justMarked ? 'Cancel & Rescan' : 'Scan Next Ticket'}
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
                    Try Scanning Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
