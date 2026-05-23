import { useSiteData } from '../../context/SiteDataContext';
import Section from '../shared/Section';
import AnimatedCard from '../shared/AnimatedCard';

const tierConfig = [
  { key: 'presenting', label: 'Presenting Partner', size: 'large' },
  { key: 'platinum', label: 'Platinum Partners', size: 'medium' },
  { key: 'gold', label: 'Gold Partners', size: 'small' },
  { key: 'community', label: 'Community Partners', size: 'xsmall' },
];

function SponsorCard({ sponsor, size }) {
  const sizeMap = {
    large: { minHeight: 180, fontSize: '1.5rem', padding: '2.5rem 3rem' },
    medium: { minHeight: 140, fontSize: '1.2rem', padding: '2rem 2rem' },
    small: { minHeight: 110, fontSize: '1rem', padding: '1.5rem 1.5rem' },
    xsmall: { minHeight: 90, fontSize: '0.9rem', padding: '1.25rem 1.25rem' },
  };

  const cfg = sizeMap[size];

  return (
    <div
      className="sponsor-card"
      style={{
        minHeight: cfg.minHeight,
        padding: cfg.padding,
      }}
    >
      {sponsor.logo ? (
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          className="sponsor-card__logo"
        />
      ) : (
        <div className="sponsor-card__placeholder" style={{ fontSize: cfg.fontSize }}>
          <span className="sponsor-card__placeholder-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: '1.2em', height: '1.2em' }}
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </span>
          <span className="sponsor-card__placeholder-text">{sponsor.name}</span>
        </div>
      )}
      <span className="sponsor-card__name">{sponsor.name}</span>
    </div>
  );
}

export default function SponsorsSection({ hideHeader = false }) {
  const { sponsors } = useSiteData();
  let globalDelay = 0;

  return (
    <>
      <style>{`
        .sponsors-tier {
          margin-bottom: 3rem;
        }

        .sponsors-tier:last-child {
          margin-bottom: 0;
        }

        .sponsors-tier__label {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--ted-red, #EB0028);
          margin-bottom: 1.25rem;
          text-align: center;
          position: relative;
        }

        .sponsors-tier__label::after {
          content: '';
          display: block;
          width: 40px;
          height: 2px;
          background: var(--ted-red, #EB0028);
          margin: 0.5rem auto 0;
          border-radius: 1px;
          opacity: 0.6;
        }

        .sponsors-tier__grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1.5rem;
        }

        .sponsors-tier__grid--large .sponsor-card {
          min-width: 320px;
          max-width: 480px;
          width: 100%;
        }

        .sponsors-tier__grid--medium .sponsor-card {
          min-width: 220px;
          max-width: 320px;
          flex: 1 1 220px;
        }

        .sponsors-tier__grid--small .sponsor-card {
          min-width: 180px;
          max-width: 260px;
          flex: 1 1 180px;
        }

        .sponsors-tier__grid--xsmall .sponsor-card {
          min-width: 150px;
          max-width: 220px;
          flex: 1 1 150px;
        }

        .sponsor-card {
          background: var(--white, #fff);
          border-radius: var(--radius-xl, 16px);
          box-shadow: var(--shadow-md, 0 2px 12px rgba(0,0,0,0.08));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
          border: 1px solid var(--gray-200, #e5e7eb);
        }

        .sponsor-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg, 0 8px 30px rgba(0,0,0,0.12));
        }

        .sponsor-card__logo {
          max-width: 80%;
          max-height: 80px;
          object-fit: contain;
          margin-bottom: 0.75rem;
        }

        .sponsor-card__placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--gray-600, #6b7280);
          font-weight: 600;
          margin-bottom: 0.75rem;
          text-align: center;
          line-height: 1.3;
        }

        .sponsor-card__placeholder-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5em;
          height: 2.5em;
          border-radius: 50%;
          background: var(--gray-50, #f9fafb);
          color: var(--ted-red, #EB0028);
          opacity: 0.7;
        }

        .sponsor-card__placeholder-text {
          font-weight: 700;
          color: var(--gray-600, #4b5563);
        }

        .sponsor-card__name {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--gray-600, #6b7280);
          text-align: center;
          letter-spacing: 0.02em;
          margin-top: auto;
        }
      `}</style>

      <Section
        id="sponsors"
        title="Our Partners"
        subtitle="TEDxDutse is made possible by the generous support of our community partners who believe in the power of ideas to spark change."
        gray
        hideHeader={hideHeader}
      >
        <div style={{ marginTop: '2rem' }}>
          {tierConfig.map((tier, tierIndex) => {
            const items = sponsors[tier.key];
            if (!items || items.length === 0) return null;

            const tierDelayBase = tierIndex * 150;

            return (
              <div className="sponsors-tier" key={tier.key}>
                <AnimatedCard direction="up" delay={tierDelayBase}>
                  <h3 className="sponsors-tier__label">{tier.label}</h3>
                </AnimatedCard>

                <div className={`sponsors-tier__grid sponsors-tier__grid--${tier.size}`}>
                  {items.map((sponsor, index) => (
                    <AnimatedCard
                      key={sponsor.name}
                      direction="up"
                      delay={tierDelayBase + 100 + index * 80}
                    >
                      <SponsorCard sponsor={sponsor} size={tier.size} />
                    </AnimatedCard>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
