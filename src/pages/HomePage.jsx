import { Link } from 'react-router-dom'
import { useScrollProgress } from '../hooks/useScrollAnimation'
import Navbar from '../components/layout/Navbar'
import HeroSection from '../components/sections/HeroSection'
import Footer from '../components/layout/Footer'

const teaserCards = [
  { icon: 'fas fa-info-circle', title: 'About', desc: 'Discover the story behind Roots and Wings', link: '/about' },
  { icon: 'fas fa-microphone', title: 'Speakers', desc: 'Meet our 8 inspiring speakers and performers', link: '/speakers' },
  { icon: 'fas fa-calendar-alt', title: 'Schedule', desc: 'Full day programme from morning to evening', link: '/schedule' },
  { icon: 'fas fa-images', title: 'Gallery', desc: 'Event photos captured by AD Visuals', link: '/gallery' },
  { icon: 'fas fa-handshake', title: 'Partners', desc: 'The organizations making this possible', link: '/sponsors' },
]

export default function HomePage() {
  const progress = useScrollProgress()

  return (
    <>
      <style>{`
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
          .discover-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }

          .discover-heading h2 {
            font-size: var(--text-5xl);
          }
        }

        @media (min-width: 1024px) {
          .discover-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        /* Scroll progress bar styling (defined globally but ensure it's visible) */
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
