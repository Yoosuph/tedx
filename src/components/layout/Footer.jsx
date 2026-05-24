import { useState } from 'react';
import Swal from 'sweetalert2';
import { useSiteData } from '../../context/SiteDataContext';

const quickLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Speakers', href: '#speakers' },
  { label: 'Schedule', href: '#schedule' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Partners', href: '#partners' },
  { label: 'Certificates', href: '/certificates' },
];

const socialIcons = [
  { icon: 'fab fa-instagram', key: 'instagram', label: 'Instagram' },
  { icon: 'fab fa-twitter', key: 'twitter', label: 'Twitter' },
  { icon: 'fab fa-facebook-f', key: 'facebook', label: 'Facebook' },
  { icon: 'fab fa-linkedin-in', key: 'linkedin', label: 'LinkedIn' },
];

export default function Footer() {
  const { siteConfig, tedxBoilerplate } = useSiteData();
  const [email, setEmail] = useState('');
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    Swal.fire({
      icon: 'success',
      title: 'Subscribed!',
      text: `Thank you for subscribing with ${email}. You'll receive updates about ${siteConfig.eventName}.`,
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#EB0028',
      timer: 4000,
      timerProgressBar: true,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
    });

    setEmail('');
  };

  return (
    <>
      <style>{`
        .footer-wrapper {
          background: #000;
          color: #fff;
          position: relative;
          padding: 4rem 0 0;
        }

        .footer-gradient-border {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #EB0028, #FF4757);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2.5rem;
          margin-bottom: 3rem;
        }

        .footer-heading {
          color: #EB0028;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          position: relative;
          padding-bottom: 0.75rem;
        }

        .footer-heading::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #EB0028, #FF4757);
        }

        .footer-brand-text {
          color: rgba(255,255,255,0.7);
          line-height: 1.7;
          font-size: 0.95rem;
        }

        .footer-social-icons {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .footer-social-btn {
          width: 42px;
          height: 42px;
          border-radius: 9999px;
          border: 1.5px solid #EB0028;
          background: transparent;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          text-decoration: none;
          transition: all 300ms ease;
          cursor: pointer;
        }

        .footer-social-btn:hover {
          background: #EB0028;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(235, 0, 40, 0.4);
        }

        .footer-link {
          display: block;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
          transition: all 300ms ease;
          padding-left: 0;
        }

        .footer-link:hover {
          color: #FF4757;
          padding-left: 8px;
        }

        .footer-link i {
          margin-right: 0.5rem;
          width: 18px;
          text-align: center;
          color: #EB0028;
          font-size: 0.85rem;
        }

        .footer-info-item {
          color: rgba(255,255,255,0.7);
          margin-bottom: 1rem;
          font-size: 0.95rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          line-height: 1.6;
        }

        .footer-info-item i {
          color: #EB0028;
          margin-top: 4px;
          width: 18px;
          text-align: center;
          flex-shrink: 0;
        }

        .footer-info-item a {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: color 300ms ease;
        }

        .footer-info-item a:hover {
          color: #FF4757;
        }

        .footer-newsletter-text {
          color: rgba(255,255,255,0.7);
          font-size: 0.95rem;
          line-height: 1.7;
          margin-bottom: 1.25rem;
        }

        .footer-newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-newsletter-input {
          padding: 0.8rem 1.2rem;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #fff;
          font-size: 0.9rem;
          outline: none;
          transition: all 300ms ease;
          width: 100%;
          box-sizing: border-box;
        }

        .footer-newsletter-input::placeholder {
          color: rgba(255,255,255,0.4);
        }

        .footer-newsletter-input:focus {
          border-color: #EB0028;
          background: rgba(255,255,255,0.12);
          box-shadow: 0 0 0 3px rgba(235, 0, 40, 0.15);
        }

        .footer-newsletter-btn {
          padding: 0.8rem 1.5rem;
          border-radius: 9999px;
          border: none;
          background: linear-gradient(135deg, #EB0028, #FF4757);
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 300ms ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .footer-newsletter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(235, 0, 40, 0.5);
        }

        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 1.75rem 0;
          text-align: center;
          margin-top: 1rem;
        }

        .footer-copyright {
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }

        .footer-disclaimer {
          color: rgba(255,255,255,0.4);
          font-size: 0.8rem;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .footer-wrapper {
            padding: 3rem 0 0;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-newsletter-form {
            flex-direction: column;
          }
        }

        @media (min-width: 769px) {
          .footer-newsletter-form {
            flex-direction: row;
          }

          .footer-newsletter-input {
            flex: 1;
          }
        }
      `}</style>

      <footer className="footer-wrapper" id="contact">
        <div className="footer-gradient-border" />
        <div className="footer-container">
          <div className="footer-grid">
            {/* Column 1: Brand */}
            <div>
              <h4 className="footer-heading">{siteConfig.eventName}</h4>
              <p className="footer-brand-text">
                {siteConfig.tagline}. {siteConfig.subtitle}.
              </p>
              <p className="footer-brand-text" style={{ marginTop: '1rem' }}>
                An independently organized TED event bringing together local voices
                and global ideas to inspire positive change in our community.
              </p>
              <div className="footer-social-icons">
                {socialIcons.map((social) => (
                  <a
                    key={social.key}
                    href={siteConfig.social[social.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn"
                    aria-label={social.label}
                  >
                    <i className={social.icon} />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="footer-heading">Quick Links</h4>
              {quickLinks.map((link) => (
                <a key={link.label} href={link.href} className="footer-link">
                  <i className="fas fa-chevron-right" />
                  {link.label}
                </a>
              ))}
            </div>

            {/* Column 3: Event Info */}
            <div>
              <h4 className="footer-heading">Event Info</h4>
              <div className="footer-info-item">
                <i className="far fa-calendar-alt" />
                <span>{siteConfig.date}</span>
              </div>
              <div className="footer-info-item">
                <i className="fas fa-map-marker-alt" />
                <span>{siteConfig.venueShort}</span>
              </div>
              <div className="footer-info-item">
                <i className="fas fa-envelope" />
                <a href={`mailto:${siteConfig.contact.email}`}>
                  {siteConfig.contact.email}
                </a>
              </div>
              <div className="footer-info-item">
                <i className="fas fa-phone-alt" />
                <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}>
                  {siteConfig.contact.phone}
                </a>
              </div>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h4 className="footer-heading">Newsletter</h4>
              <p className="footer-newsletter-text">
                Stay updated with the latest news, speaker announcements, and
                exclusive content from {siteConfig.eventName}.
              </p>
              <form
                className="footer-newsletter-form"
                onSubmit={handleNewsletterSubmit}
              >
                <input
                  type="email"
                  className="footer-newsletter-input"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address for newsletter"
                />
                <button type="submit" className="footer-newsletter-btn">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <p className="footer-copyright">
              &copy; {currentYear} {siteConfig.eventName}. All rights reserved.
            </p>
            <p className="footer-copyright" style={{ marginTop: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
              Crafted and Designed by <a href="https://www.innovatech-ng.com" target="_blank" rel="noopener noreferrer" style={{ color: '#EB0028', fontWeight: 'bold', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#EB0028'}>InnovaTech</a>
            </p>
            <p className="footer-disclaimer">
              {tedxBoilerplate.footerDisclaimer}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
