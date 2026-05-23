import { useState } from 'react';
import Section from '../shared/Section';
import AnimatedCard from '../shared/AnimatedCard';
import { useSiteData } from '../../context/SiteDataContext';

const typeConfig = {
  talk: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    color: 'var(--white, #ffffff)',
    bg: 'rgba(255, 255, 255, 0.1)',
  },
  performance: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    color: 'var(--gold, #FFD700)',
    bg: 'rgba(255, 215, 0, 0.12)',
  },
  break: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    color: 'var(--gray-600, #9CA3AF)',
    bg: 'rgba(156, 163, 175, 0.12)',
  },
  remarks: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    color: 'var(--gray-600, #9CA3AF)',
    bg: 'rgba(156, 163, 175, 0.12)',
  },
  video: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.12)',
  },
  award: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
    color: 'var(--gold, #FFD700)',
    bg: 'rgba(255, 215, 0, 0.12)',
  },
};

export default function ScheduleSection({ hideHeader = false }) {
  const { schedule } = useSiteData();
  const [activeTab, setActiveTab] = useState('morning');
  const currentSession = schedule[activeTab];

  return (
    <>
      <style>{`
        .schedule-tabs {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 3rem;
        }

        .schedule-tab {
          padding: 0.75rem 1.75rem;
          border: 2px solid var(--ted-red, #EB0028);
          border-radius: var(--radius-lg, 12px);
          background: transparent;
          color: var(--ted-red, #EB0028);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 0.02em;
        }

        .schedule-tab:hover {
          background: rgba(235, 0, 40, 0.1);
        }

        .schedule-tab--active {
          background: var(--ted-red, #EB0028);
          color: var(--white, #ffffff);
        }

        .schedule-tab--active:hover {
          background: var(--ted-red, #EB0028);
        }

        .schedule-session-info {
          text-align: center;
          margin-bottom: 2rem;
          color: var(--gray-600, #9CA3AF);
          font-size: 0.95rem;
        }

        .schedule-timeline {
          position: relative;
          max-width: 700px;
          margin: 0 auto;
          padding-left: 2.5rem;
        }

        .schedule-timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--ted-red, #EB0028);
          border-radius: 1px;
        }

        .schedule-item {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .schedule-item:last-child {
          margin-bottom: 0;
        }

        .schedule-item-dot {
          position: absolute;
          left: -2.5rem;
          top: 1.2rem;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid var(--ted-red, #EB0028);
          background: var(--dark, #111111);
          transform: translateX(-5px);
        }

        .schedule-item-card {
          background: var(--dark-surface, #1a1a1a);
          border-radius: var(--radius-lg, 12px);
          padding: 1.25rem 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .schedule-item-card:hover {
          transform: translateY(-2px);
          border-color: rgba(235, 0, 40, 0.3);
          box-shadow: 0 8px 25px -5px rgba(0,0,0,0.4);
        }

        .schedule-item-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .schedule-item-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .schedule-item-icon svg {
          width: 16px;
          height: 16px;
        }

        .schedule-item-time {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.6rem;
          background: var(--ted-red, #EB0028);
          color: var(--white, #ffffff);
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .schedule-item-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--white, #ffffff);
          margin: 0;
          flex: 1;
          min-width: 0;
        }

        .schedule-item-description {
          font-size: 0.875rem;
          color: var(--gray-400, #9CA3AF);
          margin: 0.25rem 0 0 0;
          padding-left: calc(32px + 0.75rem);
          line-height: 1.5;
        }

        .schedule-panel {
          animation: scheduleFadeIn 0.35s ease-out;
        }

        @keyframes scheduleFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .schedule-tabs {
            gap: 0.375rem;
            margin-bottom: 2rem;
          }

          .schedule-tab {
            padding: 0.6rem 1rem;
            font-size: 0.85rem;
          }

          .schedule-timeline {
            padding-left: 1.75rem;
          }

          .schedule-timeline::before {
            left: 0;
          }

          .schedule-item-dot {
            left: -1.75rem;
          }

          .schedule-item-card {
            padding: 1rem;
          }

          .schedule-item-time {
            font-size: 0.7rem;
            padding: 0.2rem 0.5rem;
          }

          .schedule-item-title {
            font-size: 0.95rem;
          }

          .schedule-item-description {
            padding-left: 0;
            margin-top: 0.5rem;
          }

          .schedule-item-header {
            gap: 0.5rem;
          }
        }
      `}</style>

      <Section
        id="schedule"
        title="Event Schedule"
        subtitle="Plan your day with our carefully curated program"
        dark
        hideHeader={hideHeader}
      >
        {/* Tabs */}
        <div className="schedule-tabs">
          <button
            className={`schedule-tab ${activeTab === 'morning' ? 'schedule-tab--active' : ''}`}
            onClick={() => setActiveTab('morning')}
            aria-pressed={activeTab === 'morning'}
          >
            Morning Session
          </button>
          <button
            className={`schedule-tab ${activeTab === 'afternoon' ? 'schedule-tab--active' : ''}`}
            onClick={() => setActiveTab('afternoon')}
            aria-pressed={activeTab === 'afternoon'}
          >
            Afternoon Session
          </button>
        </div>

        {/* Session info */}
        <div className="schedule-session-info">
          {currentSession.time}
        </div>

        {/* Timeline */}
        <div key={activeTab} className="schedule-panel">
          <div className="schedule-timeline">
            {currentSession.items.map((item, index) => {
              const config = typeConfig[item.type] || typeConfig.talk;
              return (
                <AnimatedCard key={`${activeTab}-${index}`} delay={index * 60}>
                  <div className="schedule-item">
                    <div className="schedule-item-dot" />
                    <div className="schedule-item-card">
                      <div className="schedule-item-header">
                        <div
                          className="schedule-item-icon"
                          style={{ background: config.bg, color: config.color }}
                        >
                          {config.icon}
                        </div>
                        {item.time && (
                          <span className="schedule-item-time">{item.time}</span>
                        )}
                        <h3 className="schedule-item-title">{item.title}</h3>
                      </div>
                      {item.description && (
                        <p className="schedule-item-description">{item.description}</p>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </Section>
    </>
  );
}
