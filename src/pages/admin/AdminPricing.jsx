import { useState } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import AdminLayout from './AdminLayout';

export default function AdminPricing() {
  const { ticketTiers, updateTicketTiers } = useSiteData();
  const [tiers, setTiers] = useState(ticketTiers.map(t => ({ ...t, features: [...t.features] })));
  const [saved, setSaved] = useState(false);

  const handleTierChange = (index, field, value) => {
    setTiers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setSaved(false);
  };

  const handleFeatureChange = (tierIndex, featureIndex, value) => {
    setTiers(prev => {
      const updated = [...prev];
      const features = [...updated[tierIndex].features];
      features[featureIndex] = value;
      updated[tierIndex] = { ...updated[tierIndex], features };
      return updated;
    });
    setSaved(false);
  };

  const addFeature = (tierIndex) => {
    setTiers(prev => {
      const updated = [...prev];
      updated[tierIndex] = { ...updated[tierIndex], features: [...updated[tierIndex].features, ''] };
      return updated;
    });
    setSaved(false);
  };

  const removeFeature = (tierIndex, featureIndex) => {
    setTiers(prev => {
      const updated = [...prev];
      updated[tierIndex] = { ...updated[tierIndex], features: updated[tierIndex].features.filter((_, i) => i !== featureIndex) };
      return updated;
    });
    setSaved(false);
  };

  const addTier = () => {
    setTiers(prev => [...prev, {
      id: 'tier-' + Date.now(),
      name: 'New Tier',
      price: 0,
      currency: '₦',
      features: ['Feature 1'],
    }]);
    setSaved(false);
  };

  const removeTier = (index) => {
    if (tiers.length <= 1) return;
    setTiers(prev => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const handleSave = () => {
    updateTicketTiers(tiers);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <style>{`
        .pricing-page { max-width: 900px; }
        .tier-card-admin {
          background: var(--dark-surface);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .tier-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .tier-header h3 { color: var(--white); font-size: 1.125rem; margin: 0; }
        .btn-remove-tier {
          padding: 0.375rem 0.75rem;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 6px;
          color: #FCA5A5;
          font-size: 0.75rem;
          cursor: pointer;
        }
        .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .fg { display: flex; flex-direction: column; gap: 0.375rem; }
        .fg label { color: var(--gray-400); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
        .fg input { padding: 0.625rem 0.875rem; background: var(--dark); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--white); font-size: 0.875rem; }
        .fg input:focus { outline: none; border-color: var(--ted-red); }
        .features-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .feature-row { display: flex; gap: 0.5rem; align-items: center; }
        .feature-row input { flex: 1; padding: 0.5rem 0.75rem; background: var(--dark); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: var(--white); font-size: 0.8125rem; }
        .feature-row input:focus { outline: none; border-color: var(--ted-red); }
        .btn-remove-feature { width: 28px; height: 28px; border-radius: 6px; background: rgba(239,68,68,0.1); border: none; color: #FCA5A5; cursor: pointer; font-size: 0.875rem; flex-shrink: 0; }
        .btn-add-feature { padding: 0.5rem 1rem; background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.15); border-radius: 8px; color: var(--gray-400); font-size: 0.8125rem; cursor: pointer; margin-top: 0.5rem; }
        .btn-add-tier { width: 100%; padding: 1rem; background: rgba(255,255,255,0.03); border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px; color: var(--gray-400); font-size: 0.875rem; font-weight: 600; cursor: pointer; margin-bottom: 1.5rem; }
        .btn-add-tier:hover { border-color: var(--ted-red); color: var(--ted-red); }
        .save-bar { display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem; }
        .btn-save { padding: 0.75rem 2rem; background: var(--ted-red); color: white; border: none; border-radius: 50px; font-size: 0.875rem; font-weight: 700; cursor: pointer; }
        .btn-save:hover { background: #C41E3A; }
        .save-msg { color: #86EFAC; font-size: 0.875rem; opacity: ${saved ? 1 : 0}; transition: opacity 0.3s; }
        .popular-toggle { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; }
        .popular-toggle input[type=checkbox] { accent-color: var(--ted-red); }
        .popular-toggle label { color: var(--gray-400); font-size: 0.8125rem; }
        @media (max-width: 640px) { .form-row-3 { grid-template-columns: 1fr; } .form-row-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div className="pricing-page">
        <h2 style={{ color: 'var(--white)', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>Ticket Pricing</h2>
        <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', margin: '0 0 2rem' }}>Manage ticket tiers, prices, and included features.</p>

        {tiers.map((tier, ti) => (
          <div key={tier.id} className="tier-card-admin">
            <div className="tier-header">
              <h3>{tier.name || 'Untitled Tier'}</h3>
              {tiers.length > 1 && (
                <button className="btn-remove-tier" onClick={() => removeTier(ti)}>Remove Tier</button>
              )}
            </div>
            <div className="form-row-3">
              <div className="fg">
                <label>Tier Name</label>
                <input value={tier.name} onChange={e => handleTierChange(ti, 'name', e.target.value)} />
              </div>
              <div className="fg">
                <label>Price (₦)</label>
                <input type="number" value={tier.price} onChange={e => handleTierChange(ti, 'price', Number(e.target.value))} />
              </div>
              <div className="fg">
                <label>Tier ID</label>
                <input value={tier.id} onChange={e => handleTierChange(ti, 'id', e.target.value)} />
              </div>
            </div>
            <div className="popular-toggle">
              <input type="checkbox" id={`popular-${ti}`} checked={!!tier.popular} onChange={e => handleTierChange(ti, 'popular', e.target.checked)} />
              <label htmlFor={`popular-${ti}`}>Mark as "Most Popular" tier</label>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ color: 'var(--gray-400)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>Features</label>
              <div className="features-list">
                {tier.features.map((feat, fi) => (
                  <div key={fi} className="feature-row">
                    <input value={feat} onChange={e => handleFeatureChange(ti, fi, e.target.value)} placeholder="Feature description" />
                    {tier.features.length > 1 && (
                      <button className="btn-remove-feature" onClick={() => removeFeature(ti, fi)}>×</button>
                    )}
                  </div>
                ))}
              </div>
              <button className="btn-add-feature" onClick={() => addFeature(ti)}>+ Add Feature</button>
            </div>
          </div>
        ))}

        <button className="btn-add-tier" onClick={addTier}>+ Add New Tier</button>

        <div className="save-bar">
          <button className="btn-save" onClick={handleSave}>Save Pricing</button>
          <span className="save-msg">Pricing updated!</span>
        </div>
      </div>
    </AdminLayout>
  );
}
