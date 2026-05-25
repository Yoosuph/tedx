import { useState } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import AdminLayout from './AdminLayout';
import AdminSkeleton from '../../components/shared/AdminSkeleton';

const ITEM_TYPES = ['talk', 'performance', 'break', 'remarks', 'video', 'award'];

const emptyItem = () => ({ time: '', title: '', type: 'talk', description: '', speakerId: '' });
const emptyBlock = (key) => ({ key, label: 'New Session', time: '', items: [] });

export default function AdminSchedule() {
  const { schedule, updateSchedule, speakers, loading } = useSiteData();
  const [saved, setSaved] = useState(false);

  const [blocks, setBlocks] = useState(() => {
    return Object.entries(schedule).map(([key, block]) => ({
      key,
      label: block.label,
      time: block.time,
      items: block.items.map(it => ({ ...it })),
    }));
  });

  const markDirty = () => setSaved(false);

  const updateBlock = (idx, field, value) => {
    setBlocks(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
    markDirty();
  };

  const updateItem = (blockIdx, itemIdx, field, value) => {
    setBlocks(prev => {
      const next = [...prev];
      const items = [...next[blockIdx].items];
      items[itemIdx] = { ...items[itemIdx], [field]: value };
      next[blockIdx] = { ...next[blockIdx], items };
      return next;
    });
    markDirty();
  };

  const addItem = (blockIdx) => {
    setBlocks(prev => {
      const next = [...prev];
      next[blockIdx] = { ...next[blockIdx], items: [...next[blockIdx].items, emptyItem()] };
      return next;
    });
    markDirty();
  };

  const removeItem = (blockIdx, itemIdx) => {
    setBlocks(prev => {
      const next = [...prev];
      next[blockIdx] = {
        ...next[blockIdx],
        items: next[blockIdx].items.filter((_, i) => i !== itemIdx),
      };
      return next;
    });
    markDirty();
  };

  const addBlock = () => {
    const key = 'block_' + Date.now();
    setBlocks(prev => [...prev, emptyBlock(key)]);
    markDirty();
  };

  const removeBlock = (idx) => {
    if (blocks.length <= 1) return;
    setBlocks(prev => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  const [btnState, setBtnState] = useState('idle'); // 'idle' | 'loading' | 'success'

  const handleSave = async () => {
    setBtnState('loading');
    try {
      const obj = {};
      blocks.forEach(b => {
        obj[b.key] = {
          label: b.label,
          time: b.time,
          items: b.items.map(it => {
            const item = { time: it.time, title: it.title, type: it.type, description: it.description };
            if (it.speakerId) item.speakerId = Number(it.speakerId);
            return item;
          }),
        };
      });
      await updateSchedule(obj);
      setBtnState('success');
      setTimeout(() => {
        setBtnState('idle');
      }, 1500);
    } catch (err) {
      console.error(err);
      setBtnState('idle');
    }
  };

  const typeBadge = (type) => {
    const colors = {
      talk: '#3B82F6', performance: '#A855F7', break: '#6B7280',
      remarks: '#F59E0B', video: '#EC4899', award: '#10B981',
    };
    return colors[type] || '#6B7280';
  };

  return (
    <AdminLayout>
      <style>{`
        .sched-page { max-width: 960px; }
        .block-card {
          background: var(--dark-surface);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .block-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem; padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .block-header h3 { color: var(--white); font-size: 1.125rem; margin: 0; }
        .block-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
        .fg { display: flex; flex-direction: column; gap: 0.375rem; }
        .fg label { color: var(--gray-400); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
        .fg input, .fg select, .fg textarea {
          padding: 0.625rem 0.875rem; background: var(--dark); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; color: var(--white); font-size: 0.875rem; font-family: inherit;
        }
        .fg input:focus, .fg select:focus, .fg textarea:focus { outline: none; border-color: var(--ted-red); }
        .fg textarea { resize: vertical; min-height: 42px; }
        .item-row {
          display: grid; grid-template-columns: 130px 1fr 130px;
          gap: 0.75rem; align-items: start; margin-bottom: 0.75rem;
          padding: 0.75rem; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05); border-radius: 10px;
        }
        .item-row .fg { gap: 0.25rem; }
        .item-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem; }
        .item-actions { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; }
        .btn-rm-item {
          padding: 0.375rem 0.625rem; background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3); border-radius: 6px;
          color: #FCA5A5; font-size: 0.7rem; cursor: pointer; white-space: nowrap;
        }
        .btn-rm-block {
          padding: 0.375rem 0.75rem; background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3); border-radius: 6px;
          color: #FCA5A5; font-size: 0.75rem; cursor: pointer;
        }
        .btn-add-item {
          padding: 0.5rem 1rem; background: rgba(255,255,255,0.05);
          border: 1px dashed rgba(255,255,255,0.15); border-radius: 8px;
          color: var(--gray-400); font-size: 0.8125rem; cursor: pointer; margin-top: 0.5rem;
        }
        .btn-add-block {
          width: 100%; padding: 1rem; background: rgba(255,255,255,0.03);
          border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px;
          color: var(--gray-400); font-size: 0.875rem; font-weight: 600;
          cursor: pointer; margin-bottom: 1.5rem;
        }
        .btn-add-block:hover { border-color: var(--ted-red); color: var(--ted-red); }
        .save-bar { display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem; }
        .btn-save {
          padding: 0.75rem 2rem; background: var(--ted-red); color: white;
          border: none; border-radius: 50px; font-size: 0.875rem; font-weight: 700; cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .btn-save:hover:not(:disabled) { background: #C41E3A; }
        .btn-save:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }
        .btn-save.success-state {
          background: #22C55E !important;
        }
        /* Button loading spinner */
        .btn-loading-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: btn-spin 0.6s linear infinite;
        }

        @keyframes btn-spin {
          to { transform: rotate(360deg); }
        }
        .type-badge {
          display: inline-block; padding: 0.125rem 0.5rem; border-radius: 4px;
          font-size: 0.675rem; font-weight: 700; text-transform: uppercase; color: white;
        }
        .item-count { color: var(--gray-400); font-size: 0.8rem; margin-left: 0.75rem; }
        @media (max-width: 768px) {
          .item-row { grid-template-columns: 1fr; }
          .item-detail { grid-template-columns: 1fr; }
          .block-meta { grid-template-columns: 1fr; }
        }
      `}</style>

      {loading ? <AdminSkeleton type="form" /> : (
      <div className="sched-page">
        <h2 style={{ color: 'var(--white)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
          Event Schedule
        </h2>
        <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', margin: '0 0 2rem' }}>
          Manage session blocks and their schedule items.
        </p>

        {blocks.map((block, bi) => (
          <div key={block.key} className="block-card">
            <div className="block-header">
              <h3>
                {block.label || 'Untitled Block'}
                <span className="item-count">{block.items.length} item{block.items.length !== 1 ? 's' : ''}</span>
              </h3>
              {blocks.length > 1 && (
                <button className="btn-rm-block" onClick={() => removeBlock(bi)}>Remove Block</button>
              )}
            </div>

            <div className="block-meta">
              <div className="fg">
                <label>Block Label</label>
                <input value={block.label} onChange={e => updateBlock(bi, 'label', e.target.value)} />
              </div>
              <div className="fg">
                <label>Block Time Range</label>
                <input value={block.time} onChange={e => updateBlock(bi, 'time', e.target.value)} placeholder="e.g. 9:00 AM – 12:00 PM" />
              </div>
            </div>

            {block.items.map((item, ii) => (
              <div key={ii} className="item-row">
                <div className="fg">
                  <label>Time</label>
                  <input
                    value={item.time}
                    onChange={e => updateItem(bi, ii, 'time', e.target.value)}
                    placeholder="11:00 AM"
                  />
                </div>
                <div className="fg">
                  <label>Title</label>
                  <input
                    value={item.title}
                    onChange={e => updateItem(bi, ii, 'title', e.target.value)}
                    placeholder="Speaker or event name"
                  />
                </div>
                <div className="fg">
                  <label>Type</label>
                  <select
                    value={item.type}
                    onChange={e => updateItem(bi, ii, 'type', e.target.value)}
                  >
                    {ITEM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="item-detail">
                    <div className="fg">
                      <label>Description</label>
                      <input
                        value={item.description}
                        onChange={e => updateItem(bi, ii, 'description', e.target.value)}
                        placeholder="Talk title or description"
                      />
                    </div>
                    <div className="fg">
                      <label>Speaker (optional)</label>
                      <select
                        value={item.speakerId || ''}
                        onChange={e => updateItem(bi, ii, 'speakerId', e.target.value)}
                      >
                        <option value="">— None —</option>
                        {speakers.map(sp => (
                          <option key={sp.id} value={sp.id}>{sp.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="item-actions">
                    <span className="type-badge" style={{ background: typeBadge(item.type) }}>
                      {item.type}
                    </span>
                    <button className="btn-rm-item" onClick={() => removeItem(bi, ii)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}

            <button className="btn-add-item" onClick={() => addItem(bi)}>+ Add Item</button>
          </div>
        ))}

        <button className="btn-add-block" onClick={addBlock}>+ Add New Session Block</button>

        <div className="save-bar">
          <button 
            className={`btn-save ${btnState === 'success' ? 'success-state' : ''}`} 
            onClick={handleSave}
            disabled={btnState !== 'idle'}
          >
            {btnState === 'idle' && 'Save Schedule'}
            {btnState === 'loading' && (
              <div className="btn-loading-content">
                <div className="btn-spinner" />
                <span>Saving...</span>
              </div>
            )}
            {btnState === 'success' && '✓ Schedule Saved'}
          </button>
        </div>
      </div>
      )}
    </AdminLayout>
  );
}
