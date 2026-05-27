import { useState, useEffect, useCallback, useRef } from 'react';
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

/**
 * Infer the "moment" category from a gallery item's alt text and resource type.
 * Used for narrative section filtering (On Stage / The Crowd / Behind Scenes / Videos).
 */
export function getMomentCategory(item) {
  if (item.resourceType === 'video') return 'videos';
  const alt = (item.alt || '').toLowerCase();
  if (alt.includes('speaker') || alt.includes('talk') || alt.includes('performance')) return 'on-stage';
  if (alt.includes('template') || alt.includes('behind') || alt.includes('team') || alt.includes('backstage')) return 'behind-scenes';
  return 'crowd';
}

const MOMENT_FILTERS = [
  { key: 'all', label: 'All Media', icon: null },
  { key: 'videos', label: 'Videos', icon: null },
];

export default function GallerySection({
  hideHeader = false,
  moment = null,
  showFilter = true,
  maxItems,
  sectionTitle,
  sectionSubtitle,
}) {
  const { galleryImages, galleryLoading } = useSiteData();
  const [filter, setFilter] = useState(moment || 'all');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [downloading, setDownloading] = useState(false);
  const touchStartX = useRef(null);

  const isOpen = lightboxIndex !== null;

  // Filter images — only "all" and "videos" filters remain
  const filteredImages = (() => {
    let images = galleryImages;
    if (filter === 'videos') {
      images = images.filter((img) => img.resourceType === 'video');
    }
    if (maxItems && maxItems > 0) {
      images = images.slice(0, maxItems);
    }
    return images;
  })();

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goNext = useCallback(() => {
    if (isOpen && filteredImages.length > 0) {
      setLightboxIndex((prev) => (prev + 1) % filteredImages.length);
    }
  }, [isOpen, filteredImages.length]);

  const goPrev = useCallback(() => {
    if (isOpen && filteredImages.length > 0) {
      setLightboxIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    }
  }, [isOpen, filteredImages.length]);

  // Keyboard + touch navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };

    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      if (touchStartX.current === null) return;
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(diff) > 50) {
        if (diff < 0) goNext();
        else goPrev();
      }
      touchStartX.current = null;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.overflow = '';
    };
  }, [isOpen, goNext, goPrev]);

  function getThumbnailUrl(item) {
    if (!item.publicId) {
      // For videos without a Cloudinary poster, return null — the grid
      // will show a dark placeholder with the play icon instead of a broken img
      if (item.resourceType === 'video') return null;
      return item.src;
    }
    if (item.resourceType === 'video') {
      const url = buildVideoPosterUrl({ publicId: item.publicId, width: THUMBNAIL_WIDTH });
      return url || null;
    }
    const url = buildImageUrl({ publicId: item.publicId, format: item.format || 'jpg', width: THUMBNAIL_WIDTH });
    return url || item.src;
  }

  function getLightboxUrl(item) {
    if (!item.publicId) return item.src;
    if (item.resourceType === 'video') {
      const url = buildVideoUrl({ publicId: item.publicId, format: item.format || 'mp4' });
      return url || item.src;
    }
    const url = buildImageUrl({ publicId: item.publicId, format: item.format || 'jpg', width: LIGHTBOX_WIDTH });
    return url || item.src;
  }

  // Copy shareable link
  const copyShareLink = (item) => {
    const url = getLightboxUrl(item);
    navigator.clipboard.writeText(url)
      .then(() => {
        setToastMessage('Media link copied to clipboard!');
        setTimeout(() => setToastMessage(''), 2500);
      })
      .catch(() => {
        setToastMessage('Failed to copy link');
        setTimeout(() => setToastMessage(''), 2500);
      });
  };

  // Download media file
  const downloadMedia = async (item) => {
    const url = getLightboxUrl(item);
    const filename = `tedxdutse-${item.resourceType || 'image'}-${item.id || 'file'}`;
    setDownloading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setToastMessage('Download started successfully!');
    } catch (err) {
      console.warn('CORS restriction blocked direct fetch download, opening in new tab instead.');
      window.open(url, '_blank');
      setToastMessage('Opened in new tab for download.');
    } finally {
      setDownloading(false);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <>
      <style>{`
        /* Filter Tabs */
        .gallery-filter-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .gallery-filter-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--gray-400, #a3a3a3);
          padding: 0.625rem 1.5rem;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .gallery-filter-btn:hover {
          color: #fff;
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.06);
        }

        .gallery-filter-btn.active {
          background: var(--ted-red, #EB0028);
          border-color: var(--ted-red, #EB0028);
          color: #fff;
          box-shadow: 0 4px 15px rgba(235, 0, 40, 0.3);
        }

        /* Grid Masonry Layout */
        .gallery-masonry {
          columns: 2;
          column-gap: 1.25rem;
          margin-top: 1.5rem;
        }

        @media (min-width: 768px) {
          .gallery-masonry {
            columns: 3;
            column-gap: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .gallery-masonry {
            columns: 4;
            column-gap: 1.75rem;
          }
        }

        /* Gallery Cards */
        .gallery-item {
          break-inside: avoid;
          margin-bottom: 1.25rem;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: block;
          content-visibility: auto;
          contain-intrinsic-size: auto 300px;
        }

        @media (min-width: 768px) {
          .gallery-item {
            margin-bottom: 1.5rem;
          }
        }

        .gallery-item:hover {
          transform: translateY(-4px) scale(1.02);
          border-color: var(--ted-red, #EB0028);
          box-shadow: 0 15px 30px rgba(235, 0, 40, 0.15), 0 0 0 1px rgba(235, 0, 40, 0.2);
        }

        .gallery-item__media {
          width: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Video placeholder when no poster frame is available */
        .gallery-item__video-placeholder {
          background: linear-gradient(135deg, rgba(235, 0, 40, 0.15), rgba(10, 10, 10, 0.8));
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gallery-item--portrait .gallery-item__media {
          aspect-ratio: 3 / 4;
        }

        .gallery-item--landscape .gallery-item__media {
          aspect-ratio: 4 / 3;
        }

        .gallery-item:hover .gallery-item__media {
          transform: scale(1.06);
        }

        /* Glassmorphism Bottom Details Overlay */
        .gallery-item__details-panel {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(10, 10, 10, 0.95) 0%, rgba(10, 10, 10, 0.7) 60%, transparent 100%);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 1.5rem 1rem 1rem;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .gallery-item:hover .gallery-item__details-panel {
          opacity: 1;
          transform: translateY(0);
        }

        .gallery-item__caption {
          color: #fff;
          font-size: 0.8125rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .gallery-item__meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: var(--gray-400, #a3a3a3);
          font-weight: 500;
        }

        .gallery-item__tag {
          background: rgba(235, 0, 40, 0.15);
          color: var(--ted-red, #EB0028);
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        /* Grid Video Badge & Play Button Overlay */
        .gallery-item__video-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          z-index: 2;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        .gallery-item__video-badge svg {
          width: 10px;
          height: 10px;
          fill: currentColor;
        }

        .gallery-item__play-hover {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--ted-red, #EB0028);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          box-shadow: 0 8px 25px rgba(235, 0, 40, 0.4);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 2;
        }

        .gallery-item__play-hover svg {
          width: 18px;
          height: 18px;
          fill: white;
          transform: translateX(2px);
        }

        .gallery-item:hover .gallery-item__play-hover {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        /* Loading Skeletons */
        .gallery-skeleton__card {
          break-inside: avoid;
          margin-bottom: 1.25rem;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .gallery-skeleton__media {
          width: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0.01) 30%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.01) 70%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.6s ease-in-out infinite;
        }

        .gallery-skeleton__card:nth-child(2n) .gallery-skeleton__media { aspect-ratio: 3 / 4; }
        .gallery-skeleton__card:nth-child(3n) .gallery-skeleton__media { aspect-ratio: 16 / 9; }
        .gallery-skeleton__card:nth-child(5n) .gallery-skeleton__media { aspect-ratio: 4 / 3; }
        .gallery-skeleton__card:nth-child(7n) .gallery-skeleton__media { aspect-ratio: 1 / 1; }

        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }

        /* Full-screen Lightbox */
        .gallery-lightbox {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: lightboxFadeIn 0.25s ease forwards;
        }

        @keyframes lightboxFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Close button — top-right */
        .gallery-lightbox__close {
          position: absolute;
          top: 1.25rem;
          right: 1.5rem;
          z-index: 10;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .gallery-lightbox__close:hover {
          background: var(--ted-red, #EB0028);
          border-color: var(--ted-red, #EB0028);
          transform: rotate(90deg);
        }

        .gallery-lightbox__close svg {
          width: 20px;
          height: 20px;
        }

        /* Main media — centered */
        .gallery-lightbox__main-media {
          max-width: 92vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 4px;
        }

        /* Nav arrows */
        .gallery-lightbox__nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s;
          z-index: 5;
        }

        .gallery-lightbox__nav-arrow:hover {
          background: var(--ted-red, #EB0028);
          border-color: var(--ted-red, #EB0028);
        }

        .gallery-lightbox__nav-arrow svg {
          width: 22px;
          height: 22px;
          stroke: currentColor;
          stroke-width: 2.5;
          fill: none;
        }

        .gallery-lightbox__nav-arrow--left { left: 1rem; }
        .gallery-lightbox__nav-arrow--right { right: 1rem; }

        /* Counter — bottom center */
        .gallery-lightbox__counter {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          background: rgba(0, 0, 0, 0.5);
          padding: 0.4rem 1rem;
          border-radius: 100px;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .gallery-lightbox__nav-arrow {
            width: 38px;
            height: 38px;
          }

          .gallery-lightbox__nav-arrow svg {
            width: 16px;
            height: 16px;
          }

          .gallery-lightbox__nav-arrow--left { left: 0.5rem; }
          .gallery-lightbox__nav-arrow--right { right: 0.5rem; }

          .gallery-lightbox__close {
            width: 38px;
            height: 38px;
            top: 0.75rem;
            right: 0.75rem;
          }

          .gallery-lightbox__close svg {
            width: 16px;
            height: 16px;
          }

          .gallery-lightbox__main-media {
            max-width: 96vw;
            max-height: 85vh;
          }
        }
      `}</style>

      {/* Filter Tabs Header */}
      {showFilter && (
      <div className="gallery-filter-container">
        {MOMENT_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={`gallery-filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>
      )}

      {/* Main Grid View */}
      <Section
        id="gallery"
        title={sectionTitle || "Event Gallery"}
        subtitle={sectionSubtitle || "Capturing moments from our inspiring events"}
        dark
        hideHeader={hideHeader}
      >
        {galleryLoading ? (
          <div className="gallery-masonry">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="gallery-skeleton__card">
                <div className="gallery-skeleton__media" />
              </div>
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--gray-400)' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>No gallery files found in this category.</p>
          </div>
        ) : (
          <div className="gallery-masonry">
            {filteredImages.map((image, index) => (
              <AnimatedCard key={image.id} direction="up" delay={index * 50}>
                <div
                  className={`gallery-item gallery-item--${image.orientation || 'landscape'}${image.resourceType === 'video' ? ' gallery-item--video' : ''}`}
                  onClick={() => openLightbox(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${image.alt || 'Gallery file'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(index);
                    }
                  }}
                >
                  {image.resourceType === 'video' ? (
                    <>
                      {(() => {
                        const poster = getThumbnailUrl(image);
                        return poster ? (
                          <img
                            className="gallery-item__media"
                            src={poster}
                            alt={image.alt || 'TEDxDutse video clip'}
                            loading="lazy"
                          />
                        ) : (
                          <div className="gallery-item__media gallery-item__video-placeholder" />
                        );
                      })()}
                      <div className="gallery-item__video-badge">
                        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        {image.duration ? `${Math.round(image.duration)}s` : 'Video'}
                      </div>
                      <div className="gallery-item__play-hover">
                        <svg viewBox="0 0 24 24">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <img
                      className="gallery-item__media"
                      src={getThumbnailUrl(image)}
                      alt={image.alt || 'TEDxDutse event shot'}
                      loading="lazy"
                    />
                  )}
                  <div className="gallery-item__details-panel">
                    <p className="gallery-item__caption">{image.alt || 'TEDxDutse Event moment'}</p>
                    <div className="gallery-item__meta">
                      <span className="gallery-item__tag">{image.resourceType === 'video' ? 'Video' : 'Photo'}</span>
                      {image.width && image.height && (
                        <span>{image.width} × {image.height}</span>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </Section>

      {/* Full-Screen Lightbox */}
      {isOpen && filteredImages[lightboxIndex] && (
        <div
          className="gallery-lightbox"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close Button */}
          <button
            className="gallery-lightbox__close"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Prev Arrow */}
          {filteredImages.length > 1 && (
            <button
              className="gallery-lightbox__nav-arrow gallery-lightbox__nav-arrow--left"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Previous"
            >
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}

          {/* Media */}
          {filteredImages[lightboxIndex].resourceType === 'video' ? (
            <video
              className="gallery-lightbox__main-media"
              src={getLightboxUrl(filteredImages[lightboxIndex])}
              controls
              autoPlay
              key={lightboxIndex}
            />
          ) : (
            <img
              className="gallery-lightbox__main-media"
              src={getLightboxUrl(filteredImages[lightboxIndex])}
              alt={filteredImages[lightboxIndex].alt || 'Gallery image'}
              key={lightboxIndex}
            />
          )}

          {/* Next Arrow */}
          {filteredImages.length > 1 && (
            <button
              className="gallery-lightbox__nav-arrow gallery-lightbox__nav-arrow--right"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Next"
            >
              <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          )}

          {/* Counter */}
          {filteredImages.length > 1 && (
            <div className="gallery-lightbox__counter">
              {lightboxIndex + 1} / {filteredImages.length}
            </div>
          )}
        </div>
      )}

      {/* Action Notification Toast */}
      {toastMessage && (
        <div className="gallery-toast">
          <i className="fa-solid fa-circle-check" style={{ color: 'var(--ted-red)' }}></i>
          {toastMessage}
        </div>
      )}
    </>
  );
}
