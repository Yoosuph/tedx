import { useState, useEffect } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import AdminLayout from './AdminLayout';

// Helper to convert "Saturday, November 28, 2026" to "2026-11-28"
function parseDateString(dateStr) {
  if (!dateStr) return '';
  // Try to parse the formatted date
  const match = dateStr.match(/(\w+),\s+(\w+)\s+(\d+),\s+(\d+)/);
  if (match) {
    const [, , month, day, year] = match;
    const months = {
      January: '01', February: '02', March: '03', April: '04',
      May: '05', June: '06', July: '07', August: '08',
      September: '09', October: '10', November: '11', December: '12'
    };
    return `${year}-${months[month]}-${day.padStart(2, '0')}`;
  }
  return '';
}

// Helper to convert "2026-11-28" to "Saturday, November 28, 2026"
function formatDateString(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput + 'T00:00:00');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Helper to convert "9:00 AM" to "09:00"
function parseTimeString(timeStr) {
  if (!timeStr) return '';
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let [, hours, minutes, period] = match;
    hours = parseInt(hours);
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }
  return '';
}

// Helper to convert "09:00" to "9:00 AM"
function formatTimeString(timeInput) {
  if (!timeInput) return '';
  const [hours, minutes] = timeInput.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export default function AdminSettings() {
  const { siteConfig, updateSiteConfig } = useSiteData();
  
  // Form state with proper date/time parsing
  const [form, setForm] = useState({
    ...siteConfig,
    dateInput: parseDateString(siteConfig.date),
    timeStartInput: parseTimeString(siteConfig.time?.split('–')[0]?.trim()),
    timeEndInput: parseTimeString(siteConfig.time?.split('–')[1]?.trim()),
  });
  
  const [saved, setSaved] = useState(false);

  // Sync form when siteConfig changes (e.g., from another tab or reset)
  useEffect(() => {
    setForm({
      ...siteConfig,
      dateInput: parseDateString(siteConfig.date),
      timeStartInput: parseTimeString(siteConfig.time?.split('–')[0]?.trim()),
      timeEndInput: parseTimeString(siteConfig.time?.split('–')[1]?.trim()),
    });
  }, [siteConfig]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleDateChange = (value) => {
    const formattedDate = formatDateString(value);
    setForm(prev => ({ ...prev, dateInput: value, date: formattedDate }));
    setSaved(false);
  };

  const handleTimeChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Rebuild the time string
      const startTime = formatTimeString(updated.timeStartInput);
      const endTime = formatTimeString(updated.timeEndInput);
      if (startTime && endTime) {
        updated.time = `${startTime} – ${endTime}`;
      } else if (startTime) {
        updated.time = startTime;
      } else if (endTime) {
        updated.time = `– ${endTime}`;
      } else {
        updated.time = '';
      }
      return updated;
    });
    setSaved(false);
  };

  const handleContactChange = (field, value) => {
    setForm(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
    setSaved(false);
  };

  const handleSocialChange = (field, value) => {
    setForm(prev => ({ ...prev, social: { ...prev.social, [field]: value } }));
    setSaved(false);
  };

  const handleSave = () => {
    // Remove temporary input fields before saving
    const { dateInput, timeStartInput, timeEndInput, ...configToSave } = form;
    updateSiteConfig(configToSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <style>{`
        .settings-page { max-width: 800px; }
        .settings-section {
          background: var(--dark-surface);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .settings-section h3 {
          color: var(--white);
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .form-row.full { grid-template-columns: 1fr; }
        .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
        .form-group label {
          color: var(--gray-400);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .form-group input, .form-group textarea, .form-group select {
          padding: 0.625rem 0.875rem;
          background: var(--dark);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: var(--white);
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
          outline: none;
          border-color: var(--ted-red);
        }
        .form-group textarea { resize: vertical; min-height: 80px; font-family: inherit; }
        .form-group input[type="date"],
        .form-group input[type="time"] {
          color-scheme: dark;
        }
        .save-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .btn-save {
          padding: 0.75rem 2rem;
          background: var(--ted-red);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-save:hover { background: #C41E3A; transform: translateY(-1px); }
        .save-msg {
          color: #86EFAC;
          font-size: 0.875rem;
          font-weight: 600;
          opacity: ${saved ? 1 : 0};
          transition: opacity 0.3s;
        }
        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="settings-page">
        <h2 style={{ color: 'var(--white)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Site Settings</h2>
        <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', margin: '0 0 2rem' }}>Configure your event details, contact info, and social links.</p>

        <div className="settings-section">
          <h3>Event Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Event Name</label>
              <input value={form.eventName} onChange={e => handleChange('eventName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Event Year</label>
              <input type="number" value={form.eventYear} onChange={e => handleChange('eventYear', Number(e.target.value))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Theme</label>
              <input value={form.theme} onChange={e => handleChange('theme', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tagline</label>
              <input value={form.tagline} onChange={e => handleChange('tagline', e.target.value)} />
            </div>
          </div>
          <div className="form-row full">
            <div className="form-group">
              <label>Subtitle</label>
              <input value={form.subtitle} onChange={e => handleChange('subtitle', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                value={form.dateInput} 
                onChange={e => handleDateChange(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="time" 
                  value={form.timeStartInput} 
                  onChange={e => handleTimeChange('timeStartInput', e.target.value)}
                  style={{ flex: 1 }}
                />
                <span style={{ color: 'var(--gray-500)' }}>to</span>
                <input 
                  type="time" 
                  value={form.timeEndInput} 
                  onChange={e => handleTimeChange('timeEndInput', e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>
          <div className="form-row full">
            <div className="form-group">
              <label>Venue (Full Address)</label>
              <input value={form.venue} onChange={e => handleChange('venue', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Venue (Short)</label>
              <input value={form.venueShort} onChange={e => handleChange('venueShort', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Dress Code</label>
              <input value={form.dressCode} onChange={e => handleChange('dressCode', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Contact Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.contact.email} onChange={e => handleContactChange('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" value={form.contact.phone} onChange={e => handleContactChange('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-row full">
            <div className="form-group">
              <label>WhatsApp Group Link</label>
              <input type="url" value={form.contact.whatsapp} onChange={e => handleContactChange('whatsapp', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Social Media Links</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Instagram</label>
              <input type="url" value={form.social.instagram} onChange={e => handleSocialChange('instagram', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Twitter / X</label>
              <input type="url" value={form.social.twitter} onChange={e => handleSocialChange('twitter', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Facebook</label>
              <input type="url" value={form.social.facebook} onChange={e => handleSocialChange('facebook', e.target.value)} />
            </div>
            <div className="form-group">
              <label>LinkedIn</label>
              <input type="url" value={form.social.linkedin} onChange={e => handleSocialChange('linkedin', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="save-bar">
          <button className="btn-save" onClick={handleSave}>Save Changes</button>
          <span className="save-msg">Settings saved successfully!</span>
        </div>
      </div>
    </AdminLayout>
  );
}
