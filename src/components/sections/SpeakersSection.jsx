import { useState, useEffect, useCallback } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import Section from '../shared/Section';
import AnimatedCard from '../shared/AnimatedCard';

const gradients = [
  'linear-gradient(135deg, #EB0028 0%, #FF4757 100%)',
  'linear-gradient(135deg, #FF6B35 0%, #F7C948 100%)',
  'linear-gradient(135deg, #6C63FF 0%, #3F3D56 100%)',
  'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)',
  'linear-gradient(135deg, #E63946 0%, #457B9D 100%)',
  'linear-gradient(135deg, #F72585 0%, #7209B7 100%)',
  'linear-gradient(135deg, #2EC4B6 0%, #CBF3F0 100%)',
  'linear-gradient(135deg, #FF9F1C 0%, #E71D36 100%)',
];

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SpeakerAvatar({ speaker, index, size = 70 }) {
  if (speaker.image) {
    return (
      <div className="speaker-avatar" style={{ width: size, height: size, flexShrink: 0 }}>
        <img src={speaker.image} alt={speaker.name} className="speaker-avatar__img" />
      </div>
    );
  }

  const gradient = gradients[index % gradients.length];
  const initials = getInitials(speaker.name);

  return (
    <div className="speaker-avatar" style={{ width: size, height: size, background: gradient, flexShrink: 0 }}>
      <span className="speaker-avatar__initials">{initials}</span>
    </div>
  );
}

