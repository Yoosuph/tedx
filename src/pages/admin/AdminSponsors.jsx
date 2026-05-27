import { useState, useEffect, useRef } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import AdminLayout from './AdminLayout';
import { uploadGalleryMedia } from '../../lib/cloudinary';

const TIERS = ['presenting', 'platinum', 'gold', 'community'];
const TIER_LABELS = {
  presenting: 'Presenting',
  platinum: 'Platinum',
  gold: 'Gold',
  community: 'Community',
};

function emptySponsor() {
  return { id: null, name: '', tier: 'gold', logo: '', website: '', order_index: 99 };
}

export default function AdminSponsors() {
  const { sponsors, updateSponsors } = useSiteData();
  const [list, setList] = useState([]);
  const [btnState, setBtnState] = useState('idle'); // idle | loading | success
  const fileRefs = useRef({});

  useEffect(() => {
    if (!sponsors) return;
    const flat = [];
    TIERS.forEach((tier) => {
      (sponsors[tier] || []).forEach((s, i) => {
        flat.push({ ...s, tier, order_index: s.order_index ?? i });
      });
    });
    flat.sort((a, b) => {
      const ta = TIERS.indexOf(a.tier);
      const tb = TIERS.indexOf(b.tier);
      if (ta !== tb) return ta - tb;
      return (a.order_index || 0) - (b.order_index || 0);
    });
    setList(flat);
  }, [sponsors]);

  const handleChange = (index, field, value) => {
    setList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setBtnState('idle');
  };

  const handleLogoUpload = async (index, file) => {
    if (!file) return;
    try {
      const media = await uploadGalleryMedia(file);
      handleChange(index, 'logo', media.secure_url);
    } catch (err) {
      console.error('Logo upload failed:', err);
      alert('Logo upload failed: ' + (err.message || 'Unknown error'));
    }
  };

  const removeLogo = (index) => {
    handleChange(index, 'logo', '');
    if (fileRefs.current[index]) {
      fileRefs.current[index].value = '';
    }
  };

  const addSponsor = () => {
    setList((prev) => [...prev, emptySponsor()]);
    setBtnState('idle');
  };

  const removeSponsor = (index) => {
    setList((prev) => prev.filter((_, i) => i !== index));
    setBtnState('idle');
  };

  const moveUp = (index) => {
    if (index === 0) return;
    setList((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
    setBtnState('idle');
  };

  const moveDown = (index) => {
    if (index === list.length - 1) return;
    setList((prev) => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated;
    });
    setBtnState('idle');
  };

  const handleSave = async () => {
    setBtnState('loading');
    try {
      const grouped = { presenting: [], platinum: [], gold: [], community: [] };
      list.forEach((s, i) => {
        if (!s.name.trim()) return;
        grouped[s.tier].push({
          id: s.id,
          name: s.name.trim(),
          logo: s.logo || null,
          website: s.website || null,
          tier: s.tier,
          order_index: i,
        });
      });
      await updateSponsors(grouped);
      setBtnState('success');
      setTimeout(() => setBtnState('idle'), 2500);
    } catch (err) {
      console.error('Save failed:', err);
      setBtnState('idle');
    }
  };

  return (
    <AdminLayout>
      <style>{`
        .admin-sponsors { max-width: 900px; }
        .admin-sponsors h2 { color: var(--white); font-size: 1.5rem; margin: 0 0 1.5rem; }
        .admin-sponsors__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .admin-sponsors__add-btn {
          padding: 0.6rem 1.25rem;
          background: var(--ted-red, #EB0028);
          color: white;
          border: none;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .admin-sponsors__add-btn:hover { background: #C41E3A; transform: translateY(-1px); }

        .sponsor-row {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 0.75rem;
          display: grid;
          grid-template-columns: 80px 1fr 1fr 120px auto;
          gap: 0.75rem;
          align-items: start;
        }
        .sponsor-row__logo-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }
        .sponsor-row__logo-preview {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: contain;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .sponsor-row__logo-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px dashed rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-600);
          font-size: 0.7rem;
        }
        .sponsor-row__logo-upload {
          font-size: 0.65rem;
        }
        .sponsor-row__logo-upload input {
          display: none;
        }
        .sponsor-row__logo-upload label {
          color: var(--ted-red);
          cursor: pointer;
          font-weight: 600;
        }
        .sponsor-row__logo-remove {
          font-size: 0.6rem;
          color: var(--gray-500);
          cursor: pointer;
          background: none;
          border: none;
        }
        .sponsor-row input, .sponsor-row select {
          width: 100%;
          padding: 0.55rem 0.75rem;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          color: white;
          font-size: 0.85rem;
        }
        .sponsor-row input::placeholder { color: var(--gray-600); }
        .sponsor-row select { color: white; }
        .sponsor-row select option { background: #1a1a1a; color: white; }
        .sponsor-row__actions {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }
        .sponsor-row__actions button {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: var(--gray-400);
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sponsor-row__actions button:hover { color: white; background: rgba(255,255,255,0.08); }
        .sponsor-row__actions button.danger:hover { background: var(--ted-red); border-color: var(--ted-red); }

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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .btn-save:hover:not(:disabled) { background: #C41E3A; transform: translateY(-1px); }
        .btn-save:disabled { opacity: 0.8; cursor: not-allowed; }
        .btn-save.success-state { background: #22C55E !important; }

        .btn-loading-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .saved-msg { color: #22c55e; font-size: 0.85rem; font-weight: 600; }
      `}</style>

      <div className="admin-sponsors">
        <div className="admin-sponsors__header">
          <h2>Manage Partners</h2>
          <button className="admin-sponsors__add-btn" onClick={addSponsor}>
            + Add Partner
          </button>
        </div>

        {list.map((s, i) => (
          <div className="sponsor-row" key={i}>
            <div className="sponsor-row__logo-cell">
              {s.logo ? (
                <img className="sponsor-row__logo-preview" src={s.logo} alt="" />
              ) : (
                <div className="sponsor-row__logo-placeholder">No logo</div>
              )}
              <div className="sponsor-row__logo-upload">
                <label htmlFor={`logo-upload-${i}`}>Upload</label>
                <input
                  id={`logo-upload-${i}`}
                  type="file"
                  accept="image/*"
                  ref={(el) => { fileRefs.current[i] = el; }}
                  onChange={(e) => handleLogoUpload(i, e.target.files[0])}
                />
                {s.logo && (
                  <button className="sponsor-row__logo-remove" onClick={() => removeLogo(i)}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div>
              <input
                placeholder="Partner name"
                value={s.name}
                onChange={(e) => handleChange(i, 'name', e.target.value)}
              />
            </div>
            <div>
              <input
                placeholder="Website URL (optional)"
                value={s.website || ''}
                onChange={(e) => handleChange(i, 'website', e.target.value)}
              />
            </div>
            <div>
              <select
                value={s.tier}
                onChange={(e) => handleChange(i, 'tier', e.target.value)}
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>{TIER_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="sponsor-row__actions">
              <button onClick={() => moveUp(i)} title="Move up">▲</button>
              <button onClick={() => moveDown(i)} title="Move down">▼</button>
              <button className="danger" onClick={() => removeSponsor(i)} title="Remove">✕</button>
            </div>
          </div>
        ))}

        <div className="save-bar">
          <button
            className={`btn-save ${btnState === 'success' ? 'success-state' : ''}`}
            onClick={handleSave}
            disabled={btnState !== 'idle'}
          >
            {btnState === 'idle' && 'Save Changes'}
            {btnState === 'loading' && (
              <div className="btn-loading-content">
                <div className="btn-spinner" />
                <span>Saving...</span>
              </div>
            )}
            {btnState === 'success' && '✓ Changes Saved'}
          </button>
          {btnState === 'success' && (
            <span className="saved-msg">✓ Saved to database</span>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
