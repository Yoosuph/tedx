import { useState, useRef } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import AdminLayout from './AdminLayout';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const emptySpeaker = () => ({
  id: 'speaker-' + Date.now(),
  name: '',
  title: '',
  role: '',
  bio: '',
  story: '',
  duration: '',
  image: '',
  social: { facebook: '', instagram: '', linkedin: '' },
});

export default function AdminSpeakers() {
  const { speakers, updateSpeakers } = useSiteData();
  const [list, setList] = useState(() =>
    speakers.map(s => ({ ...s, social: { ...s.social } }))
  );
  const [expandedId, setExpandedId] = useState(null);
  const [saved, setSaved] = useState(false);

  const toggle = (id) => setExpandedId(prev => (prev === id ? null : id));

  const handleChange = (index, field, value) => {
    setList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setSaved(false);
  };

  const handleSocialChange = (index, key, value) => {
    setList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], social: { ...updated[index].social, [key]: value } };
      return updated;
    });
    setSaved(false);
  };

  const addSpeaker = () => {
    const newSp = emptySpeaker();
    setList(prev => [...prev, newSp]);
    setExpandedId(newSp.id);
    setSaved(false);
  };

  const removeSpeaker = (index) => {
    setList(prev => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const handleSave = () => {
    updateSpeakers(list);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <style>{`
        .speakers-page { max-width: 900px; }
        .sp-card {
          background: var(--dark-surface);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .sp-card.expanded { border-color: var(--ted-red); }
        .sp-card-summary {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          cursor: pointer;
          user-select: none;
        }
        .sp-card-summary:hover { background: rgba(255,255,255,0.02); }
        .sp-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          background: rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .sp-avatar-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(235,0,40,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ted-red);
          font-size: 1.25rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .sp-info { flex: 1; min-width: 0; }
        .sp-name { color: var(--white); font-size: 1rem; font-weight: 600; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sp-role { color: var(--gray-400); font-size: 0.8125rem; margin: 0.125rem 0 0; }
        .sp-preview { color: var(--gray-500); font-size: 0.75rem; margin: 0.25rem 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sp-chevron { color: var(--gray-500); font-size: 1.25rem; transition: transform 0.2s; flex-shrink: 0; }
        .sp-card.expanded .sp-chevron { transform: rotate(180deg); }
        .sp-editor {
          padding: 0 1.5rem 1.5rem;
          display: none;
        }
        .sp-card.expanded .sp-editor { display: block; }
        .sp-editor-border { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 1.25rem; }
        .sp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .sp-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .sp-fg { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
        .sp-fg label { color: var(--gray-400); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
        .sp-fg input, .sp-fg textarea { padding: 0.625rem 0.875rem; background: var(--dark); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--white); font-size: 0.875rem; font-family: inherit; }
        .sp-fg input:focus, .sp-fg textarea:focus { outline: none; border-color: var(--ted-red); }
        .sp-fg textarea { resize: vertical; min-height: 70px; }
        .sp-section-label { color: var(--gray-400); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin: 0.5rem 0 0.75rem; }
        .sp-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.06); }
        .btn-sp-delete { padding: 0.5rem 1rem; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: #FCA5A5; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
        .btn-sp-delete:hover { background: rgba(239,68,68,0.2); }
        .btn-sp-collapse { padding: 0.5rem 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--gray-400); font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
        .btn-add-speaker { width: 100%; padding: 1rem; background: rgba(255,255,255,0.03); border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px; color: var(--gray-400); font-size: 0.875rem; font-weight: 600; cursor: pointer; margin-bottom: 1.5rem; }
        .btn-add-speaker:hover { border-color: var(--ted-red); color: var(--ted-red); }
        .save-bar { display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem; }
        .btn-save { padding: 0.75rem 2rem; background: var(--ted-red); color: white; border: none; border-radius: 50px; font-size: 0.875rem; font-weight: 700; cursor: pointer; }
        .btn-save:hover { background: #C41E3A; }
        .save-msg { color: #86EFAC; font-size: 0.875rem; opacity: ${saved ? 1 : 0}; transition: opacity 0.3s; }
        .sp-count { color: var(--gray-500); font-size: 0.8125rem; margin-left: auto; }
        .sp-file-label { display: inline-block; cursor: pointer; }
        .sp-file-input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
        .sp-file-btn { display: inline-block; padding: 0.625rem 1rem; background: var(--dark); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--gray-300); font-size: 0.875rem; transition: all 0.2s; }
        .sp-file-label:hover .sp-file-btn { border-color: var(--ted-red); color: var(--white); }
        @media (max-width: 640px) {
          .sp-grid-2, .sp-grid-3 { grid-template-columns: 1fr; }
          .sp-card-summary { padding: 0.875rem 1rem; }
          .sp-editor { padding: 0 1rem 1rem; }
        }
      `}</style>

      <div className="speakers-page">
        <h2 style={{ color: 'var(--white)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Speakers</h2>
        <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', margin: '0 0 2rem' }}>
          Manage event speakers, their bios, and social profiles.
        </p>

        {list.map((speaker, idx) => (
          <div
            key={speaker.id}
            className={`sp-card ${expandedId === speaker.id ? 'expanded' : ''}`}
          >
            <div className="sp-card-summary" onClick={() => toggle(speaker.id)}>
              {speaker.image ? (
                <img className="sp-avatar" src={speaker.image} alt={speaker.name} />
              ) : (
                <div className="sp-avatar-placeholder">
                  {(speaker.name || '?')[0].toUpperCase()}
                </div>
              )}
              <div className="sp-info">
                <p className="sp-name">{speaker.name || 'Untitled Speaker'}</p>
                <p className="sp-role">{speaker.role || 'No role specified'}</p>
                <p className="sp-preview">
                  {speaker.bio ? speaker.bio.slice(0, 80) + (speaker.bio.length > 80 ? '…' : '') : 'No bio yet'}
                </p>
              </div>
              <span className="sp-chevron">▾</span>
            </div>

            <div className="sp-editor">
              <div className="sp-editor-border">
                <div className="sp-grid-2">
                  <div className="sp-fg">
                    <label>Full Name</label>
                    <input value={speaker.name} onChange={e => handleChange(idx, 'name', e.target.value)} placeholder="Speaker name" />
                  </div>
                  <div className="sp-fg">
                    <label>Role / Title</label>
                    <input value={speaker.role} onChange={e => handleChange(idx, 'role', e.target.value)} placeholder="e.g. Keynote Speaker" />
                  </div>
                </div>
                <div className="sp-fg">
                  <label>Talk Title</label>
                  <input value={speaker.title} onChange={e => handleChange(idx, 'title', e.target.value)} placeholder="Title of their talk" />
                </div>
                <div className="sp-fg">
                  <label>Bio</label>
                  <textarea value={speaker.bio} onChange={e => handleChange(idx, 'bio', e.target.value)} placeholder="Short biography" rows={3} />
                </div>
                <div className="sp-fg">
                  <label>Story</label>
                  <textarea value={speaker.story} onChange={e => handleChange(idx, 'story', e.target.value)} placeholder="Speaker's story or extended description" rows={3} />
                </div>
                <div className="sp-grid-2">
                  <div className="sp-fg">
                    <label>Duration (minutes)</label>
                    <input value={speaker.duration} onChange={e => handleChange(idx, 'duration', e.target.value)} placeholder="e.g. 18" />
                  </div>
                  <div className="sp-fg">
                    <label>Speaker Photo</label>
                    <label className="sp-file-label">
                      <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) { alert('Image too large. Max 2MB.'); return; }
                        const dataUrl = await fileToBase64(file);
                        handleChange(idx, 'image', dataUrl);
                      }} className="sp-file-input" />
                      <span className="sp-file-btn">{speaker.image ? 'Change Photo' : 'Upload Photo'}</span>
                    </label>
                  </div>
                </div>

                <p className="sp-section-label">Social Links</p>
                <div className="sp-grid-3">
                  <div className="sp-fg">
                    <label>Facebook</label>
                    <input value={speaker.social.facebook} onChange={e => handleSocialChange(idx, 'facebook', e.target.value)} placeholder="https://facebook.com/..." />
                  </div>
                  <div className="sp-fg">
                    <label>Instagram</label>
                    <input value={speaker.social.instagram} onChange={e => handleSocialChange(idx, 'instagram', e.target.value)} placeholder="https://instagram.com/..." />
                  </div>
                  <div className="sp-fg">
                    <label>LinkedIn</label>
                    <input value={speaker.social.linkedin} onChange={e => handleSocialChange(idx, 'linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>

                <div className="sp-actions">
                  <button className="btn-sp-delete" onClick={(e) => { e.stopPropagation(); removeSpeaker(idx); }}>Delete Speaker</button>
                  <button className="btn-sp-collapse" onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}>Collapse</button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="btn-add-speaker" onClick={addSpeaker}>+ Add New Speaker</button>

        <div className="save-bar">
          <button className="btn-save" onClick={handleSave}>Save Speakers</button>
          <span className="save-msg">Speakers updated!</span>
          <span className="sp-count">{list.length} speaker{list.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </AdminLayout>
  );
}
