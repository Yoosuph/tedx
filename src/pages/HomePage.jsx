import { Link } from 'react-router-dom'
import { useScrollProgress } from '../hooks/useScrollAnimation'
import Navbar from '../components/layout/Navbar'
import HeroSection from '../components/sections/HeroSection'
import Footer from '../components/layout/Footer'
import { galleryImages } from '../data/siteData'

const teaserCards = [
  { icon: 'fas fa-info-circle', title: 'About', desc: 'Discover the story behind Roots and Wings', link: '/about' },
  { icon: 'fas fa-microphone', title: 'Speakers', desc: 'Meet our 8 inspiring speakers and performers', link: '/speakers' },
  { icon: 'fas fa-calendar-alt', title: 'Schedule', desc: 'Full day programme from morning to evening', link: '/schedule' },
  { icon: 'fas fa-images', title: 'Gallery', desc: 'Event photos captured by AD Visuals', link: '/gallery' },
  { icon: 'fas fa-handshake', title: 'Partners', desc: 'The organizations making this possible', link: '/sponsors' },
]

const highlights = [
  { number: '8', label: 'Speakers', icon: 'fas fa-microphone' },
  { number: '2', label: 'Performances', icon: 'fas fa-music' },
  { number: '500+', label: 'Attendees', icon: 'fas fa-users' },
  { number: '1', label: 'Day', icon: 'fas fa-calendar-day' },
]

const whyAttend = [
  {
    icon: 'fas fa-lightbulb',
    title: 'Inspiring Ideas',
    desc: 'Hear from thought leaders who are shaping the future of Jigawa and beyond',
  },
  {
    icon: 'fas fa-users',
    title: 'Network & Connect',
    desc: 'Meet like-minded individuals passionate about culture, innovation, and change',
  },
  {
    icon: 'fas fa-rocket',
    title: 'Be Part of History',
    desc: 'Join the movement that brings global TED experience to Dutse for the first time',
  },
  {
    icon: 'fas fa-certificate',
    title: 'Certificate of Attendance',
    desc: 'Receive official recognition for participating in this landmark event',
  },
]

