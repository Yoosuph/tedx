export default function AdminSkeleton({ type = 'page', count = 1 }) {
  if (type === 'stats') {
    return (
      <div className="skeleton-stats-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-icon" />
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="skeleton-table">
        <div className="skeleton-row header">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="skeleton-cell" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, r) => (
          <div key={r} className="skeleton-row">
            {Array.from({ length: count }).map((_, c) => (
              <div key={c} className="skeleton-cell" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="skeleton-form">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-field">
            <div className="skeleton-line short" />
            <div className="skeleton-input" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="skeleton-cards-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-thumb" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    );
  }

  // Default page skeleton
  return (
    <div className="skeleton-page">
      <div className="skeleton-line title" />
      <div className="skeleton-line subtitle" />
      <div className="skeleton-block" />
      <div className="skeleton-block half" />
    </div>
  );
}

export const skeletonStyles = `
  .skeleton-page { padding: 1rem 0; }
  .skeleton-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
  .skeleton-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
  .skeleton-table { border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
  .skeleton-row { display: flex; gap: 0; background: rgba(255,255,255,0.01); }
  .skeleton-row.header { background: rgba(255,255,255,0.03); }
  .skeleton-row + .skeleton-row { border-top: 1px solid rgba(255,255,255,0.06); }
  .skeleton-cell { flex: 1; padding: 1.25rem 1rem; }
  .skeleton-cell::before { content: ''; display: block; height: 14px; border-radius: 4px; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  .skeleton-row.header .skeleton-cell::before { height: 10px; }
  .skeleton-form { display: flex; flex-direction: column; gap: 1.5rem; max-width: 600px; }
  .skeleton-field { display: flex; flex-direction: column; gap: 0.5rem; }
  .skeleton-card { background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 1.5rem; }
  .skeleton-icon { width: 44px; height: 44px; border-radius: 12px; margin-bottom: 1.25rem; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  .skeleton-thumb { width: 100%; aspect-ratio: 16/9; border-radius: 12px; margin-bottom: 0.75rem; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  .skeleton-input { height: 42px; border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  .skeleton-block { height: 120px; border-radius: 12px; margin-top: 1rem; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  .skeleton-block.half { width: 60%; }
  .skeleton-line { height: 14px; border-radius: 4px; margin-bottom: 0.75rem; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  .skeleton-line.title { height: 28px; width: 50%; margin-bottom: 0.5rem; }
  .skeleton-line.subtitle { height: 16px; width: 35%; margin-bottom: 2rem; }
  .skeleton-line.short { width: 60%; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  @media (max-width: 768px) {
    .skeleton-stats-grid { grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
    .skeleton-card { padding: 0.625rem; }
    .skeleton-icon { width: 28px; height: 28px; margin-bottom: 0.5rem; }
    .skeleton-line { height: 10px; margin-bottom: 0.5rem; }
    .skeleton-line.short { width: 50%; }
    .skeleton-cards-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .skeleton-stats-grid { gap: 0.375rem; }
    .skeleton-card { padding: 0.5rem; border-radius: 12px; }
    .skeleton-icon { width: 24px; height: 24px; margin-bottom: 0.375rem; }
    .skeleton-line { height: 8px; margin-bottom: 0.375rem; }
  }
`;
