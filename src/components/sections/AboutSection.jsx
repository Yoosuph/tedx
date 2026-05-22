import { useSiteData } from '../../context/SiteDataContext';
import Section from '../shared/Section';
import AnimatedCard from '../shared/AnimatedCard';

const stats = [
  {
    value: '8',
    label: 'Speakers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    value: '2',
    label: 'Performances',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    value: '1',
    label: 'Day',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    value: '500+',
    label: 'Attendees',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function AboutSection() {
  const { siteConfig, tedxBoilerplate } = useSiteData();
  return (
    <>
      <style>{`
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-12);
          align-items: center;
          margin-bottom: var(--space-16);
        }

        .about-image-wrapper {
          position: relative;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .about-image-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(235, 0, 40, 0.15) 0%,
            transparent 60%
          );
          z-index: 1;
          pointer-events: none;
        }

        .about-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          aspect-ratio: 4 / 3;
          display: block;
          transition: transform 0.6s ease;
        }

        .about-image-wrapper:hover img {
          transform: scale(1.03);
        }

        .about-image-accent {
          position: absolute;
          bottom: -8px;
          right: -8px;
          width: 60%;
          height: 60%;
          border: 3px solid var(--ted-red);
          border-radius: var(--radius-xl);
          z-index: -1;
        }

        .about-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .about-theme-label {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: var(--tracking-wider);
          color: var(--ted-red);
        }

        .about-theme-label span {
          width: 24px;
          height: 2px;
          background: var(--ted-red);
          border-radius: var(--radius-full);
        }

        .about-content h3 {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--dark);
          line-height: var(--leading-snug);
        }

        .about-content h3 em {
          color: var(--ted-red);
          font-style: normal;
        }

        .about-content p {
          font-size: var(--text-base);
          line-height: var(--leading-relaxed);
          color: var(--gray-600);
        }

        .about-boilerplate {
          margin-top: var(--space-4);
          padding: var(--space-5);
          background: var(--gray-50);
          border-left: 3px solid var(--ted-red);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }

        .about-boilerplate p {
          font-size: var(--text-sm);
          line-height: var(--leading-relaxed);
          color: var(--gray-600);
        }

        .about-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
          padding-top: var(--space-12);
          border-top: 1px solid var(--gray-200);
        }

        .about-stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-3);
          padding: var(--space-6) var(--space-4);
          background: var(--white);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          transition: transform var(--transition-base), box-shadow var(--transition-base);
        }

        .about-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .about-stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--ted-red), var(--ted-red-light));
          border-radius: var(--radius-lg);
          color: var(--white);
        }

        .about-stat-icon svg {
          width: 24px;
          height: 24px;
        }

        .about-stat-value {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--dark);
          line-height: 1;
        }

        .about-stat-label {
          font-size: var(--text-sm);
          color: var(--gray-600);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: var(--tracking-wide);
        }

        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: var(--space-8);
          }

          .about-image-wrapper img {
            aspect-ratio: 16 / 9;
          }

          .about-stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .about-stats-row {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-4);
          }

          .about-stat-card {
            padding: var(--space-4) var(--space-3);
          }

          .about-stat-value {
            font-size: var(--text-2xl);
          }

          .about-content h3 {
            font-size: var(--text-2xl);
          }
        }
      `}</style>

      <Section
        id="about"
        title={`About ${siteConfig.eventName}`}
        subtitle={`Discover the story behind ${siteConfig.theme} — ${siteConfig.tagline}`}
      >
        <div className="about-grid">
          <AnimatedCard direction="left" delay={100}>
            <div className="about-image-wrapper">
              <img
                src="/images/gallery/cover.jpg"
                alt={`${siteConfig.eventName} ${siteConfig.eventYear} — ${siteConfig.theme}`}
                loading="lazy"
              />
              <div className="about-image-accent" />
            </div>
          </AnimatedCard>

          <AnimatedCard direction="right" delay={200}>
            <div className="about-content">
              <div className="about-theme-label">
                <span />
                {siteConfig.eventYear} Theme
              </div>
              <h3>
                <em>{siteConfig.theme}</em> — Where Culture Meets Innovation
              </h3>
              <p>
                {siteConfig.theme} explores the powerful tension between where we come from
                and where we're going. Our roots ground us in culture, heritage, and community —
                the stories, traditions, and values that shape who we are. Our wings represent
                innovation, ambition, and the bold ideas that carry us forward into new frontiers.
              </p>
              <p>
                At {siteConfig.eventName}, we bring together thinkers, creators, and changemakers
                who embody this duality — people deeply rooted in their communities yet daring
                enough to push boundaries. Through powerful talks, live performances, and
                meaningful conversations, we'll explore how honoring our past can fuel a
                brighter, more innovative future for Dutse and beyond.
              </p>

              <div className="about-boilerplate">
                <p>{tedxBoilerplate.whatIsTedx}</p>
              </div>
            </div>
          </AnimatedCard>
        </div>

        <div className="about-stats-row">
          {stats.map((stat, index) => (
            <AnimatedCard key={stat.label} direction="up" delay={300 + index * 100}>
              <div className="about-stat-card">
                <div className="about-stat-icon">{stat.icon}</div>
                <div className="about-stat-value">{stat.value}</div>
                <div className="about-stat-label">{stat.label}</div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </Section>
    </>
  );
}
