import { useState, useEffect, useCallback } from 'react';
import { speakers } from '../../data/siteData';
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

function SpeakerAvatar({ speaker, index, size = 90 }) {
  if (speaker.image) {
    return (
      <div className="speaker-avatar" style={{ width: size, height: size }}>
        <img src={speaker.image} alt={speaker.name} className="speaker-avatar__img" />
      </div>
    );
  }

  const gradient = gradients[index % gradients.length];
  const initials = getInitials(speaker.name);

  return (
    <div className="speaker-avatar" style={{ width: size, height: size, background: gradient }}>
      <span className="speaker-avatar__initials">{initials}</span>
    </div>
  );
}

function SpeakerModal({ speaker, index, onClose }) {
  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close on Escape key
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (!speaker) return null;

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
          max-width: 720px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: speakerModalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
        }

        @keyframes speakerModalSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .speaker-modal::-webkit-scrollbar {
          width: 6px;
        }

        .speaker-modal::-webkit-scrollbar-track {
          background: transparent;
        }

        .speaker-modal::-webkit-scrollbar-thumb {
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

        .speaker-modal__hero {
          position: relative;
          height: 280px;
          overflow: hidden;
        }

        .speaker-modal__hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .speaker-modal__hero-gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(to top, var(--dark, #0a0a0a), transparent);
        }

        .speaker-modal__hero-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 0.1em;
        }

        .speaker-modal__body {
          padding: 0 2rem 2rem;
          margin-top: -3rem;
          position: relative;
        }

        .speaker-modal__avatar-wrap {
          margin-bottom: 1.5rem;
        }

        .speaker-modal__avatar-wrap .speaker-avatar {
          border: 4px solid var(--dark, #0a0a0a);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .speaker-modal__name {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          color: var(--white, #fff);
          margin: 0 0 0.5rem;
          line-height: 1.2;
        }

        .speaker-modal__role {
          font-size: 0.95rem;
          color: var(--gray-400, #9ca3af);
          margin: 0 0 1.25rem;
          line-height: 1.5;
        }

        .speaker-modal__talk-title {
          display: inline-block;
          font-size: 1.05rem;
          font-style: italic;
          color: var(--ted-red, #EB0028);
          font-weight: 500;
          margin: 0 0 1.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(235, 0, 40, 0.08);
          border-left: 3px solid var(--ted-red, #EB0028);
          border-radius: 0 8px 8px 0;
          line-height: 1.5;
          width: 100%;
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
          margin: 0 0 2rem;
        }

        .speaker-modal__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
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

        .speaker-modal__divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 0 0 1.5rem;
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

        @media (max-width: 640px) {
          .speaker-modal-overlay {
            padding: 0.75rem;
            align-items: flex-end;
          }

          .speaker-modal {
            max-height: 95vh;
            border-radius: var(--radius-2xl, 24px) var(--radius-2xl, 24px) 0 0;
            animation: speakerModalSlideUpMobile 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes speakerModalSlideUpMobile {
            from { opacity: 0; transform: translateY(100%); }
            to { opacity: 1; transform: translateY(0); }
          }

          .speaker-modal__hero {
            height: 200px;
          }

          .speaker-modal__body {
            padding: 0 1.25rem 1.5rem;
          }

          .speaker-modal__close {
            top: 0.75rem;
            right: 0.75rem;
            width: 36px;
            height: 36px;
          }

          .speaker-modal__meta {
            flex-direction: column;
            gap: 0.5rem;
          }

          .speaker-modal__social {
            flex-direction: column;
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
          {/* Close button */}
          <button className="speaker-modal__close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Hero image */}
          <div className="speaker-modal__hero">
            {speaker.image ? (
              <img src={speaker.image} alt={speaker.name} className="speaker-modal__hero-img" />
            ) : (
              <div className="speaker-modal__hero-initials" style={{ background: gradients[index % gradients.length] }}>
                {getInitials(speaker.name)}
              </div>
            )}
            <div className="speaker-modal__hero-gradient" />
          </div>

          {/* Body content */}
          <div className="speaker-modal__body">
            {/* Avatar */}
            <div className="speaker-modal__avatar-wrap">
              <SpeakerAvatar speaker={speaker} index={index} size={80} />
            </div>

            {/* Name & role */}
            <h2 className="speaker-modal__name">{speaker.name}</h2>
            <p className="speaker-modal__role">{speaker.role}</p>

            {/* Talk title */}
            <div className="speaker-modal__talk-title">
              &ldquo;{speaker.title}&rdquo;
            </div>

            {/* Meta badges */}
            <div className="speaker-modal__meta">
              <span className="speaker-modal__meta-item">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {speaker.duration} min talk
              </span>
              <span className="speaker-modal__meta-item">
                <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                TEDxDutse 2025
              </span>
            </div>

            <div className="speaker-modal__divider" />

            {/* Background story */}
            <p className="speaker-modal__section-label">Background</p>
            <p className="speaker-modal__story">{speaker.story || speaker.bio}</p>

            <div className="speaker-modal__divider" />

            {/* Social links */}
            {speaker.social && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function SpeakersSection() {
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);

  return (
    <>
      <style>{`
        .speakers-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-top: 2.5rem;
        }

        @media (min-width: 640px) {
          .speakers-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .speakers-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1280px) {
          .speakers-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .speaker-card {
          background: var(--dark-surface, #1a1a1a);
          border-radius: var(--radius-xl, 16px);
          padding: 1.75rem 1.5rem;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
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
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--ted-red, #EB0028), var(--ted-red-light, #FF4757));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .speaker-card::after {
          content: 'View Profile →';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.6rem;
          background: linear-gradient(135deg, var(--ted-red, #EB0028), var(--ted-red-light, #FF4757));
          color: var(--white, #fff);
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(100%);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .speaker-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: var(--shadow-xl, 0 12px 40px rgba(0,0,0,0.3));
        }

        .speaker-card:hover::before {
          opacity: 1;
        }

        .speaker-card:hover::after {
          opacity: 1;
          transform: translateY(0);
        }

        .speaker-avatar {
          border-radius: 50%;
          margin: 0 auto 1.25rem;
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
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--white, #fff);
          letter-spacing: 0.05em;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .speaker-card__name {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--white, #fff);
          margin: 0 0 0.4rem;
          line-height: 1.3;
        }

        .speaker-card__role {
          font-size: 0.82rem;
          color: var(--gray-500, #888);
          margin: 0 0 0.9rem;
          line-height: 1.4;
        }

        .speaker-card__title {
          font-size: 0.9rem;
          font-style: italic;
          color: var(--ted-red, #EB0028);
          margin: 0 0 0.9rem;
          line-height: 1.4;
          font-weight: 500;
        }

        .speaker-card__bio {
          font-size: 0.82rem;
          color: var(--gray-500, #aaa);
          line-height: 1.6;
          margin: 0 0 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .speaker-card__duration {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.85rem;
          background: rgba(235, 0, 40, 0.1);
          border: 1px solid rgba(235, 0, 40, 0.25);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--ted-red, #EB0028);
          letter-spacing: 0.02em;
        }

        .speaker-card__duration svg {
          width: 12px;
          height: 12px;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
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
            <AnimatedCard key={speaker.id} direction="up" delay={index * 100}>
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
                <SpeakerAvatar speaker={speaker} index={index} size={90} />
                <h3 className="speaker-card__name">{speaker.name}</h3>
                <p className="speaker-card__role">{speaker.role}</p>
                <p className="speaker-card__title">&ldquo;{speaker.title}&rdquo;</p>
                <p className="speaker-card__bio">{speaker.bio}</p>
                <span className="speaker-card__duration">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {speaker.duration} min
                </span>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </Section>

      {/* Speaker Detail Modal */}
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
