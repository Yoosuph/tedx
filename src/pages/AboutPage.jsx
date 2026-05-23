import { Link } from 'react-router-dom';
import Layout from '../components/shared/Layout';
import AboutSection from '../components/sections/AboutSection';
import { useSiteData } from '../context/SiteDataContext';

export default function AboutPage() {
  const { siteConfig } = useSiteData();
  return (
    <Layout>
      <style>{`
        .about-hero {
          background: var(--dark);
          padding: var(--space-16) var(--space-6);
          text-align: center;
        }

        .about-hero h1 {
          font-size: var(--text-4xl);
          font-weight: 700;
          color: var(--white);
          margin: 0 0 var(--space-3) 0;
          line-height: var(--leading-tight);
        }

        .about-hero h1 em {
          color: var(--ted-red);
          font-style: normal;
        }

        .about-hero p {
          font-size: var(--text-lg);
          color: var(--gray-400);
          margin: 0 auto;
          max-width: 560px;
          line-height: var(--leading-relaxed);
        }

        .about-cta {
          background: var(--gray-50);
          padding: var(--space-16) var(--space-6);
          text-align: center;
        }

        .about-cta h2 {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--dark);
          margin: 0 0 var(--space-3) 0;
        }

        .about-cta p {
          font-size: var(--text-base);
          color: var(--gray-600);
          margin: 0 auto var(--space-8) auto;
          max-width: 480px;
          line-height: var(--leading-relaxed);
        }

        .about-cta-btn {
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

        .about-cta-btn:hover {
          background: #c32418;
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .about-hero {
            padding: var(--space-12) var(--space-4);
          }

          .about-hero h1 {
            font-size: var(--text-3xl);
          }

          .about-cta {
            padding: var(--space-12) var(--space-4);
          }

          .about-cta h2 {
            font-size: var(--text-2xl);
          }
        }
      `}</style>

      {/* Hero Banner */}
      <section className="about-hero">
        <h1>
          About <em>{siteConfig.eventName}</em>
        </h1>
        <p>
          {siteConfig.tagline} — {siteConfig.subtitle}
        </p>
      </section>

      {/* About Content */}
      <AboutSection hideHeader />

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Ready to be part of the experience?</h2>
        <p>
          Join us on {siteConfig.date} at {siteConfig.venueShort} for a day of
          ideas, inspiration, and connection.
        </p>
        <Link to="/tickets" className="about-cta-btn">
          Get Your Tickets
        </Link>
      </section>
    </Layout>
  );
}
