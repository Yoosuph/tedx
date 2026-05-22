export default function Footer() {
  return (
    <footer id="contact" style={{
      background: '#000', color: '#fff', padding: '5rem 0 2rem', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: 5,
        background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
      }} />
      <div className="container">
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem', marginBottom: '4rem',
        }}>
          <div>
            <h4 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: 600 }}>TEDxDutse</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>Where culture meets innovation. Where Dutse's stories take flight.</p>
            <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>
              TEDxDutse is an independently organized TED event bringing together local voices and global ideas to inspire positive change in our community.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              {[
                { icon: 'fa-instagram', url: 'https://instagram.com/tedxdutse' },
                { icon: 'fa-twitter', url: 'https://twitter.com/tedxdutse' },
                { icon: 'fa-facebook-f', url: 'https://facebook.com/tedxdutse' },
                { icon: 'fa-linkedin-in', url: 'https://linkedin.com/company/tedxdutse' },
              ].map(s => (
                <a key={s.icon} href={s.url} target="_blank" rel="noreferrer" style={{
                  width: 45, height: 45, background: 'rgba(230,43,30,0.1)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.2rem',
                  transition: 'var(--transition)',
                  border: '1px solid rgba(230,43,30,0.3)',
                  color: 'rgba(255,255,255,0.8)',
                }}>
                  <i className={`fab ${s.icon}`} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: 600 }}>Event Details</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}><i className="far fa-calendar-alt" /> November 29, 2025</p>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}><i className="far fa-clock" /> 9:00 AM - 6:00 PM</p>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}><i className="fas fa-map-marker-alt" /> Ahmadu Bello Hall, New secretariat complex, Dutse, Jigawa state!</p>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}><i className="fas fa-globe-africa" /> Dutse, Jigawa State, Nigeria</p>
            <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>
              <strong>Venue Address:</strong><br />
              Banquet Hall<br />
              Government House, Dutse<br />
              Jigawa State, Nigeria
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: 600 }}>Get Involved</h4>
            {[
              { icon: 'fa-ticket-alt', label: 'Get Tickets' },
              { icon: 'fa-hands-helping', label: 'Volunteer' },
              { icon: 'fa-microphone', label: 'Nominate a Speaker' },
              { icon: 'fa-handshake', label: 'Partner with Us' },
              { icon: 'fa-envelope', label: 'Newsletter' },
              { icon: 'fa-camera', label: 'Media Kit' },
            ].map(item => (
              <a key={item.label} href="#" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0.75rem', display: 'block', transition: 'color 0.3s' }}>
                <i className={`fas ${item.icon}`} /> {item.label}
              </a>
            ))}
          </div>

          <div>
            <h4 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: 600 }}>Contact Information</h4>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}><i className="fas fa-envelope" /> <a href="mailto:hello@tedxdutse.com" style={{ color: 'rgba(255,255,255,0.8)' }}>hello@tedxdutse.com</a></p>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}><i className="fas fa-microphone" /> <a href="mailto:speakers@tedxdutse.com" style={{ color: 'rgba(255,255,255,0.8)' }}>speakers@tedxdutse.com</a></p>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}><i className="fas fa-handshake" /> <a href="mailto:sponsors@tedxdutse.com" style={{ color: 'rgba(255,255,255,0.8)' }}>sponsors@tedxdutse.com</a></p>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}><i className="fas fa-phone-alt" /> <a href="tel:+2349033773213" style={{ color: 'rgba(255,255,255,0.8)' }}>Click to call us</a></p>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}><i className="fab fa-whatsapp" /> <a href="https://wa.me/2349033773213" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.8)' }}>WhatsApp Support</a></p>
            <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>
              <strong>Office Hours:</strong><br />
              Monday - Friday: 9:00 AM - 5:00 PM<br />
              Saturday: 10:00 AM - 2:00 PM
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid #333', opacity: 0.7, fontSize: '0.95rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>&copy; 2025 TEDxDutse. This independent TEDx event is operated under license from TED.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', display: 'inline-block' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', display: 'inline-block' }}>Terms of Service</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.8)', display: 'inline-block' }}>Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
