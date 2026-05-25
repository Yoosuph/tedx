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
  const { galleryImages, galleryLoading } = useSiteData();
  const [filter, setFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [downloading, setDownloading] = useState(false);

  const isOpen = lightboxIndex !== null;

  // Filter images based on type
  const filteredImages = galleryImages.filter((image) => {
    if (filter === 'photo') {
      return image.resourceType !== 'video';
    }
    if (filter === 'video') {
      return image.resourceType === 'video';
    }
    return true;
  });

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

  // Keyboard navigation
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

  function getThumbnailUrl(item) {
    if (!item.publicId) return item.src;
    try {
      if (item.resourceType === 'video') {
        return buildVideoPosterUrl({ publicId: item.publicId, width: THUMBNAIL_WIDTH });
      }
      return buildImageUrl({ publicId: item.publicId, format: item.format || 'jpg', width: THUMBNAIL_WIDTH });
    } catch {
      return item.src;
    }
  }

  function getLightboxUrl(item) {
    if (!item.publicId) return item.src;
    try {
      if (item.resourceType === 'video') {
        return buildVideoUrl({ publicId: item.publicId, format: item.format || 'mp4' });
      }
      return buildImageUrl({ publicId: item.publicId, format: item.format || 'jpg', width: LIGHTBOX_WIDTH });
    } catch {
      return item.src;
    }
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

        /* Split-screen Lightbox UI */
        .gallery-lightbox {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(5, 5, 5, 0.85);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: lightboxFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          padding: 1rem;
        }

        @keyframes lightboxFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .gallery-lightbox__container {
          width: 100%;
          max-width: 1180px;
          height: 85vh;
          max-height: 800px;
          background: rgba(18, 18, 18, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          display: flex;
          position: relative;
          animation: lightboxScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes lightboxScaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Lightbox Media Pane */
        .gallery-lightbox__media-pane {
          flex: 1;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          height: 100%;
          overflow: hidden;
        }

        .gallery-lightbox__main-media {
          max-width: 95%;
          max-height: 95%;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          transition: transform 0.3s ease;
        }

        /* Lightbox Sidebar Pane */
        .gallery-lightbox__sidebar {
          width: 320px;
          background: rgba(20, 20, 20, 0.95);
          border-left: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          height: 100%;
          z-index: 2;
        }

        .gallery-lightbox__sidebar-header {
          padding: 1.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .gallery-lightbox__counter {
          color: var(--gray-400, #a3a3a3);
          font-size: 0.8125rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .gallery-lightbox__close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .gallery-lightbox__close-btn:hover {
          background: var(--ted-red, #EB0028);
          border-color: var(--ted-red, #EB0028);
          transform: rotate(90deg);
        }

        .gallery-lightbox__sidebar-content {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          flex: 1;
          overflow-y: auto;
        }

        .gallery-lightbox__info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .gallery-lightbox__badge {
          align-self: flex-start;
          background: rgba(235, 0, 40, 0.15);
          color: var(--ted-red, #EB0028);
          padding: 0.25rem 0.625rem;
          border-radius: 100px;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .gallery-lightbox__title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.4;
          margin: 0;
        }

        .gallery-lightbox__details-list {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          font-size: 0.8125rem;
          color: var(--gray-400, #a3a3a3);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 1.25rem;
        }

        .gallery-lightbox__detail-row {
          display: flex;
          justify-content: space-between;
        }

        .gallery-lightbox__detail-row span:first-child {
          color: var(--gray-500, #737373);
        }

        .gallery-lightbox__actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: auto;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 1.5rem;
        }

        .gallery-action-btn {
          width: 100%;
          padding: 0.875rem 1.25rem;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gallery-action-btn--primary {
          background: var(--ted-red, #EB0028);
          border: none;
          color: #fff;
          box-shadow: 0 4px 15px rgba(235, 0, 40, 0.2);
        }

        .gallery-action-btn--primary:hover {
          background: #c5001f;
          box-shadow: 0 6px 20px rgba(235, 0, 40, 0.3);
          transform: translateY(-1px);
        }

        .gallery-action-btn--secondary {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .gallery-action-btn--secondary:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
        }

        /* Navigation Arrows on Media Viewport */
        .gallery-lightbox__nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          background: rgba(18, 18, 18, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s;
          z-index: 3;
        }

        .gallery-lightbox__nav-arrow:hover {
          background: var(--ted-red, #EB0028);
          border-color: var(--ted-red, #EB0028);
          transform: translateY(-50%) scale(1.1);
        }

        .gallery-lightbox__nav-arrow svg {
          width: 20px;
          height: 20px;
          stroke: currentColor;
          stroke-width: 2.5;
          fill: none;
        }

        .gallery-lightbox__nav-arrow--left { left: 1.5rem; }
        .gallery-lightbox__nav-arrow--right { right: 1.5rem; }

        /* Toast Feedback */
        .gallery-toast {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%) translateY(0);
          background: rgba(10, 10, 10, 0.9);
          border: 1px solid var(--ted-red, #EB0028);
          color: #fff;
          padding: 0.75rem 1.75rem;
          border-radius: 100px;
          font-size: 0.8125rem;
          font-weight: 600;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          z-index: 100000;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          backdrop-filter: blur(8px);
          animation: toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes toastSlideUp {
          from { transform: translateX(-50%) translateY(20px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }

        /* Responsive Mobile Layout for Split Lightbox */
        @media (max-width: 768px) {
          .gallery-lightbox {
            padding: 0.5rem;
          }

          .gallery-lightbox__container {
            flex-direction: column;
            height: 90vh;
            max-height: none;
            border-radius: 18px;
          }

          .gallery-lightbox__media-pane {
            flex: 1;
            min-height: 0; /* Important for flex child sizing */
          }

          .gallery-lightbox__sidebar {
            width: 100%;
            height: auto;
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
          }

          .gallery-lightbox__sidebar-header {
            padding: 1rem 1.25rem;
          }

          .gallery-lightbox__sidebar-content {
            padding: 1.25rem;
            gap: 1.25rem;
            max-height: 250px;
            overflow-y: auto;
          }

          .gallery-lightbox__nav-arrow {
            width: 36px;
            height: 36px;
          }

          .gallery-lightbox__nav-arrow svg {
            width: 16px;
            height: 16px;
          }

          .gallery-lightbox__nav-arrow--left { left: 0.75rem; }
          .gallery-lightbox__nav-arrow--right { right: 0.75rem; }

          .gallery-lightbox__actions {
            margin-top: 0.5rem;
            padding-top: 1rem;
          }
        }
      `}</style>

      {/* Filter Tabs Header */}
      <div className="gallery-filter-container">
        <button
          className={`gallery-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          🔍 All Media
        </button>
        <button
          className={`gallery-filter-btn ${filter === 'photo' ? 'active' : ''}`}
          onClick={() => setFilter('photo')}
        >
          📸 Photos
        </button>
        <button
          className={`gallery-filter-btn ${filter === 'video' ? 'active' : ''}`}
          onClick={() => setFilter('video')}
        >
          🎥 Videos
        </button>
      </div>

      {/* Main Grid View */}
      <Section
        id="gallery"
        title="Event Gallery"
        subtitle="Capturing moments from our inspiring events"
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
                      <img
                        className="gallery-item__media"
                        src={getThumbnailUrl(image)}
                        alt={image.alt || 'TEDxDutse video clip'}
                        loading="lazy"
                      />
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

      {/* Immersive Split-Screen Lightbox Modal */}
      {isOpen && filteredImages[lightboxIndex] && (
        <div
          className="gallery-lightbox"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Interactive media details"
        >
          <div className="gallery-lightbox__container">
            {/* Left Media Viewport */}
            <div className="gallery-lightbox__media-pane">
              <button
                className="gallery-lightbox__nav-arrow gallery-lightbox__nav-arrow--left"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="Previous"
              >
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
              </button>

              {filteredImages[lightboxIndex].resourceType === 'video' ? (
                <video
                  className="gallery-lightbox__video gallery-lightbox__main-media"
                  src={getLightboxUrl(filteredImages[lightboxIndex])}
                  controls
                  autoPlay
                  key={lightboxIndex}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  className="gallery-lightbox__img gallery-lightbox__main-media"
                  src={getLightboxUrl(filteredImages[lightboxIndex])}
                  alt={filteredImages[lightboxIndex].alt || 'TEDxDutse Event moment'}
                  key={lightboxIndex}
                />
              )}

              <button
                className="gallery-lightbox__nav-arrow gallery-lightbox__nav-arrow--right"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="Next"
              >
                <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            {/* Right Information Sidebar Pane */}
            <div className="gallery-lightbox__sidebar" onClick={(e) => e.stopPropagation()}>
              <div className="gallery-lightbox__sidebar-header">
                <span className="gallery-lightbox__counter">
                  {lightboxIndex + 1} of {filteredImages.length}
                </span>
                <button
                  className="gallery-lightbox__close-btn"
                  onClick={closeLightbox}
                  aria-label="Close details"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="gallery-lightbox__sidebar-content">
                <div className="gallery-lightbox__info">
                  <span className="gallery-lightbox__badge">
                    {filteredImages[lightboxIndex].resourceType === 'video' ? '🎥 Video clip' : '📸 Photo'}
                  </span>
                  <h3 className="gallery-lightbox__title">
                    {filteredImages[lightboxIndex].alt || 'TEDxDutse Event Moment'}
                  </h3>
                </div>

                <div className="gallery-lightbox__details-list">
                  <div className="gallery-lightbox__detail-row">
                    <span>Dimensions</span>
                    <span>
                      {filteredImages[lightboxIndex].width && filteredImages[lightboxIndex].height 
                        ? `${filteredImages[lightboxIndex].width} × ${filteredImages[lightboxIndex].height} px` 
                        : 'Unknown'}
                    </span>
                  </div>
                  {filteredImages[lightboxIndex].format && (
                    <div className="gallery-lightbox__detail-row">
                      <span>Format</span>
                      <span style={{ textTransform: 'uppercase' }}>{filteredImages[lightboxIndex].format}</span>
                    </div>
                  )}
                  {filteredImages[lightboxIndex].bytes && (
                    <div className="gallery-lightbox__detail-row">
                      <span>File Size</span>
                      <span>{Math.round(filteredImages[lightboxIndex].bytes / 1024)} KB</span>
                    </div>
                  )}
                  {filteredImages[lightboxIndex].duration && (
                    <div className="gallery-lightbox__detail-row">
                      <span>Duration</span>
                      <span>{Math.round(filteredImages[lightboxIndex].duration)} seconds</span>
                    </div>
                  )}
                  <div className="gallery-lightbox__detail-row">
                    <span>Credit</span>
                    <span>AD Visuals</span>
                  </div>
                </div>

                <div className="gallery-lightbox__actions">
                  <button
                    className="gallery-action-btn gallery-action-btn--primary"
                    onClick={() => downloadMedia(filteredImages[lightboxIndex])}
                    disabled={downloading}
                  >
                    <i className="fa-solid fa-download"></i>
                    {downloading ? 'Downloading...' : 'Download High-Res'}
                  </button>
                  <button
                    className="gallery-action-btn gallery-action-btn--secondary"
                    onClick={() => copyShareLink(filteredImages[lightboxIndex])}
                  >
                    <i className="fa-solid fa-share-nodes"></i> Copy Share Link
                  </button>
                </div>
              </div>
            </div>
          </div>
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
