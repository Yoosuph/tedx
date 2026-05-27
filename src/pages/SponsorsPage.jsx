import { Link } from 'react-router-dom';
import Layout from '../components/shared/Layout';
import SponsorsSection from '../components/sections/SponsorsSection';
import { useSiteData } from '../context/SiteDataContext';

export default function SponsorsPage() {
  const { siteConfig } = useSiteData();
  return (
    <Layout>
      <style>{`
        .sponsors-hero {
          background: var(--dark);
          padding: var(--space-16) var(--space-6);
          text-align: center;
        }

        .sponsors-hero h1 {
          font-size: var(--text-4xl);
          font-weight: 700;
          color: var(--white);
          margin: 0 0 var(--space-3) 0;
          line-height: var(--leading-tight);
        }

        .sponsors-hero h1 em {
          color: var(--ted-red);
          font-style: normal;
        }

        .sponsors-hero p {
          font-size: var(--text-lg);
          color: var(--gray-400);
          margin: 0 auto;
          max-width: 600px;
          line-height: var(--leading-relaxed);
        }

        .become-partner {
          background: var(--gray-50);
          padding: var(--space-16) var(--space-6);
          text-align: center;
        }

        .become-partner h2 {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--dark);
          margin: 0 0 var(--space-3) 0;
        }

        .become-partner p {
          font-size: var(--text-base);
          color: var(--gray-600);
          margin: 0 auto var(--space-8) auto;
          max-width: 540px;
          line-height: var(--leading-relaxed);
        }

        .become-partner__btn {
          display: inline-block;
          padding: var(--space-4) var(--space-8);
          background: var(--ted-red);
          color: var(--white);
          font-size: var(--text-base);
          font-weight: 600;
          text-decoration: none;
          border-radius: var(--radius-lg);
          transition: background var(--transition-base), transform var(--transition-base);
        }

        .become-partner__btn:hover {
          background: #c32418;
          transform: translateY(-2px);
        }

        .sponsors-cta {
          background: var(--dark);
          padding: var(--space-16) var(--space-6);
          text-align: center;
        }

        .sponsors-cta h2 {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--white);
          margin: 0 0 var(--space-3) 0;
        }

        .sponsors-cta p {
          font-size: var(--text-base);
          color: var(--gray-400);
          margin: 0 auto var(--space-8) auto;
          max-width: 480px;
          line-height: var(--leading-relaxed);
        }

        .sponsors-cta-btn {
          display: inline-block;
          padding: var(--space-4) var(--space-8);
          background: var(--ted-red);
          color: var(--white);
          font-size: var(--text-base);
          font-weight: 600;
          text-decoration: none;
          border-radius: var(--radius-lg);
          transition: background var(--transition-base), transform var(--transition-base);
        }

        .sponsors-cta-btn:hover {
          background: #c32418;
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .sponsors-hero {
            padding: var(--space-12) var(--space-4);
          }

          .sponsors-hero h1 {
            font-size: var(--text-3xl);
          }

          .become-partner {
            padding: var(--space-12) var(--space-4);
          }

          .become-partner h2 {
            font-size: var(--text-2xl);
          }

          .sponsors-cta {
            padding: var(--space-12) var(--space-4);
          }

          .sponsors-cta h2 {
            font-size: var(--text-2xl);
          }
        }
      `}</style>

      {/* Hero Banner */}
      <section className="sponsors-hero">
        <h1>
          Our <em>Partners</em>
        </h1>
        <p>
          TEDxDutse is powered by the generous support of organizations and
          individuals who believe in spreading ideas that matter. Together, we
          make this experience possible for our community.
        </p>
      </section>

      {/* Sponsors Section (tiered layout) */}
      <SponsorsSection hideHeader />

      {/* Become a Partner */}
      <section className="become-partner">
        <h2>Interested in partnering with us?</h2>
        <p>
          We offer a range of sponsorship opportunities — from presenting
          partnerships to community-level support. Your contribution helps us
          bring world-class speakers and transformative ideas to Dutse, Jigawa
          State. Reach out to learn about packages, visibility benefits, and how
          your brand can be part of something meaningful.
        </p>
        <a
          href={`mailto:sponsors@tedxdutse.com?subject=Sponsorship%20Inquiry%20%E2%80%94%20TEDxDutse%20${siteConfig.eventYear}`}
          className="become-partner__btn"
        >
          Become a Partner
        </a>
      </section>

      {/* Bottom CTA */}
      <section className="sponsors-cta">
        <h2>Don't miss the event</h2>
        <p>
          Join us on {siteConfig.date} at {siteConfig.venueShort} for a day of
          ideas worth spreading.
        </p>
        <Link to="/tickets" className="sponsors-cta-btn">
          Get Your Tickets
        </Link>
      </section>
    </Layout>
  );
}