export default function HomePage() {
  const progress = useScrollProgress()
  const previewImages = galleryImages.slice(0, 4)

  return (
    <>
      <style>{`
        /* Highlights Section */
        .highlights-section {
          background: var(--dark);
          padding: 5rem 1.5rem;
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .highlight-card {
          text-align: center;
          padding: 2rem 1rem;
        }

        .highlight-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1rem;
          background: rgba(235, 0, 40, 0.1);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .highlight-icon i {
          font-size: 1.75rem;
          color: var(--ted-red);
        }

        .highlight-number {
          font-size: var(--text-5xl);
          font-weight: 800;
          color: var(--white);
          margin: 0.5rem 0;
          letter-spacing: var(--tracking-tight);
        }

        .highlight-label {
          font-size: var(--text-base);
          color: var(--gray-400);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
        }

        /* Why Attend Section */
        .why-attend-section {
          background: linear-gradient(135deg, var(--dark) 0%, #1a1a1a 100%);
          padding: 5rem 1.5rem;
        }

        .why-attend-heading {
          text-align: center;
          margin-bottom: 3rem;
        }

        .why-attend-heading h2 {
          font-size: var(--text-4xl);
          color: var(--white);
          font-weight: 700;
          margin: 0 0 0.75rem;
        }

        .why-attend-heading p {
          color: var(--gray-400);
          font-size: var(--text-lg);
          margin: 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .why-attend-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .why-card {
          background: var(--dark-surface);
          border: 1px solid var(--dark-border);
          border-radius: var(--radius-xl);
          padding: 2rem;
          transition: all var(--transition-base);
        }

        .why-card:hover {
          border-color: var(--ted-red);
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(235, 0, 40, 0.15);
        }

        .why-card-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          background: rgba(235, 0, 40, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .why-card-icon i {
          font-size: 1.5rem;
          color: var(--ted-red);
        }

        .why-card h3 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--white);
          margin: 0 0 0.75rem;
        }

        .why-card p {
          font-size: var(--text-base);
          color: var(--gray-400);
          line-height: var(--leading-relaxed);
          margin: 0;
        }

        /* Countdown Section */
        .countdown-section {
          background: var(--ted-red);
          padding: 5rem 1.5rem;
          text-align: center;
        }

        .countdown-section h2 {
          font-size: var(--text-4xl);
          color: var(--white);
          font-weight: 700;
          margin: 0 0 0.75rem;
        }

        .countdown-section p {
          color: rgba(255, 255, 255, 0.9);
          font-size: var(--text-lg);
          margin: 0 0 2.5rem;
        }

        .countdown-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          max-width: 600px;
          margin: 0 auto 2.5rem;
        }

        .countdown-item {
          background: rgba(0, 0, 0, 0.2);
          border-radius: var(--radius-lg);
          padding: 1.5rem 1rem;
          backdrop-filter: blur(10px);
        }

        .countdown-number {
          font-size: var(--text-5xl);
          font-weight: 800;
          color: var(--white);
          line-height: 1;
          margin-bottom: 0.5rem;
          font-variant-numeric: tabular-nums;
        }

        .countdown-label {
          font-size: var(--text-sm);
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
        }

        /* Gallery Preview Section */
        .gallery-preview-section {
          background: var(--dark);
          padding: 5rem 1.5rem;
        }

        .gallery-preview-heading {
          text-align: center;
          margin-bottom: 3rem;
        }

        .gallery-preview-heading h2 {
          font-size: var(--text-4xl);
          color: var(--white);
          font-weight: 700;
          margin: 0 0 0.75rem;
        }

        .gallery-preview-heading p {
          color: var(--gray-400);
          font-size: var(--text-lg);
          margin: 0;
        }

        .gallery-preview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          max-width: 1200px;
          margin: 0 auto 2rem;
        }

        .gallery-preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: var(--radius-lg);
          overflow: hidden;
          cursor: pointer;
        }

        .gallery-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-base);
        }

        .gallery-preview-item:hover img {
          transform: scale(1.1);
        }

        .gallery-preview-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
          opacity: 0;
          transition: opacity var(--transition-base);
          display: flex;
          align-items: flex-end;
          padding: 1rem;
        }

        .gallery-preview-item:hover .gallery-preview-overlay {
          opacity: 1;
        }

        .gallery-preview-overlay span {
          color: var(--white);
          font-size: var(--text-sm);
          font-weight: 500;
        }

        .gallery-preview-cta {
          text-align: center;
        }

        .gallery-preview-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--ted-red);
          color: var(--white);
          padding: 1rem 2rem;
          border-radius: var(--radius-full);
          text-decoration: none;
          font-weight: 600;
          font-size: var(--text-base);
          transition: all var(--transition-base);
        }

        .gallery-preview-btn:hover {
          background: var(--white);
          color: var(--ted-red);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
        }

        /* Testimonial Section */
        .testimonial-section {
          background: linear-gradient(135deg, #1a1a1a 0%, var(--dark) 100%);
          padding: 5rem 1.5rem;
          text-align: center;
        }

        .testimonial-quote {
          max-width: 800px;
          margin: 0 auto;
        }

        .testimonial-quote blockquote {
          font-size: var(--text-2xl);
          color: var(--white);
          font-style: italic;
          line-height: var(--leading-relaxed);
          margin: 0 0 2rem;
          position: relative;
        }

        .testimonial-quote blockquote::before {
          content: '"';
          font-size: 6rem;
          color: var(--ted-red);
          position: absolute;
          top: -2rem;
          left: -1rem;
          line-height: 1;
          opacity: 0.3;
        }

        .testimonial-author {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .testimonial-author strong {
          color: var(--white);
          font-size: var(--text-lg);
          font-weight: 600;
        }

        .testimonial-author span {
          color: var(--gray-400);
          font-size: var(--text-sm);
        }

        /* CTA Section */
        .cta-section {
          background: var(--dark);
          padding: 5rem 1.5rem;
          text-align: center;
        }

        .cta-section h2 {
          font-size: var(--text-4xl);
          color: var(--white);
          font-weight: 700;
          margin: 0 0 1rem;
        }

        .cta-section p {
          color: var(--gray-400);
          font-size: var(--text-lg);
          margin: 0 0 2.5rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-btn-large {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--ted-red);
          color: var(--white);
          padding: 1.25rem 3rem;
          border-radius: var(--radius-full);
          text-decoration: none;
          font-weight: 600;
          font-size: var(--text-lg);
          transition: all var(--transition-base);
          box-shadow: 0 8px 20px rgba(235, 0, 40, 0.3);
        }

        .cta-btn-large:hover {
          background: var(--white);
          color: var(--ted-red);
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(255, 255, 255, 0.25);
        }

        /* Discover Section */
        .discover-section {
          background: var(--dark);
          padding: 5rem 1.5rem;
        }

        .discover-heading {
          text-align: center;
          margin-bottom: 3rem;
        }

        .discover-heading h2 {
          font-size: var(--text-4xl);
          color: var(--white);
          font-weight: 700;
          margin: 0 0 0.75rem;
          letter-spacing: var(--tracking-tight);
        }

        .discover-heading p {
          color: var(--gray-400);
          font-size: var(--text-lg);
          margin: 0;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .discover-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .teaser-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          text-decoration: none;
          background: var(--dark-surface);
          border: 1px solid var(--dark-border);
          border-radius: var(--radius-xl);
          padding: 2rem 1.25rem;
          transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .teaser-card:hover {
          transform: translateY(-8px);
          border-color: var(--ted-red);
          box-shadow: var(--shadow-red-lg);
        }

        .teaser-card-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          background: rgba(235, 0, 40, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          transition: background var(--transition-base);
        }

        .teaser-card:hover .teaser-card-icon {
          background: rgba(235, 0, 40, 0.2);
        }

        .teaser-card-icon i {
          font-size: 1.5rem;
          color: var(--ted-red);
        }

        .teaser-card-title {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--white);
          margin: 0 0 0.5rem;
        }

        .teaser-card-desc {
          font-size: var(--text-sm);
          color: var(--gray-400);
          line-height: var(--leading-relaxed);
          margin: 0 0 1rem;
          flex: 1;
        }

        .teaser-card-arrow {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--ted-red);
          transition: gap var(--transition-base);
        }

        .teaser-card:hover .teaser-card-arrow {
          gap: 0.75rem;
        }

        .teaser-card-arrow i {
          font-size: 0.75rem;
          transition: transform var(--transition-base);
        }

        .teaser-card:hover .teaser-card-arrow i {
          transform: translateX(4px);
        }

        @media (min-width: 768px) {
          .highlights-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .why-attend-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .gallery-preview-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .discover-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }

          .discover-heading h2,
          .why-attend-heading h2,
          .gallery-preview-heading h2,
          .cta-section h2 {
            font-size: var(--text-5xl);
          }
        }

        @media (min-width: 1024px) {
          .why-attend-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .discover-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        /* Scroll progress bar styling */
        .scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: var(--ted-red);
          z-index: 9999;
          transition: width 100ms ease-out;
        }
      `}</style>

      {/* Scroll Progress Bar */}
      <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      <Navbar />

      <main>
        <HeroSection />

        {/* Event Highlights */}
        <section className="highlights-section">
          <div className="highlights-grid">
            {highlights.map((item, idx) => (
              <div key={idx} className="highlight-card">
                <div className="highlight-icon">
                  <i className={item.icon} />
                </div>
                <div className="highlight-number">{item.number}</div>
                <div className="highlight-label">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Attend */}
        <section className="why-attend-section">
          <div className="why-attend-heading">
            <h2>Why Attend TEDxDutse?</h2>
            <p>More than just an event — it's an experience that will inspire, connect, and transform</p>
          </div>

          <div className="why-attend-grid">
            {whyAttend.map((item, idx) => (
              <div key={idx} className="why-card">
                <div className="why-card-icon">
                  <i className={item.icon} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery Preview */}
        <section className="gallery-preview-section">
          <div className="gallery-preview-heading">
            <h2>A Glimpse of What's to Come</h2>
            <p>Preview moments from our planning and past events</p>
          </div>

          <div className="gallery-preview-grid">
            {previewImages.map((img, idx) => (
              <Link key={idx} to="/gallery" className="gallery-preview-item">
                <img src={img.src} alt={img.alt} />
                <div className="gallery-preview-overlay">
                  <span>View Gallery</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="gallery-preview-cta">
            <Link to="/gallery" className="gallery-preview-btn">
              Explore Full Gallery <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </section>

        {/* Testimonial */}
        <section className="testimonial-section">
          <div className="testimonial-quote">
            <blockquote>
              TEDxDutse is more than an event — it's a movement. A movement that brings together the brightest minds, the boldest ideas, and the most passionate hearts to shape the future of our community.
            </blockquote>
            <div className="testimonial-author">
              <strong>The TEDxDutse Team</strong>
              <span>Organizers & Visionaries</span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2>Ready to Be Part of Something Extraordinary?</h2>
          <p>Join 500+ attendees for a day of inspiration, innovation, and unforgettable moments</p>
          <Link to="/tickets" className="cta-btn-large">
            Get Your Tickets Now <i className="fas fa-ticket-alt" />
          </Link>
        </section>

        {/* Discover More Section */}
        <section className="discover-section">
          <div className="discover-heading">
            <h2>Discover More</h2>
            <p>Explore everything TEDxDutse: Roots and Wings has to offer</p>
          </div>

          <div className="discover-grid">
            {teaserCards.map((card) => (
              <Link key={card.link} to={card.link} className="teaser-card">
                <div className="teaser-card-icon">
                  <i className={card.icon} />
                </div>
                <h3 className="teaser-card-title">{card.title}</h3>
                <p className="teaser-card-desc">{card.desc}</p>
                <span className="teaser-card-arrow">
                  Explore <i className="fas fa-arrow-right" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
