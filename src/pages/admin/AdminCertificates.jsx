import { useState, useEffect, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import AdminLayout from './AdminLayout';
import { useSiteData } from '../../context/SiteDataContext';
import { ticketsAPI } from '../../lib/supabase';

const styles = `
  .admin-certs-page {
    max-width: 1100px;
  }

  .admin-certs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .admin-certs-header h1 {
    color: var(--white);
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.25rem;
    letter-spacing: -0.02em;
  }

  .admin-certs-header p {
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

  .btn-bulk:hover:not(:disabled) {
    background: var(--ted-red-dark);
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
    border-color: var(--ted-red);
    color: var(--ted-red);
  }

  /* Stats bar */
  .cert-stats-bar {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .cert-stat {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    padding: 1rem 1.5rem;
    flex: 1;
    min-width: 150px;
  }

  .cert-stat-label {
    color: var(--gray-500);
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 0.25rem;
  }

  .cert-stat-value {
    color: var(--white);
    font-size: 1.5rem;
    font-weight: 900;
    margin: 0;
  }

  .cert-stat-value.green { color: #86EFAC; }

  /* Attendee list */
  .cert-attendees-section {
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 28px;
    padding: 2rem;
  }

  .cert-attendees-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .cert-attendees-header h2 {
    color: var(--white);
    font-size: 1.375rem;
    font-weight: 800;
    margin: 0;
  }

  .cert-search-input {
    padding: 0.625rem 1.25rem;
    background: var(--black);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    color: var(--white);
    font-size: 0.8125rem;
    width: 260px;
    transition: all 0.3s ease;
  }

  .cert-search-input:focus {
    outline: none;
    border-color: var(--ted-red);
  }

  .cert-search-input::placeholder {
    color: var(--gray-600);
  }

  /* Table */
  .cert-table-wrapper {
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .cert-table {
    width: 100%;
    border-collapse: collapse;
  }

  .cert-table thead {
    background: rgba(255, 255, 255, 0.02);
  }

  .cert-table th {
    padding: 1rem 1.25rem;
    text-align: left;
    color: var(--gray-400);
    font-weight: 700;
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .cert-table td {
    padding: 0.875rem 1.25rem;
    color: var(--gray-300);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    font-size: 0.875rem;
  }

  .cert-table tr:hover {
    background: rgba(255, 255, 255, 0.01);
  }

  .cert-table tr:last-child td {
    border-bottom: none;
  }

  .cert-table .name-cell {
    font-weight: 700;
    color: var(--white);
    text-transform: uppercase;
  }

  .cert-table .ref-cell {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: var(--gray-500);
  }

  .cert-table .tier-cell {
    font-weight: 700;
  }

  .btn-gen {
    padding: 0.5rem 1rem;
    background: rgba(235, 0, 40, 0.1);
    color: var(--ted-red);
    border: 1px solid rgba(235, 0, 40, 0.2);
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
    background: var(--ted-red);
    color: white;
    border-color: var(--ted-red);
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

  /* Checkbox */
  .cert-checkbox {
    width: 18px;
    height: 18px;
    accent-color: var(--ted-red);
    cursor: pointer;
  }

  .selected-row {
    background: rgba(235, 0, 40, 0.04) !important;
  }

  .selected-row:hover {
    background: rgba(235, 0, 40, 0.07) !important;
  }

  /* VVIP Badge */
  .vvip-badge {
    display: inline-block;
    margin-left: 0.5rem;
    padding: 0.125rem 0.5rem;
    background: rgba(139, 92, 246, 0.12);
    color: #8B5CF6;
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 100px;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    vertical-align: middle;
  }

  /* Other Attendees Section */
  .cert-other-section {
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 28px;
    padding: 2rem;
    margin-top: 2rem;
  }

  .cert-other-header h2 {
    color: var(--white);
    font-size: 1.375rem;
    font-weight: 800;
    margin: 0 0 0.25rem;
  }

  .cert-section-subtitle {
    color: var(--gray-500);
    font-size: 0.8125rem;
    margin: 0.25rem 0 0;
    font-weight: 400;
  }

  .cert-other-desc {
    color: var(--gray-500);
    font-size: 0.875rem;
    margin: 0 0 1.25rem;
  }

  .cert-selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .cert-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: rgba(235, 0, 40, 0.08);
    color: var(--ted-red);
    border: 1px solid rgba(235, 0, 40, 0.15);
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .cert-tag-remove {
    background: none;
    border: none;
    color: var(--ted-red);
    font-size: 1rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    opacity: 0.7;
  }

  .cert-tag-remove:hover {
    opacity: 1;
  }

  .cert-dropdown-wrapper {
    position: relative;
  }

  .cert-dropdown-toggle {
    width: 100%;
    padding: 0.875rem 1.25rem;
    background: var(--black);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    color: var(--gray-400);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;
  }

  .cert-dropdown-toggle:hover {
    border-color: rgba(255, 255, 255, 0.15);
  }

  .cert-dropdown-panel {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: #1A1A1A;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    z-index: 100;
    max-height: 360px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  }

  .cert-dropdown-search {
    margin: 0.75rem;
    padding: 0.625rem 1rem;
    background: var(--black);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: var(--white);
    font-size: 0.8125rem;
    outline: none;
  }

  .cert-dropdown-search:focus {
    border-color: var(--ted-red);
  }

  .cert-dropdown-search::placeholder {
    color: var(--gray-600);
  }

  .cert-dropdown-list {
    overflow-y: auto;
    max-height: 280px;
    padding: 0.25rem 0 0.5rem;
  }

  .cert-dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .cert-dropdown-item:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .cert-dropdown-item.is-selected {
    background: rgba(235, 0, 40, 0.04);
  }

  .cert-dropdown-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .cert-dropdown-name {
    color: var(--white);
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cert-dropdown-meta {
    color: var(--gray-500);
    font-size: 0.6875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cert-dropdown-empty {
    padding: 1.5rem;
    text-align: center;
    color: var(--gray-500);
    font-size: 0.8125rem;
  }

  .empty-certs {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-certs h3 {
    color: var(--gray-300);
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
  }

  .empty-certs p {
    color: var(--gray-500);
    font-size: 0.9375rem;
    margin: 0;
  }

  /* Progress bar for bulk */
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
    background: var(--ted-red);
    border-radius: 100px;
    transition: width 0.3s ease;
  }

  /* Preview modal */
  .cert-preview-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
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
    background: rgba(235, 0, 40, 0.3);
    border-color: var(--ted-red);
  }

  .cert-preview-scale {
    transform: scale(0.65);
    transform-origin: top left;
  }

  /* Certificate Template */
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
    left: 0;
    top: 0;
    bottom: 0;
    width: 18px;
    background: #EB0028;
  }

  .cert-accent-right {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 18px;
    background: #EB0028;
  }

  .cert-top-line {
    position: absolute;
    top: 0;
    left: 18px;
    right: 18px;
    height: 3px;
    background: #EB0028;
  }

  .cert-bottom-line {
    position: absolute;
    bottom: 0;
    left: 18px;
    right: 18px;
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

  .cert-qr-code {
    position: absolute;
    bottom: 45px;
    right: 55px;
    width: 90px;
    height: 90px;
    z-index: 5;
  }

  .cert-qr-code img {
    width: 100%;
    height: 100%;
    display: block;
  }

  .cert-qr-label {
    position: absolute;
    bottom: 30px;
    right: 55px;
    font-family: 'Inter', sans-serif;
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
    .cert-attendees-header {
      flex-direction: column;
      align-items: stretch;
    }

    .cert-search-input {
      width: 100%;
    }
  }
`;

function CertificateTemplate({ ticket, siteConfig, qrUrl }) {
  const eventName = siteConfig.eventName || 'TEDxDutse';
  const eventYear = siteConfig.eventYear || 2026;
  const theme = siteConfig.theme || 'Roots and Wings';
  const eventDate = siteConfig.date || 'November 28, 2026';
  const venue = siteConfig.venueShort || siteConfig.venue || 'Dutse, Jigawa State';

  return (
    <div className="cert-template">
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
          In recognition of their attendance at {eventName} {eventYear}, themed &ldquo;{theme}&rdquo;,
          held on {eventDate} at {venue}.
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
  );
}

export default function AdminCertificates() {
  const { siteConfig } = useSiteData();
  const [checkedInTickets, setCheckedInTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [generating, setGenerating] = useState('');
  const [bulkProgress, setBulkProgress] = useState(null); // { current, total }
  const [previewTicket, setPreviewTicket] = useState(null);
  const [qrUrls, setQrUrls] = useState({});
  const [otherSelected, setOtherSelected] = useState(new Set());
  const [otherDropdownOpen, setOtherDropdownOpen] = useState(false);
  const [otherSearch, setOtherSearch] = useState('');
  const templateRef = useRef({});

  const fetchCheckedIn = useCallback(async () => {
    const allTickets = await ticketsAPI.getAll();
    const checkedIn = allTickets.filter(t => t.checked_in || t.status === 'used');
    setCheckedInTickets(checkedIn);
  }, []);

  useEffect(() => {
    fetchCheckedIn();
    const handler = () => fetchCheckedIn();
    window.addEventListener('tickets-changed', handler);
    return () => window.removeEventListener('tickets-changed', handler);
  }, [fetchCheckedIn]);

  useEffect(() => {
    const gen = async () => {
      const newUrls = {};
      for (const ticket of checkedInTickets) {
        if (qrUrls[ticket.reference]) continue;
        try {
          const data = JSON.stringify({
            event: `${siteConfig.eventName || 'TEDxDutse'} ${siteConfig.eventYear || 2026}`,
            theme: siteConfig.theme || 'Roots and Wings',
            date: siteConfig.date || 'November 28, 2026',
            venue: siteConfig.venueShort || siteConfig.venue || 'Dutse, Jigawa State',
            organizer: siteConfig.eventName || 'TEDxDutse',
            contact: siteConfig.contactEmail || 'info@tedxdutse.com',
            recipient: ticket.name,
            email: ticket.email,
            phone: ticket.phone || '',
            tier: ticket.tier,
            reference: ticket.reference,
            type: 'Certificate of Attendance',
            category: 'Attendee',
            verified: true
          });
          const url = await QRCode.toDataURL(data, { width: 200, margin: 1, color: { dark: '#1A1A1A', light: '#FFFFFF' } });
          newUrls[ticket.reference] = url;
        } catch (err) { console.error('QR error:', err); }
      }
      if (Object.keys(newUrls).length > 0) setQrUrls(prev => ({ ...prev, ...newUrls }));
    };
    gen();
  }, [checkedInTickets, siteConfig]);

  // Split into VVIP (auto-eligible) and others (manual selection)
  const vvipTickets = checkedInTickets.filter(t => t.tier?.toLowerCase() === 'vvip');
  const otherTickets = checkedInTickets.filter(t => t.tier?.toLowerCase() !== 'vvip');

  const filtered = vvipTickets.filter(t => {
    const term = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.email.toLowerCase().includes(term) ||
      t.reference.toLowerCase().includes(term)
    );
  });

  const vvipCount = vvipTickets.length;

  const generatePDF = async (ticket) => {
    setGenerating(ticket.reference);
    try {
      const el = document.getElementById(`admin-cert-${ticket.reference}`);
      if (!el) { setGenerating(''); return; }

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

  const toggleOtherSelect = (ref) => {
    setOtherSelected(prev => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  };

  const filteredOther = otherTickets.filter(t => {
    const term = otherSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.email.toLowerCase().includes(term) ||
      t.reference.toLowerCase().includes(term)
    );
  });

  const generateOtherSelected = async () => {
    const selected = otherTickets.filter(t => otherSelected.has(t.reference));
    if (selected.length === 0) return;
    setBulkProgress({ current: 0, total: selected.length });

    for (let i = 0; i < selected.length; i++) {
      const ticket = selected[i];
      setBulkProgress({ current: i + 1, total: selected.length });
      try {
        const el = document.getElementById(`admin-cert-${ticket.reference}`);
        if (!el) continue;
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`TEDxDutse-Certificate-${ticket.name.replace(/\s+/g, '_')}.pdf`);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Failed for ${ticket.name}:`, err);
      }
    }
    setBulkProgress(null);
    setOtherSelected(new Set());
    setOtherDropdownOpen(false);
  };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="admin-certs-page">
        {/* Header */}
        <div className="admin-certs-header">
          <div>
            <h1>Certificates</h1>
            <p>Manage and generate attendance certificates</p>
          </div>
          <button
            className="btn-preview"
            onClick={() => setPreviewTicket(vvipTickets[0] || otherTickets[0] || { name: 'Sample Attendee', reference: 'TEDX0000000000', tier: 'VVIP' })}
          >
            Preview Template
          </button>
        </div>

        {/* Stats */}
        <div className="cert-stats-bar">
          <div className="cert-stat">
            <p className="cert-stat-label">Total Checked In</p>
            <p className="cert-stat-value green">{checkedInTickets.length}</p>
          </div>
          <div className="cert-stat">
            <p className="cert-stat-label">VVIP (Auto-Eligible)</p>
            <p className="cert-stat-value">{vvipCount}</p>
          </div>
          <div className="cert-stat">
            <p className="cert-stat-label">Other Tiers</p>
            <p className="cert-stat-value">{otherTickets.length}</p>
          </div>
        </div>

        {/* Bulk progress */}
        {bulkProgress && (
          <div className="bulk-progress">
            <div className="bulk-progress-header">
              <span>Generating certificates...</span>
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

        {/* VVIP Attendee List */}
        <div className="cert-attendees-section">
          <div className="cert-attendees-header">
            <div>
              <h2>VVIP Attendees</h2>
              <p className="cert-section-subtitle">Auto-eligible — certificates can be generated individually or all at once</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="cert-search-input"
                placeholder="Search VVIP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {filtered.length > 0 && (
                <button
                  className="btn-bulk"
                  onClick={async () => {
                    setBulkProgress({ current: 0, total: filtered.length });
                    for (let i = 0; i < filtered.length; i++) {
                      const ticket = filtered[i];
                      setBulkProgress({ current: i + 1, total: filtered.length });
                      try {
                        const el = document.getElementById(`admin-cert-${ticket.reference}`);
                        if (!el) continue;
                        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
                        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                        pdf.save(`TEDxDutse-Certificate-${ticket.name.replace(/\s+/g, '_')}.pdf`);
                        await new Promise(resolve => setTimeout(resolve, 500));
                      } catch (err) { console.error(`Failed for ${ticket.name}:`, err); }
                    }
                    setBulkProgress(null);
                  }}
                  disabled={bulkProgress}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Generate All ({filtered.length})
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-certs">
              <h3>{searchTerm ? 'No VVIP results found' : 'No VVIP checked-in attendees yet'}</h3>
              <p>{searchTerm ? 'Try a different search term' : 'VVIP certificates will appear here once they check in'}</p>
            </div>
          ) : (
            <div className="cert-table-wrapper">
              <table className="cert-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Reference</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ticket) => (
                    <tr key={ticket.reference}>
                      <td className="name-cell">{ticket.name}</td>
                      <td>{ticket.email}</td>
                      <td className="ref-cell">{ticket.reference}</td>
                      <td>
                        <button
                          className="btn-gen"
                          onClick={() => generatePDF(ticket)}
                          disabled={generating === ticket.reference}
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {generating === ticket.reference ? 'Generating...' : 'Generate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Issue to Other Attendees (non-VVIP) */}
        {otherTickets.length > 0 && (
          <div className="cert-other-section">
            <div className="cert-other-header">
              <h2>Issue to Other Attendees</h2>
              <p className="cert-other-desc">Manually select non-VVIP attendees to issue certificates</p>
            </div>

            {/* Selected tags */}
            {otherSelected.size > 0 && (
              <div className="cert-selected-tags">
                {otherTickets.filter(t => otherSelected.has(t.reference)).map(t => (
                  <span key={t.reference} className="cert-tag">
                    {t.name} ({t.tier})
                    <button className="cert-tag-remove" onClick={() => toggleOtherSelect(t.reference)}>×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Dropdown */}
            <div className="cert-dropdown-wrapper">
              <button
                className="cert-dropdown-toggle"
                onClick={() => setOtherDropdownOpen(!otherDropdownOpen)}
              >
                <span>
                  {otherSelected.size > 0
                    ? `${otherSelected.size} attendee${otherSelected.size !== 1 ? 's' : ''} selected`
                    : 'Select attendees to issue certificates...'}
                </span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points={otherDropdownOpen ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                </svg>
              </button>

              {otherDropdownOpen && (
                <div className="cert-dropdown-panel">
                  <input
                    type="text"
                    className="cert-dropdown-search"
                    placeholder="Search by name, email, or reference..."
                    value={otherSearch}
                    onChange={(e) => setOtherSearch(e.target.value)}
                    autoFocus
                  />
                  <div className="cert-dropdown-list">
                    {filteredOther.length === 0 ? (
                      <div className="cert-dropdown-empty">No matching attendees</div>
                    ) : (
                      filteredOther.map(ticket => (
                        <label key={ticket.reference} className={`cert-dropdown-item ${otherSelected.has(ticket.reference) ? 'is-selected' : ''}`}>
                          <input
                            type="checkbox"
                            className="cert-checkbox"
                            checked={otherSelected.has(ticket.reference)}
                            onChange={() => toggleOtherSelect(ticket.reference)}
                          />
                          <div className="cert-dropdown-info">
                            <span className="cert-dropdown-name">{ticket.name}</span>
                            <span className="cert-dropdown-meta">{ticket.email} · {ticket.tier} · {ticket.reference}</span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {otherSelected.size > 0 && (
              <button
                className="btn-bulk"
                onClick={generateOtherSelected}
                disabled={bulkProgress}
                style={{ marginTop: '1rem' }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Generate for {otherSelected.size} Attendee{otherSelected.size !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hidden templates for PDF generation */}
      <div className="cert-template-wrapper">
        {checkedInTickets.map((ticket) => (
          <div key={ticket.reference} id={`admin-cert-${ticket.reference}`}>
            <CertificateTemplate ticket={ticket} siteConfig={siteConfig} qrUrl={qrUrls[ticket.reference]} />
          </div>
        ))}
      </div>

      {/* Preview modal */}
      {previewTicket && (
        <div className="cert-preview-overlay" onClick={() => setPreviewTicket(null)}>
          <button className="cert-preview-close" onClick={() => setPreviewTicket(null)}>×</button>
          <div className="cert-preview-container" onClick={e => e.stopPropagation()}>
            <div className="cert-preview-scale">
              <CertificateTemplate ticket={previewTicket} siteConfig={siteConfig} qrUrl={qrUrls[previewTicket.reference]} />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
