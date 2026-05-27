import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/shared/Layout';
import GallerySection from '../components/sections/GallerySection';
import { useSiteData } from '../context/SiteDataContext';
import { Link } from 'react-router-dom';
import {
  buildImageUrl,
  THUMBNAIL_WIDTH,
} from '../lib/cloudinary';

function getPreviewUrl(img) {
  if (!img.publicId) return img.src;
  const url = buildImageUrl({ publicId: img.publicId, format: img.format || 'jpg', width: THUMBNAIL_WIDTH });
  return url || img.src;
}

export default function GalleryPage() {
  const { siteConfig, galleryImages, fetchGalleryImages } = useSiteData();
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    fetchGalleryImages();
  }, [fetchGalleryImages]);

  // Pick random images for the hero carousel — shuffle and take up to 6
  const [heroPool, setHeroPool] = useState([]);

  useEffect(() => {
    if (galleryImages.length === 0) return;
    // Shuffle all images and pick up to 6 for the carousel
    const shuffled = [...galleryImages].sort(() => Math.random() - 0.5);
    setHeroPool(shuffled.slice(0, Math.min(galleryImages.length, 6)));
  }, [galleryImages]);

  // Auto-rotate hero images every 5 seconds
  const advanceHero = useCallback(() => {
    if (heroPool.length > 1) {
      setHeroIndex((prev) => (prev + 1) % heroPool.length);
    }
  }, [heroPool.length]);

  useEffect(() => {
    if (heroPool.length <= 1) return;
    const timer = setInterval(advanceHero, 5000);
    return () => clearInterval(timer);
  }, [advanceHero, heroPool.length]);

  const totalCount = galleryImages.length;

  return (
    <Layout>
      <style>{`
        /* ── Hero Carousel ── */
        .gallery-hero {
          position: relative;
          min-height: 60vh;
          max-height: 80vh;
          background: var(--dark, #0a0a0a);
          overflow: hidden;
        }

        .gallery-hero__slides {
          position: absolute;
          inset: 0;
        }

        .gallery-hero__slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.2s ease-in-out;
          z-index: 1;
        }

        .gallery-hero__slide.active {
          opacity: 1;
          z-index: 2;
        }

        .gallery-hero__slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-hero__overlay {
          position: absolute;
          inset: 0;
          z-index: 3;
          background: linear-gradient(
            to top,
            rgba(10, 10, 10, 0.95) 0%,
            rgba(10, 10, 10, 0.55) 35%,
            rgba(10, 10, 10, 0.15) 70%,
            transparent 100%
          );
          pointer-events: none;
        }

        .gallery-hero__content {
          position: relative;
          z-index: 5;
          width: 100%;
          padding: 4rem 2rem 3rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          height: 100%;
          min-height: 60vh;
          max-height: 80vh;
        }

        .gallery-hero__badge {
          display: inline-block;
          background: rgba(235, 0, 40, 0.15);
          border: 1px solid rgba(235, 0, 40, 0.25);
          color: var(--ted-red, #EB0028);
          padding: 0.35rem 1rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1.25rem;
        }

        .gallery-hero__title {
          font-size: clamp(2.25rem, 5vw, 3.5rem);
          font-weight: 800;
          color: var(--white, #fff);
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .gallery-hero__title span {
          color: var(--ted-red, #EB0028);
        }

        .gallery-hero__subtitle {
          font-size: clamp(1rem, 2.5vw, 1.2rem);
          color: var(--gray-300, #ccc);
          max-width: 600px;
          margin: 0 auto 1.5rem;
          line-height: 1.7;
        }

        .gallery-hero__credit {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--gray-400, #999);
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.4rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.03);
        }

        .gallery-hero__dots {
          display: flex;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .gallery-hero__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }

        .gallery-hero__dot.active {
          background: var(--ted-red, #EB0028);
          transform: scale(1.3);
        }

        @media (max-width: 640px) {
          .gallery-hero {
            min-height: 50vh;
            max-height: 65vh;
          }
          .gallery-hero__content {
            min-height: 50vh;
            max-height: 65vh;
            padding: 3rem 1.25rem 2.5rem;
          }
        }

        /* ── Intro + Credit between hero and gallery ── */
        .gallery-intro {
          background: var(--dark, #0a0a0a);
          padding: 2.5rem 1.5rem 1rem;
          text-align: center;
        }

        .gallery-intro__text {
          max-width: 720px;
          margin: 0 auto;
          font-size: 1rem;
          color: var(--gray-300, #bbb);
          line-height: 1.8;
        }

        .gallery-intro__text strong {
          color: var(--white, #fff);
        }

        /* ── Final CTA ── */
        .gallery-cta {
          background: var(--dark, #0a0a0a);
          padding: 5rem 1.5rem;
          text-align: center;
        }

        .gallery-cta__heading {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          color: var(--white, #fff);
          margin: 0 0 0.75rem;
        }

        .gallery-cta__text {
          font-size: 1.05rem;
          color: var(--gray-400, #aaa);
          margin: 0 0 2rem;
          line-height: 1.6;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
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
          transition: transform 0.25s ease, box-shadow 0.25s ease;
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

      {/* ── Hero Carousel ── */}
      <section className="gallery-hero">
        {heroPool.length > 0 && (
          <div className="gallery-hero__slides">
            {heroPool.map((img, i) => (
              <div
                key={img.id || i}
                className={`gallery-hero__slide ${i === heroIndex ? 'active' : ''}`}
              >
                <img
                  src={getPreviewUrl(img)}
                  alt=""
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        )}
        <div className="gallery-hero__overlay" />
        <div className="gallery-hero__content">
          <span className="gallery-hero__badge">
            {totalCount} moments captured
          </span>
          <h1 className="gallery-hero__title">
            Event <span>Gallery</span>
          </h1>
          <p className="gallery-hero__subtitle">
            Relive {siteConfig.eventName} {siteConfig.eventYear} — every frame
            tells a piece of the {siteConfig.theme} story.
          </p>

          {/* Dots */}
          {heroPool.length > 1 && (
            <div className="gallery-hero__dots">
              {heroPool.map((_, i) => (
                <button
                  key={i}
                  className={`gallery-hero__dot ${i === heroIndex ? 'active' : ''}`}
                  onClick={() => setHeroIndex(i)}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Intro ── */}
      <div className="gallery-intro">
        <p className="gallery-intro__text">
          Captured by the <strong>AD Visuals</strong> photography team, these
          images preserve every detail of {siteConfig.eventName} {siteConfig.eventYear}
          &mdash; from powerful on-stage moments to candid crowd connections.
        </p>
      </div>

      {/* ── Unified Gallery ── */}
      <GallerySection hideHeader />

      {/* ── CTA ── */}
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
