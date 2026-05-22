import { siteConfig } from '../../data/siteData';
import Button from '../shared/Button';

export default function HeroSection() {
  const handleScrollToAbout = (e) => {
    e.preventDefault();
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Extract shorter date for badge (remove "Saturday, " prefix)
  const badgeDate = siteConfig.date.replace(/^Saturday,\s*/, '');
  const badgeLocation = 'Dutse, Jigawa State';

  return (
    <>
      <style>{`
        @keyframes heroFadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroFloat1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -30px) rotate(5deg); }
          50% { transform: translate(-10px, -50px) rotate(-3deg); }
          75% { transform: translate(15px, -20px) rotate(4deg); }
        }

        @keyframes heroFloat2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-25px, -40px) rotate(-5deg); }
          66% { transform: translate(20px, -25px) rotate(3deg); }
        }

        @keyframes heroFloat3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(30px, -35px) rotate(8deg); }
        }

        @keyframes heroBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
          40% { transform: translateY(-12px) translateX(-50%); }
          60% { transform: translateY(-6px) translateX(-50%); }
        }

        @keyframes heroGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: var(--dark, #111111);
        }

        .hero-video {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          transform: translate(-50%, -50%);
          object-fit: cover;
          z-index: 0;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(10, 10, 10, 0.7) 0%,
            rgba(10, 10, 10, 0.9) 100%
          );
          z-index: 1;
        }

        .hero-shapes {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          overflow: hidden;
        }

        .hero-shape {
          position: absolute;
        }

        .hero-shape--circle-1 {
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(235, 0, 40, 0.1);
          top: 10%;
          left: -5%;
          animation: heroFloat1 12s ease-in-out infinite;
        }

        .hero-shape--circle-2 {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(235, 0, 40, 0.1);
          bottom: 15%;
          right: -3%;
          animation: heroFloat2 15s ease-in-out infinite;
        }

        .hero-shape--circle-3 {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: rgba(235, 0, 40, 0.1);
          top: 60%;
          left: 15%;
          animation: heroFloat3 10s ease-in-out infinite;
        }

        .hero-shape--triangle-1 {
          width: 120px;
          height: 120px;
          background: rgba(255, 215, 0, 0.08);
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          top: 20%;
          right: 15%;
          animation: heroFloat2 18s ease-in-out infinite;
        }

        .hero-shape--triangle-2 {
          width: 90px;
          height: 90px;
          background: rgba(255, 215, 0, 0.08);
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          bottom: 25%;
          left: 8%;
          animation: heroFloat1 14s ease-in-out infinite;
        }

        .hero-content {
          position: relative;
          z-index: 3;
          text-align: center;
          padding: 2rem 1.5rem;
          max-width: 900px;
          width: 100%;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.4rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          margin-bottom: 2rem;
          opacity: 0;
          animation: heroFadeInUp 0.8s ease-out 0.2s forwards;
        }

        .hero-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--ted-red, #EB0028);
          box-shadow: 0 0 8px var(--ted-red-glow, rgba(235, 0, 40, 0.3));
          animation: heroGradientShift 2s ease-in-out infinite;
        }

        .hero-title {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0 0 1.2rem 0;
          opacity: 0;
          animation: heroFadeInUp 0.8s ease-out 0.5s forwards;
        }

        .hero-title-roots {
          color: #fff;
        }

        .hero-title-and {
          color: rgba(255, 255, 255, 0.5);
          font-weight: 400;
          font-style: italic;
          font-size: 0.7em;
          margin: 0 0.15em;
        }

        .hero-title-wings {
          background: linear-gradient(135deg, var(--ted-red, #EB0028) 0%, var(--ted-red-light, #FF4757) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 200%;
          animation: heroFadeInUp 0.8s ease-out 0.5s forwards, heroGradientShift 4s ease-in-out infinite;
        }

        .hero-subtitle {
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          color: rgba(255, 255, 255, 0.8);
          max-width: 600px;
          margin: 0 auto 2.5rem auto;
          line-height: 1.5;
          opacity: 0;
          animation: heroFadeInUp 0.8s ease-out 0.8s forwards;
        }

        .hero-ctas {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          opacity: 0;
          animation: heroFadeInUp 0.8s ease-out 1.1s forwards;
        }

        .hero-scroll-indicator {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          opacity: 0;
          animation: heroFadeInUp 0.8s ease-out 1.5s forwards;
        }

        .hero-scroll-indicator span {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .hero-scroll-icon {
          animation: heroBounce 2s ease-in-out infinite;
          position: relative;
          left: 50%;
        }

        .hero-scroll-icon svg {
          width: 24px;
          height: 24px;
          stroke: rgba(255, 255, 255, 0.6);
          stroke-width: 2;
          fill: none;
        }

        @media (max-width: 640px) {
          .hero-badge {
            font-size: 0.8rem;
            padding: 0.5rem 1rem;
          }
          .hero-ctas {
            flex-direction: column;
            gap: 0.75rem;
          }
          .hero-ctas .cta-btn {
            width: 100%;
            max-width: 280px;
          }
          .hero-shape--circle-1 {
            width: 200px;
            height: 200px;
          }
          .hero-shape--circle-2 {
            width: 140px;
            height: 140px;
          }
          .hero-shape--triangle-1 {
            width: 80px;
            height: 80px;
          }
        }
      `}</style>

      <section className="hero-section" id="hero">
        {/* Video Background */}
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/transparent_logo.png"
        >
          <source src="/tedx.mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay */}
        <div className="hero-overlay" />

        {/* Floating Geometric Shapes */}
        <div className="hero-shapes">
          <div className="hero-shape hero-shape--circle-1" />
          <div className="hero-shape hero-shape--circle-2" />
          <div className="hero-shape hero-shape--circle-3" />
          <div className="hero-shape hero-shape--triangle-1" />
          <div className="hero-shape hero-shape--triangle-2" />
        </div>

        {/* Main Content */}
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            {badgeDate} • {badgeLocation}
          </div>

          {/* Title */}
          <h1 className="hero-title">
            <span className="hero-title-roots">Roots</span>
            <span className="hero-title-and"> and </span>
            <span className="hero-title-wings">Wings</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">{siteConfig.tagline}</p>

          {/* CTA Buttons */}
          <div className="hero-ctas">
            <Button variant="primary" size="lg" href="/tickets">
              Get Your Ticket
            </Button>
            <Button variant="ghost" size="lg" href="#about" onClick={handleScrollToAbout}>
              Learn More
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <a
          href="#about"
          className="hero-scroll-indicator"
          onClick={handleScrollToAbout}
          aria-label="Scroll to about section"
        >
          <span>Scroll</span>
          <div className="hero-scroll-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </a>
      </section>
    </>
  );
}
