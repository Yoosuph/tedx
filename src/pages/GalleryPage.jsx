import Layout from '../components/shared/Layout';
import GallerySection from '../components/sections/GallerySection';
import { useSiteData } from '../context/SiteDataContext';
import { Link } from 'react-router-dom';

export default function GalleryPage() {
  const { siteConfig } = useSiteData();
  return (
    <Layout>
      <style>{`
        .gallery-hero {
          background: var(--dark, #0a0a0a);
          padding: 5rem 1.5rem 4rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .gallery-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(235,0,40,0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        .gallery-hero__title {
          font-size: clamp(2.25rem, 5vw, 3.5rem);
          font-weight: 800;
          color: var(--white, #fff);
          margin: 0 0 1rem;
          position: relative;
          letter-spacing: -0.02em;
        }

        .gallery-hero__title span {
          color: var(--ted-red, #EB0028);
        }

        .gallery-hero__subtitle {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          color: var(--gray-50, #ccc);
          max-width: 640px;
          margin: 0 auto;
          line-height: 1.7;
          position: relative;
        }

        .gallery-hero__divider {
          width: 60px;
          height: 3px;
          background: var(--ted-red, #EB0028);
          margin: 1.5rem auto 0;
          border-radius: 2px;
        }

        .gallery-intro {
          background: var(--dark, #0a0a0a);
          padding: 2rem 1.5rem 0;
          text-align: center;
        }

        .gallery-intro__text {
          max-width: 720px;
          margin: 0 auto;
          font-size: 1.05rem;
          color: var(--gray-50, #bbb);
          line-height: 1.8;
        }

        .gallery-intro__credit {
          display: inline-block;
          margin-top: 0.75rem;
          padding: 0.4rem 1rem;
          background: rgba(235, 0, 40, 0.1);
          border: 1px solid rgba(235, 0, 40, 0.2);
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--ted-red, #EB0028);
          letter-spacing: 0.03em;
        }

        .gallery-cta {
          background: var(--dark, #0a0a0a);
          padding: 4rem 1.5rem 5rem;
          text-align: center;
        }

        .gallery-cta__heading {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--white, #fff);
          margin: 0 0 0.75rem;
        }

        .gallery-cta__text {
          font-size: 1.05rem;
          color: var(--gray-50, #aaa);
          margin: 0 0 2rem;
          line-height: 1.6;
        }

        .gallery-cta__btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2.5rem;
          background: var(--ted-red, #EB0028);
          color: var(--white, #fff);
          font-size: 1.05rem;
          font-weight: 700;
          text-decoration: none;
          border-radius: 9999px;
          transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          box-shadow: 0 4px 20px rgba(235, 0, 40, 0.35);
          letter-spacing: 0.02em;
        }

        .gallery-cta__btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(235, 0, 40, 0.5);
          background: #d40024;
        }

        .gallery-cta__btn svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          stroke-width: 2.5;
          fill: none;
        }
      `}</style>

      {/* Page Hero Banner */}
      <section className="gallery-hero">
        <h1 className="gallery-hero__title">
          Event <span>Gallery</span>
        </h1>
        <p className="gallery-hero__subtitle">
          Capturing the moments that define {siteConfig.eventName} — the energy on stage,
          the connections in the crowd, and the ideas that came alive. Every frame tells a story.
        </p>
        <div className="gallery-hero__divider" />
      </section>

      {/* Intro — AD Visuals Photography Credit */}
      <div className="gallery-intro">
        <p className="gallery-intro__text">
          These images were captured by the <strong>AD Visuals</strong> photography team, whose
          keen eye and creative direction brought the spirit of {siteConfig.eventName} {siteConfig.eventYear} to life.
          From candid backstage moments to powerful on-stage deliveries, their lens preserved
          every detail of the {siteConfig.theme} experience.
        </p>
        <span className="gallery-intro__credit">
          📸 Photography by AD Visuals
        </span>
      </div>

      {/* Gallery Grid + Lightbox (reuses existing component) */}
      <GallerySection />

      {/* CTA - Get Tickets */}
      <section className="gallery-cta">
        <h2 className="gallery-cta__heading">Want to be in the next frame?</h2>
        <p className="gallery-cta__text">
          Join us at {siteConfig.eventName} {siteConfig.eventYear} and become part of the story.
        </p>
        <Link to="/tickets" className="gallery-cta__btn">
          Get Your Ticket
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </section>
    </Layout>
  );
}
