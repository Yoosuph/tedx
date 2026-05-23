import { Link } from 'react-router-dom';
import Layout from '../components/shared/Layout';
import SpeakersSection from '../components/sections/SpeakersSection';

export default function SpeakersPage() {
  return (
    <Layout>
      <style>{`
        .speakers-hero {
          background: var(--dark, #0a0a0a);
          padding: 5rem 1.5rem 4rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .speakers-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(235,0,40,0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        .speakers-hero__title {
          font-size: clamp(2.25rem, 5vw, 3.5rem);
          font-weight: 800;
          color: var(--white, #fff);
          margin: 0 0 1rem;
          position: relative;
          letter-spacing: -0.02em;
        }

        .speakers-hero__title span {
          color: var(--ted-red, #EB0028);
        }

        .speakers-hero__subtitle {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          color: var(--gray-50, #ccc);
          max-width: 640px;
          margin: 0 auto;
          line-height: 1.7;
          position: relative;
        }

        .speakers-hero__divider {
          width: 60px;
          height: 3px;
          background: var(--ted-red, #EB0028);
          margin: 1.5rem auto 0;
          border-radius: 2px;
        }

        .speakers-intro {
          background: var(--dark, #0a0a0a);
          padding: 2rem 1.5rem 0;
          text-align: center;
        }

        .speakers-intro__text {
          max-width: 720px;
          margin: 0 auto;
          font-size: 1.05rem;
          color: var(--gray-50, #bbb);
          line-height: 1.8;
        }

        .speakers-cta {
          background: var(--dark, #0a0a0a);
          padding: 4rem 1.5rem 5rem;
          text-align: center;
        }

        .speakers-cta__heading {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--white, #fff);
          margin: 0 0 0.75rem;
        }

        .speakers-cta__text {
          font-size: 1.05rem;
          color: var(--gray-50, #aaa);
          margin: 0 0 2rem;
          line-height: 1.6;
        }

        .speakers-cta__btn {
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

        .speakers-cta__btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(235, 0, 40, 0.5);
          background: #d40024;
        }

        .speakers-cta__btn svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          stroke-width: 2.5;
          fill: none;
        }
      `}</style>

      {/* Page Hero Banner */}
      <section className="speakers-hero">
        <h1 className="speakers-hero__title">
          Our <span>Speakers</span>
        </h1>
        <p className="speakers-hero__subtitle">
          A diverse lineup of thought leaders, innovators, and changemakers — each bringing
          unique perspectives and ideas worth spreading to the TEDxDutse stage.
        </p>
        <div className="speakers-hero__divider" />
      </section>

      {/* Intro Paragraph */}
      <div className="speakers-intro">
        <p className="speakers-intro__text">
          Our speakers are selected for their ability to challenge assumptions, spark curiosity,
          and inspire action. From public health advocates to cultural storytellers, each voice
          on our stage contributes to a broader conversation about the ideas shaping our future.
        </p>
      </div>

      {/* Speakers Grid (reuses existing component) */}
      <SpeakersSection />

      {/* CTA - Get Tickets */}
      <section className="speakers-cta">
        <h2 className="speakers-cta__heading">Want to hear them live?</h2>
        <p className="speakers-cta__text">
          Secure your seat and experience these powerful talks in person.
        </p>
        <Link to="/tickets" className="speakers-cta__btn">
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