function SpeakerModal({ speaker, index, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (!speaker) return null;

  const gradient = gradients[index % gradients.length];
  const initials = getInitials(speaker.name);

  return (
    <>
      <style>{`
        .speaker-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: speakerModalFadeIn 0.3s ease;
        }

        @keyframes speakerModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .speaker-modal {
          background: var(--dark, #0a0a0a);
          border-radius: var(--radius-2xl, 24px);
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          animation: speakerModalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: row;
        }

        @keyframes speakerModalSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .speaker-modal__left {
          width: 300px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .speaker-modal__left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: ${gradient};
          opacity: 0.15;
        }

        .speaker-modal__left-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .speaker-modal__avatar {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .speaker-modal__avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .speaker-modal__avatar-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3.5rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.1em;
        }

        .speaker-modal__name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--white, #fff);
          margin: 0;
          text-align: center;
          line-height: 1.2;
        }

        .speaker-modal__role {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          text-align: center;
          line-height: 1.4;
        }

        .speaker-modal__right {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .speaker-modal__right::-webkit-scrollbar {
          width: 6px;
        }

        .speaker-modal__right::-webkit-scrollbar-track {
          background: transparent;
        }

        .speaker-modal__right::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
        }

        .speaker-modal__close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--white, #fff);
          font-size: 1.25rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
          backdrop-filter: blur(10px);
        }

        .speaker-modal__close:hover {
          background: var(--ted-red, #EB0028);
          border-color: var(--ted-red, #EB0028);
          transform: rotate(90deg);
        }

        .speaker-modal__talk-title {
          font-size: 1.125rem;
          font-style: italic;
          color: var(--ted-red, #EB0028);
          font-weight: 500;
          padding: 1rem 1.25rem;
          background: rgba(235, 0, 40, 0.08);
          border-left: 3px solid var(--ted-red, #EB0028);
          border-radius: 0 12px 12px 0;
          line-height: 1.5;
        }

        .speaker-modal__section-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--ted-red, #EB0028);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 0.75rem;
        }

        .speaker-modal__story {
          font-size: 0.95rem;
          color: var(--gray-300, #d1d5db);
          line-height: 1.8;
          margin: 0;
        }

        .speaker-modal__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .speaker-modal__meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          font-size: 0.85rem;
          color: var(--gray-300, #d1d5db);
        }

        .speaker-modal__meta-item svg {
          width: 14px;
          height: 14px;
          stroke: var(--ted-red, #EB0028);
          stroke-width: 2;
          fill: none;
        }

        .speaker-modal__social {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .speaker-modal__social-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg, 12px);
          color: var(--gray-300, #d1d5db);
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .speaker-modal__social-link:hover {
          background: var(--ted-red, #EB0028);
          border-color: var(--ted-red, #EB0028);
          color: var(--white, #fff);
          transform: translateY(-2px);
        }

        .speaker-modal__social-link svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }

        @media (max-width: 768px) {
          .speaker-modal-overlay {
            padding: 1rem;
          }

          .speaker-modal {
            flex-direction: column;
            max-height: 95vh;
          }

          .speaker-modal__left {
            width: 100%;
            padding: 1.5rem;
          }

          .speaker-modal__avatar {
            width: 100px;
            height: 100px;
          }

          .speaker-modal__avatar-initials {
            font-size: 2.5rem;
          }

          .speaker-modal__name {
            font-size: 1.25rem;
          }

          .speaker-modal__role {
            font-size: 0.8rem;
          }

          .speaker-modal__right {
            padding: 1.5rem;
          }

          .speaker-modal__close {
            top: 0.75rem;
            right: 0.75rem;
            width: 36px;
            height: 36px;
          }

          .speaker-modal__talk-title {
            font-size: 1rem;
            padding: 0.875rem 1rem;
          }

          .speaker-modal__meta {
            gap: 0.5rem;
          }

          .speaker-modal__social {
            gap: 0.5rem;
          }
        }
      `}</style>

      <div
        className="speaker-modal-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`${speaker.name} details`}
      >
        <div className="speaker-modal" onClick={(e) => e.stopPropagation()}>
          <button className="speaker-modal__close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="speaker-modal__left">
            <div className="speaker-modal__left-content">
              <div className="speaker-modal__avatar">
                {speaker.image ? (
                  <img src={speaker.image} alt={speaker.name} />
                ) : (
                  <div className="speaker-modal__avatar-initials" style={{ background: gradient }}>
                    {initials}
                  </div>
                )}
              </div>
              <h2 className="speaker-modal__name">{speaker.name}</h2>
              <p className="speaker-modal__role">{speaker.role}</p>
            </div>
          </div>

          <div className="speaker-modal__right">
            <div className="speaker-modal__talk-title">
              &ldquo;{speaker.title}&rdquo;
            </div>

            <div className="speaker-modal__meta">
              <span className="speaker-modal__meta-item">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {speaker.duration} min talk
              </span>
              <span className="speaker-modal__meta-item">
                <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                TEDxDutse 2026
              </span>
            </div>

            <div>
              <p className="speaker-modal__section-label">Background</p>
              <p className="speaker-modal__story">{speaker.story || speaker.bio}</p>
            </div>

            {speaker.social && (
              <div>
                <p className="speaker-modal__section-label">Connect</p>
                <div className="speaker-modal__social">
                  {speaker.social.facebook && (
                    <a href={speaker.social.facebook} target="_blank" rel="noreferrer" className="speaker-modal__social-link">
                      <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                      Facebook
                    </a>
                  )}
                  {speaker.social.instagram && (
                    <a href={speaker.social.instagram} target="_blank" rel="noreferrer" className="speaker-modal__social-link">
                      <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
                      Instagram
                    </a>
                  )}
                  {speaker.social.linkedin && (
                    <a href={speaker.social.linkedin} target="_blank" rel="noreferrer" className="speaker-modal__social-link">
                      <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function SpeakersSection() {
  const { speakers } = useSiteData();
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);

  return (
    <>
      <style>{`
        .speakers-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-top: 2.5rem;
        }

        @media (min-width: 768px) {
          .speakers-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .speaker-card {
          background: var(--dark-surface, #1a1a1a);
          border-radius: var(--radius-xl, 16px);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          box-shadow: var(--shadow-lg, 0 4px 20px rgba(0,0,0,0.15));
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
        }

        .speaker-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, var(--ted-red, #EB0028), var(--ted-red-light, #FF4757));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .speaker-card:hover {
          transform: translateX(4px);
          box-shadow: var(--shadow-xl, 0 12px 40px rgba(0,0,0,0.3));
          border-color: rgba(235, 0, 40, 0.2);
        }

        .speaker-card:hover::before {
          opacity: 1;
        }

        .speaker-avatar {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .speaker-avatar__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .speaker-avatar__initials {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--white, #fff);
          letter-spacing: 0.05em;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .speaker-card__content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .speaker-card__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .speaker-card__name {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--white, #fff);
          margin: 0;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .speaker-card__duration {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          background: rgba(235, 0, 40, 0.1);
          border: 1px solid rgba(235, 0, 40, 0.25);
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--ted-red, #EB0028);
          letter-spacing: 0.02em;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .speaker-card__duration svg {
          width: 11px;
          height: 11px;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }

        .speaker-card__role {
          font-size: 0.8rem;
          color: var(--gray-500, #888);
          margin: 0;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .speaker-card__title {
          font-size: 0.85rem;
          font-style: italic;
          color: var(--ted-red, #EB0028);
          margin: 0;
          line-height: 1.4;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .speaker-card__cta {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--gray-500, #888);
          margin-top: 0.25rem;
          transition: color 0.3s ease;
        }

        .speaker-card:hover .speaker-card__cta {
          color: var(--ted-red, #EB0028);
        }

        .speaker-card__cta svg {
          width: 14px;
          height: 14px;
          transition: transform 0.3s ease;
        }

        .speaker-card:hover .speaker-card__cta svg {
          transform: translateX(4px);
        }

        @media (max-width: 640px) {
          .speaker-card {
            padding: 1rem;
            gap: 1rem;
          }

          .speaker-card__name {
            font-size: 0.95rem;
          }

          .speaker-card__role {
            font-size: 0.75rem;
          }

          .speaker-card__title {
            font-size: 0.8rem;
          }
        }
      `}</style>

      <Section
        id="speakers"
        title="Our Speakers"
        subtitle="A diverse lineup of thought leaders, innovators, and changemakers sharing ideas that matter. Click any speaker to learn more."
        dark
      >
        <div className="speakers-grid">
          {speakers.map((speaker, index) => (
            <AnimatedCard key={speaker.id} direction="up" delay={index * 50}>
              <div
                className="speaker-card"
                onClick={() => setSelectedSpeaker({ speaker, index })}
                role="button"
                tabIndex={0}
                aria-label={`View ${speaker.name}'s profile`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedSpeaker({ speaker, index });
                  }
                }}
              >
                <SpeakerAvatar speaker={speaker} index={index} size={70} />
                <div className="speaker-card__content">
                  <div className="speaker-card__header">
                    <h3 className="speaker-card__name">{speaker.name}</h3>
                    <span className="speaker-card__duration">
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {speaker.duration} min
                    </span>
                  </div>
                  <p className="speaker-card__role">{speaker.role}</p>
                  <p className="speaker-card__title">&ldquo;{speaker.title}&rdquo;</p>
                  <div className="speaker-card__cta">
                    View Profile
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </Section>

      {selectedSpeaker && (
        <SpeakerModal
          speaker={selectedSpeaker.speaker}
          index={selectedSpeaker.index}
          onClose={() => setSelectedSpeaker(null)}
        />
      )}
    </>
  );
}
