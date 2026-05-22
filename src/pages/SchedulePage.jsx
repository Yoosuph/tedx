import { Link } from 'react-router-dom';
import Layout from '../components/shared/Layout';
import ScheduleSection from '../components/sections/ScheduleSection';
import { siteConfig } from '../data/siteData';

const pageStyles = `
  .schedule-page-hero {
    background: var(--dark, #111111);
    padding: 5rem 1.5rem 3.5rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .schedule-page-hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at center top, rgba(235, 0, 40, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .schedule-page-hero h1 {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    color: var(--white, #ffffff);
    margin: 0 0 1rem;
    letter-spacing: -0.02em;
    position: relative;
  }

  .schedule-page-hero h1 span {
    color: var(--ted-red, #EB0028);
  }

  .schedule-page-hero .hero-subtitle {
    font-size: 1.1rem;
    color: var(--gray-50, #F9FAFB);
    opacity: 0.8;
    margin: 0;
    position: relative;
    line-height: 1.6;
  }

  .schedule-page-hero .hero-subtitle strong {
    color: var(--ted-red, #EB0028);
    font-weight: 600;
  }

  .schedule-page-info {
    padding: 4rem 1.5rem;
    background: var(--dark-surface, #1a1a1a);
  }

  .schedule-page-info-inner {
    max-width: 1000px;
    margin: 0 auto;
  }

  .schedule-page-info h2 {
    text-align: center;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--white, #ffffff);
    margin: 0 0 2.5rem;
  }

  .info-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .info-card {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 12px;
    padding: 2rem 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .info-card:hover {
    transform: translateY(-3px);
    border-color: rgba(235, 0, 40, 0.3);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  }

  .info-card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(235, 0, 40, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem;
    color: var(--ted-red, #EB0028);
  }

  .info-card-icon svg {
    width: 24px;
    height: 24px;
  }

  .info-card h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--white, #ffffff);
    margin: 0 0 0.75rem;
  }

  .info-card p {
    font-size: 0.95rem;
    color: var(--gray-400, #9CA3AF);
    margin: 0;
    line-height: 1.6;
  }

  .info-card a {
    color: var(--ted-red, #EB0028);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
  }

  .info-card a:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  .schedule-page-cta {
    padding: 4rem 1.5rem;
    text-align: center;
    background: var(--dark, #111111);
  }

  .schedule-page-cta h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--white, #ffffff);
    margin: 0 0 1rem;
  }

  .schedule-page-cta p {
    color: var(--gray-50, #F9FAFB);
    opacity: 0.7;
    margin: 0 0 2rem;
    font-size: 1rem;
  }

  .schedule-page-cta .cta-btn {
    display: inline-block;
    padding: 1rem 2.5rem;
    background: var(--ted-red, #EB0028);
    color: var(--white, #ffffff);
    border-radius: 8px;
    text-decoration: none;
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: 0.02em;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .schedule-page-cta .cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(235, 0, 40, 0.4);
  }

  @media (max-width: 640px) {
    .schedule-page-hero {
      padding: 3.5rem 1rem 2.5rem;
    }

    .info-cards-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default function SchedulePage() {
  return (
    <Layout>
      <style>{pageStyles}</style>

      {/* Hero Banner */}
      <section className="schedule-page-hero">
        <h1>
          Event <span>Schedule</span>
        </h1>
        <p className="hero-subtitle">
          <strong>{siteConfig.date}</strong> &middot; {siteConfig.venueShort}
        </p>
      </section>

      {/* Schedule Section (tabs + timeline) */}
      <ScheduleSection />

      {/* Info Cards */}
      <section className="schedule-page-info">
        <div className="schedule-page-info-inner">
          <h2>Important Information</h2>
          <div className="info-cards-grid">
            {/* Dress Code */}
            <div className="info-card">
              <div className="info-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2 12 5.5 8 2 3.62 3.46 2 8l3.5 3L2 14l1.62 4.54L8 22l4-3.5 4 3.5 4.38-3.46L22 14l-3.5-3L22 8z" />
                </svg>
              </div>
              <h3>Dress Code</h3>
              <p>{siteConfig.dressCode}. Come ready to be inspired and make connections in comfort and style.</p>
            </div>

            {/* Venue */}
            <div className="info-card">
              <div className="info-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3>Venue</h3>
              <p>{siteConfig.venue}</p>
            </div>

            {/* Contact */}
            <div className="info-card">
              <div className="info-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3>Contact</h3>
              <p>
                <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
                <br />
                {siteConfig.contact.phone}
                <br />
                <a href={siteConfig.contact.whatsapp} target="_blank" rel="noopener noreferrer">
                  WhatsApp Group
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="schedule-page-cta">
        <h2>Ready to Experience TEDx{siteConfig.eventName.replace('TEDx', '')}?</h2>
        <p>Secure your seat before tickets sell out.</p>
        <Link to="/tickets" className="cta-btn">
          Get Your Tickets
        </Link>
      </section>
    </Layout>
  );
}
