import { useState } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import AdminLayout from './AdminLayout';

export default function AdminSettings() {
  const { siteConfig, updateSiteConfig } = useSiteData();
  const [form, setForm] = useState({ ...siteConfig });
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
    updateSiteConfig(form);
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
        .form-group input, .form-group textarea {
          padding: 0.625rem 0.875rem;
          background: var(--dark);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: var(--white);
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: var(--ted-red);
        }
        .form-group textarea { resize: vertical; min-height: 80px; font-family: inherit; }
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
              <input value={form.date} onChange={e => handleChange('date', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input value={form.time} onChange={e => handleChange('time', e.target.value)} />
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
              <input value={form.contact.phone} onChange={e => handleContactChange('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-row full">
            <div className="form-group">
              <label>WhatsApp Group Link</label>
              <input value={form.contact.whatsapp} onChange={e => handleContactChange('whatsapp', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Social Media Links</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Instagram</label>
              <input value={form.social.instagram} onChange={e => handleSocialChange('instagram', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Twitter / X</label>
              <input value={form.social.twitter} onChange={e => handleSocialChange('twitter', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Facebook</label>
              <input value={form.social.facebook} onChange={e => handleSocialChange('facebook', e.target.value)} />
            </div>
            <div className="form-group">
              <label>LinkedIn</label>
              <input value={form.social.linkedin} onChange={e => handleSocialChange('linkedin', e.target.value)} />
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
