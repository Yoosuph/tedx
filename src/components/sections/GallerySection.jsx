import { useState, useEffect, useCallback } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import Section from '../shared/Section';
import AnimatedCard from '../shared/AnimatedCard';
import {
  buildImageUrl,
  buildVideoUrl,
  buildVideoPosterUrl,
  LIGHTBOX_WIDTH,
  THUMBNAIL_WIDTH,
} from '../../lib/cloudinary';

export default function GallerySection({ hideHeader = false }) {
  const { galleryImages, loading } = useSiteData();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const isOpen = lightboxIndex !== null;

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };
  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goNext = useCallback(() => {
    if (isOpen) {
      setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
    }
  }, [isOpen]);

  const goPrev = useCallback(() => {
    if (isOpen) {
      setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, goNext, goPrev]);

  /**
   * Build the best thumbnail URL for a gallery item.
   * Uses Cloudinary transformations when publicId is available; falls back
   * to the raw `src` for legacy items.
   */
  function getThumbnailUrl(item) {
    if (!item.publicId) return item.src;
    if (item.resourceType === 'video') {
      return buildVideoPosterUrl({ publicId: item.publicId, width: THUMBNAIL_WIDTH });
    }
    return buildImageUrl({ publicId: item.publicId, format: item.format || 'jpg', width: THUMBNAIL_WIDTH });
  }

  /**
   * Build the lightbox URL for a gallery item.
   */
  function getLightboxUrl(item) {
    if (!item.publicId) return item.src;
    if (item.resourceType === 'video') {
      return buildVideoUrl({ publicId: item.publicId, format: item.format || 'mp4' });
    }
    return buildImageUrl({ publicId: item.publicId, format: item.format || 'jpg', width: LIGHTBOX_WIDTH });
  }

  return (
    <>
      <style>{`
        .gallery-masonry {
          columns: 2;
          column-gap: 1rem;
          margin-top: 2.5rem;
        }

        @media (min-width: 768px) {
          .gallery-masonry {
            columns: 3;
            column-gap: 1.25rem;
          }
        }

        @media (min-width: 1024px) {
          .gallery-masonry {
            columns: 4;
            column-gap: 1.5rem;
          }
        }

        .gallery-item {
          break-inside: avoid;
          margin-bottom: 1rem;
          position: relative;
          border-radius: var(--radius-lg, 12px);
          overflow: hidden;
          cursor: pointer;
          box-shadow: var(--shadow-lg, 0 4px 20px rgba(0,0,0,0.15));
          transition: transform var(--transition-base, 0.3s ease), box-shadow var(--transition-base, 0.3s ease);
        }

        @media (min-width: 768px) {
          .gallery-item {
            margin-bottom: 1.25rem;
          }
        }

        @media (min-width: 1024px) {
          .gallery-item {
            margin-bottom: 1.5rem;
          }
        }

        .gallery-item:hover {
          transform: scale(1.03);
          box-shadow: var(--shadow-xl, 0 12px 40px rgba(0,0,0,0.3));
        }

        .gallery-item__media {
          width: 100%;
          display: block;
          aspect-ratio: auto;
          object-fit: cover;
          transition: transform var(--transition-base, 0.3s ease);
        }

        .gallery-item--portrait .gallery-item__media {
          aspect-ratio: 3 / 4;
        }

        .gallery-item--landscape .gallery-item__media {
          aspect-ratio: 4 / 3;
        }

        .gallery-item:hover .gallery-item__media {
          transform: scale(1.08);
        }

        .gallery-item__overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition-base, 0.3s ease);
        }

        .gallery-item:hover .gallery-item__overlay {
          opacity: 1;
        }

        .gallery-item__overlay-icon {
          width: 40px;
          height: 40px;
          color: var(--white, #fff);
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          transform: scale(0.8);
          transition: transform var(--transition-base, 0.3s ease);
        }

        .gallery-item:hover .gallery-item__overlay-icon {
          transform: scale(1);
        }

        /* Video badge on grid thumbnails */
        .gallery-item__video-badge {
          position: absolute;
          bottom: 0.75rem;
          left: 0.75rem;
          background: rgba(0,0,0,0.75);
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          z-index: 2;
          pointer-events: none;
        }
        .gallery-item__video-badge svg {
          width: 12px;
          height: 12px;
          fill: currentColor;
        }

        /* Big play button on video hover */
        .gallery-item__play-icon {
          width: 56px;
          height: 56px;
          color: white;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));
          opacity: 0;
          transition: opacity var(--transition-base, 0.3s ease), transform var(--transition-base, 0.3s ease);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          pointer-events: none;
        }

        .gallery-item--video:hover .gallery-item__play-icon {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        /* Skeleton loading animation */
        .gallery-skeleton {
          pointer-events: none;
        }

        .gallery-skeleton__card {
          break-inside: avoid;
          margin-bottom: 1rem;
          border-radius: var(--radius-lg, 12px);
          overflow: hidden;
          background: rgba(255,255,255,0.04);
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        @media (min-width: 768px) {
          .gallery-skeleton__card {
            margin-bottom: 1.25rem;
          }
        }

        @media (min-width: 1024px) {
          .gallery-skeleton__card {
            margin-bottom: 1.5rem;
          }
        }

        .gallery-skeleton__media {
          width: 100%;
          aspect-ratio: 4 / 3;
          background: linear-gradient(
            110deg,
            rgba(255,255,255,0.04) 30%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0.04) 70%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.8s ease-in-out infinite;
        }

        .gallery-skeleton__card:nth-child(3n) .gallery-skeleton__media {
          aspect-ratio: 3 / 4;
        }

        .gallery-skeleton__card:nth-child(5n) .gallery-skeleton__media {
          aspect-ratio: 1 / 1;
        }

        .gallery-skeleton__card:nth-child(7n) .gallery-skeleton__media {
          aspect-ratio: 16 / 9;
        }

        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* Lightbox */
        .gallery-lightbox {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: galleryFadeIn 0.25s ease;
        }

        @keyframes galleryFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .gallery-lightbox__img {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: var(--radius-lg, 12px);
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
          animation: galleryImgIn 0.3s ease;
        }

        .gallery-lightbox__video {
          max-width: 90vw;
          max-height: 85vh;
          border-radius: var(--radius-lg, 12px);
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
          animation: galleryImgIn 0.3s ease;
          background: black;
        }

        @keyframes galleryImgIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        .gallery-lightbox__close {
          position: absolute;
          top: 1.25rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--white, #fff);
          transition: background var(--transition-base, 0.3s ease), transform var(--transition-base, 0.3s ease);
          z-index: 10;
        }

        .gallery-lightbox__close:hover {
          background: var(--ted-red, #EB0028);
          transform: rotate(90deg);
        }

        .gallery-lightbox__close svg {
          width: 22px;
          height: 22px;
        }

        .gallery-lightbox__nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--white, #fff);
          transition: background var(--transition-base, 0.3s ease), transform var(--transition-base, 0.3s ease);
          z-index: 10;
        }

        .gallery-lightbox__nav:hover {
          background: var(--ted-red, #EB0028);
          transform: translateY(-50%) scale(1.1);
        }

        .gallery-lightbox__nav svg {
          width: 24px;
          height: 24px;
        }

        .gallery-lightbox__nav--prev {
          left: 1rem;
        }

        .gallery-lightbox__nav--next {
          right: 1rem;
        }

        @media (max-width: 640px) {
          .gallery-lightbox__nav {
            width: 38px;
            height: 38px;
          }
          .gallery-lightbox__nav svg {
            width: 18px;
            height: 18px;
          }
          .gallery-lightbox__nav--prev {
            left: 0.5rem;
          }
          .gallery-lightbox__nav--next {
            right: 0.5rem;
          }
        }

        .gallery-lightbox__counter {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.05em;
        }
      `}</style>

      <Section
        id="gallery"
        title="Event Gallery"
        subtitle="Capturing moments from our inspiring events"
        dark
        hideHeader={hideHeader}
      >
        {loading ? (
          <div className="gallery-masonry gallery-skeleton">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="gallery-skeleton__card">
                <div className="gallery-skeleton__media" />
              </div>
            ))}
          </div>
        ) : (
        <div className="gallery-masonry">
          {galleryImages.map((image, index) => (
            <AnimatedCard key={image.id} direction="up" delay={index * 80}>
              <div
                className={`gallery-item gallery-item--${image.orientation}${image.resourceType === 'video' ? ' gallery-item--video' : ''}`}
                onClick={() => openLightbox(index)}
                role="button"
                tabIndex={0}
                aria-label={`View ${image.alt}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                  }
                }}
              >
                {image.resourceType === 'video' ? (
                  <>
                    <img
                      className="gallery-item__media"
                      src={getThumbnailUrl(image)}
                      alt={image.alt}
                      loading="lazy"
                    />
                    {/* Play button icon overlay */}
                    <svg
                      className="gallery-item__play-icon"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <polygon points="5,3 19,12 5,21" fill="white" />
                    </svg>
                    <div className="gallery-item__video-badge">
                      <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      {image.duration ? `${Math.round(image.duration)}s` : 'Video'}
                    </div>
                  </>
                ) : (
                  <img
                    className="gallery-item__media"
                    src={getThumbnailUrl(image)}
                    alt={image.alt}
                    loading="lazy"
                  />
                )}
                <div className="gallery-item__overlay">
                  <svg
                    className="gallery-item__overlay-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {image.resourceType === 'video' ? (
                      <polygon points="5,3 19,12 5,21" />
                    ) : (
                      <>
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </>
                    )}
                  </svg>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
        )}
      </Section>

      {isOpen && (
        <div
          className="gallery-lightbox"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            className="gallery-lightbox__close"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <button
            className="gallery-lightbox__nav gallery-lightbox__nav--prev"
            onClick={goPrev}
            aria-label="Previous image"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {galleryImages[lightboxIndex].resourceType === 'video' ? (
            <video
              className="gallery-lightbox__video"
              src={getLightboxUrl(galleryImages[lightboxIndex])}
              controls
              autoPlay
              key={lightboxIndex}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              className="gallery-lightbox__img"
              src={getLightboxUrl(galleryImages[lightboxIndex])}
              alt={galleryImages[lightboxIndex].alt}
              key={lightboxIndex}
            />
          )}

          <button
            className="gallery-lightbox__nav gallery-lightbox__nav--next"
            onClick={goNext}
            aria-label="Next image"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className="gallery-lightbox__counter">
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </>
  );
}
