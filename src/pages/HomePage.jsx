import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Particles from '../components/Particles'
import Footer from '../components/Footer'

const homeStyles = `
.speaker-card { text-align: center; transition: var(--transition); perspective: 1000px; }
.speaker-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.8s; transform-style: preserve-3d; }
.speaker-card:hover .speaker-card-inner { transform: rotateY(180deg); }
.speaker-card-front, .speaker-card-back { position: relative; width: 100%; height: 100%; backface-visibility: hidden; background: #fff; border-radius: var(--border-radius-lg); box-shadow: var(--shadow-lg); padding: 2rem; }
.speaker-card-back { position: absolute; top: 0; left: 0; transform: rotateY(180deg); display: flex; flex-direction: column; justify-content: center; }
.speaker-card:hover .speaker-image img { transform: scale(1.05); }
.speaker-touch-hint { position: absolute; bottom: 1rem; right: 1rem; background: rgba(230,43,30,0.9); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 500; display: none; align-items: center; gap: 0.5rem; z-index: 10; pointer-events: none; animation: pulse 2s ease-in-out infinite; }
@media (hover: none) and (pointer: coarse) { .speaker-touch-hint { display: flex; } }
@media (hover: hover) and (pointer: fine) { .speaker-touch-hint { display: none; } }
@keyframes pulse { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
.feature-card { background: #fff; padding: 3rem 2rem; border-radius: var(--border-radius-lg); text-align: center; box-shadow: var(--shadow-lg); transition: var(--transition); border: 1px solid rgba(230,43,30,0.1); position: relative; overflow: hidden; }
.feature-card::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 5px; background: linear-gradient(90deg, var(--primary), var(--primary-light)); transform: scaleX(0); transform-origin: left; transition: transform 0.5s ease; }
.feature-card:hover { transform: translateY(-8px); box-shadow: 20px 40px rgba(0,0,0,0.15); }
.feature-card:hover::after { transform: scaleX(1); }
.feature-icon { font-size: 3.5rem; margin-bottom: 2rem; background: linear-gradient(135deg, var(--primary), var(--primary-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.concept-card { background: #fff; padding: 3rem 2rem; border-radius: var(--border-radius-lg); box-shadow: var(--shadow-lg); text-align: center; transition: var(--transition); border: 1px solid rgba(230,43,30,0.1); position: relative; overflow: hidden; }
.concept-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: linear-gradient(90deg, var(--primary), var(--primary-light)); }
.concept-card:hover { transform: translateY(-12px); box-shadow: var(--shadow-xl); }
.sponsor-logo { height: 100px; background: #fff; border-radius: var(--border-radius); display: flex; align-items: center; justify-content: center; transition: var(--transition); border: 2px solid transparent; padding: 1rem; box-shadow: var(--shadow-sm); }
.sponsor-logo:hover { border-color: var(--primary); transform: translateY(-5px); box-shadow: var(--shadow-md); }
.sponsor-logo img { max-height: 60px; max-width: 80%; object-fit: contain; filter: grayscale(100%); opacity: 0.7; transition: var(--transition); }
.sponsor-logo:hover img { filter: grayscale(0%); opacity: 1; }
`

function useScrollAnimation() {
  useEffect(() => {
    const els = document.querySelectorAll('.animate')
    if (els.length === 0) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  })
}

function SectionTitle({ children, dark }) {
  return (
    <h2 className="section-title animate slide-up" style={{
      textAlign: 'center',
      fontSize: 'clamp(2rem, 6vw, 3.5rem)',
      marginBottom: '5rem',
      fontWeight: 700,
      letterSpacing: '-1px',
      position: 'relative',
      display: 'inline-block',
      color: dark ? '#fff' : 'var(--text)',
    }}>
      {children}
    </h2>
  )
}

export default function HomePage() {
  useScrollAnimation()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = document.querySelector('.scroll-progress')
    if (!el) return
    const onScroll = () => {
      const sh = document.documentElement.scrollHeight - window.innerHeight
      el.style.width = `${(window.scrollY / sh) * 100}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('.feature-card, .concept-card, .speaker-card')
    els.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'
      })
      card.addEventListener('mouseleave', () => {
        card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'
      })
    })
  })

  useEffect(() => {
    document.body.style.opacity = '0'
    document.body.style.transition = 'opacity 0.5s ease'
    setTimeout(() => { document.body.style.opacity = '1' }, 50)
  }, [])

  return (
    <>
      <style>{homeStyles}</style>
      <div className="scroll-progress" />
      <Navbar />

      {/* Hero */}
      <section id="home" style={{
        height: '100vh', minHeight: 800,
        background: 'radial-gradient(ellipse at center, #0a0a23 0%, #000000 70%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', color: '#fff', position: 'relative',
        overflow: 'hidden', paddingTop: 80,
      }}>
        <Particles />
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px', opacity: 0.15, zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(45deg, rgba(230,43,30,0.1) 0%, transparent 50%, rgba(255,107,107,0.1) 100%)',
          zIndex: 2,
        }} />
        <div style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          maxWidth: 1000, padding: '0 2rem', position: 'relative', zIndex: 10,
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5.5rem)', marginBottom: '1.5rem',
            fontWeight: 700, lineHeight: 1.1, letterSpacing: '-1.5px',
            textShadow: '0 5px 15px rgba(0,0,0,0.3)',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 50%, var(--primary) 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientShift 4s ease-in-out infinite',
              fontWeight: 700,
            }}>TEDx</span><span style={{ animation: 'float 4s ease-in-out infinite', display: 'inline-block' }}>Dutse</span>{' '}
            <span style={{ animation: 'float 6s ease-in-out infinite', display: 'inline-block' }}>2025</span>
          </h1>
          <div style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '1.5rem',
            fontStyle: 'italic', fontWeight: 300,
            background: 'linear-gradient(135deg, var(--accent), #ffb347)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', opacity: 0.9,
            textShadow: '0 2px 5px rgba(0,0,0,0.2)',
            animation: 'float 6s ease-in-out infinite',
          }}>
            Roots and Wings
          </div>
          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', marginBottom: '3rem',
            opacity: 0.85, fontWeight: 300, lineHeight: 1.6,
            maxWidth: 600, marginLeft: 'auto', marginRight: 'auto',
            color: '#fff',
          }}>
            Where culture meets innovation.<br />
            Where Dutse's stories take flight.
          </p>
          <div style={{
            display: 'flex', gap: '1.5rem', justifyContent: 'center',
            flexWrap: 'wrap', marginBottom: '3rem',
          }}>
            <a href="https://tickets.tedxdutse.com" target="_blank" rel="noreferrer" className="cta-btn cta-primary floating">
              <i className="fas fa-ticket-alt" /> Get Ticket
            </a>
            <a href="#volunteer" className="cta-btn cta-secondary floating-slow">
              <i className="fas fa-hands-helping" /> Volunteer
            </a>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '2rem',
            flexWrap: 'wrap',
          }}>
            {[
              { icon: 'far fa-calendar-alt', text: 'November 29, 2025', cls: 'floating' },
              { icon: 'fas fa-map-marker-alt', text: 'Ahmadu Bello Hall, New secretariat complex, Dutse, Jigawa state!', cls: 'floating-slow' },
              { icon: 'far fa-clock', text: '9:00 AM - 6:00 PM', cls: 'floating-fast' },
            ].map((d, i) => (
              <div key={i} className={d.cls} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                fontSize: '1.1rem', background: 'rgba(255,255,255,0.1)',
                padding: '1rem 1.5rem', borderRadius: 'var(--border-radius-xl)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'var(--transition)', color: '#fff',
              }}>
                <i className={d.icon} />
                <span>{d.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="section section-dark" style={{ marginTop: 80 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <SectionTitle dark>TEDxDutse</SectionTitle>
          <p className="animate fade-in" style={{
            fontSize: '1.2rem', opacity: 0.9, maxWidth: 600,
            margin: '0 auto 3rem', textAlign: 'center', color: '#fff',
          }}>
            Your seat is waiting, and your idea might just be next!
          </p>
          <div className="animate fade-in">
            <video width="100%" controls style={{
              maxWidth: 800, borderRadius: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}>
              <source src="/tedx.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section section-gray" id="about">
        <div className="container">
          <SectionTitle>About TEDxDutse</SectionTitle>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '5rem', alignItems: 'center', marginBottom: '6rem',
          }}>
            <div className="animate slide-left" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 600 }}>A Spark in the Heart of Dutse</h3>
              <p>In the heart of Dutse, where tradition meets ambition, a spark is igniting. TEDxDutse is that spark — a stage for voices that deserve to be heard, ideas that demand to be shared, and dreams bold enough to change the world.</p>
              <p>We are a community of dreamers, doers, and difference-makers. We believe that every powerful idea has two parts: <strong>Roots</strong> — the values, culture, and history that ground us, and <strong>Wings</strong> — the courage and innovation to rise beyond the horizon.</p>
            </div>
            <div className="animate slide-right" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 600 }}>More Than an Event</h3>
              <p>On November 29th, 2025, Dutse will join the global TEDx network — a family of events in more than 170 countries — to celebrate ideas worth spreading. Our stage will welcome thinkers, creators, innovators, and change-makers.</p>
              <p>But TEDxDutse is more than an event. It's a movement. It's the moment we choose to see the future not as something we wait for, but as something we build together.</p>
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem', marginTop: '5rem',
          }}>
            {[
              { icon: 'fas fa-seedling', title: 'Roots', desc: 'Our culture, our identity, our people, our stories. The foundation that grounds us and gives us strength to grow.' },
              { icon: 'fas fa-rocket', title: 'Wings', desc: 'Innovation, ambition, ideas that take us beyond our limits. The courage to soar and reach new heights.' },
            ].map((c, i) => (
              <div key={i} className={`animate ${i === 0 ? 'slide-left' : 'slide-right'} concept-card`}>
                <div className="float" style={{
                  fontSize: '4rem', marginBottom: '2rem',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  <i className={c.icon} />
                </div>
                <h4 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text)', fontWeight: 600 }}>{c.title}</h4>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-light)' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Speakers */}
      <section className="section" id="speakers">
        <div className="container" style={{ textAlign: 'center' }}>
          <SectionTitle>Featured Speakers</SectionTitle>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '3rem', marginTop: '5rem',
          }}>
            {[
              { name: 'Dr. Hauwa Babura', title: 'CEO, Teach Africa Today', bio: 'Transformative leader, educator, and advocate for social justice and women\'s empowerment. Technical Adviser on Basic Education to the Governor of Jigawa State, working on reforms that expand access to quality education and empower marginalized communities.' },
              { name: 'Dr Yana SLU', title: 'Writer & Spoken-Word Artist', bio: 'Writer, poet, storyteller, and spoken-word artist. Author of more than 60 works, including essays, poems, and blog posts. Through her writing and performances, she inspires young people to embrace creativity, resilience, and self-expression.' },
              { name: 'Prof. Haruna Musa', title: 'Polymer Chemist & Education Administrator', bio: 'Nigerian academic, polymer chemist, and education administrator. Executive Chairman of the Jigawa State Universal Basic Education Board (SUBEB). Known for his leadership in education development and reform.' },
              { name: 'Nasiruddeen Shuraym (nshuraim)', title: 'Former Governor & Statesman', bio: 'Nigerian politician, statesman, and former Governor of Jigawa State (2007-2015). Former Minister of Foreign Affairs (1999-2003). Initiated landmark projects in infrastructure, health, and education, transforming Jigawa into a model for governance in Northern Nigeria.' },
              { name: 'Husna Ma\'ab Baffa', title: 'Entrepreneur & Publisher', bio: 'Nigerian entrepreneur, interior designer, TV presenter, and publisher. Founder of L Magazine and CEO of a thriving interior design firm. TV host, writer, and advocate for women in business, celebrated for her creativity and innovation in media and design.' },
              { name: 'Eng. Mustapha Habu', title: 'Former Minister of Education', bio: 'Nigerian educationist and former Minister of Education (2010-2013). Former Commissioner for Education, Science, and Technology in Jigawa State. Prioritized girl-child education, curriculum development, and innovation in teaching and learning.' },
              { name: 'Prof. Abdallah Uba Adamu', title: 'Academic & Media Scholar', bio: 'Nigerian academic, educator, publisher, and media scholar. Holds double professorships in Science Education and Media/Cultural Communication. Former Vice-Chancellor of the National Open University of Nigeria (NOUN). Research focuses on transnational media flows, Hausa popular culture, and digital humanities.' },
              { name: 'Dr Abubakar Yahaya Kazaure', title: 'Medical Doctor / Entrepreneur', bio: 'Dr. Abubakar Yahaya Kazaure is a 30-year-old medical professional dedicated to promoting health, hygiene, and community well-being. He is the CEO and Founder of Dr. Spin Cleaning Service, where he applies his expertise and leadership to set high standards of cleanliness and excellence.' },
              { name: 'Amina Sagir Musa', title: 'Youth Volunteer', bio: 'Inspiring 11-year-old volunteer with Maina and Kids, actively contributing to community service and child-focused initiatives. Passionate about helping others, promoting kindness, and encouraging her peers to engage in learning and social impact.' },
              { name: 'Khadija Adam (Fingyles)', title: 'Poet & Youth Advocate', bio: 'Poet, spoken-word artist, and youth advocate. Performs on numerous stages, using her art to address themes of identity, resilience, and social change. Inspires young people through advocacy for education, creativity, and empowerment.' },
            ].map((s, i) => (
              <div key={i} className="animate fade-in speaker-card" style={{
                transitionDelay: `${i * 0.1}s`,
              }}>
                <div className="speaker-card-inner">
                  <div className="speaker-card-front">
                    <div className="speaker-image" style={{
                      width: 200, height: 200, borderRadius: '50%',
                      margin: '0 auto 2rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', position: 'relative',
                      boxShadow: 'var(--shadow-md)', border: '5px solid #fff',
                    }}>
                      <img src="" alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition)' }} />
                    </div>
                    <h3 className="speaker-name" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>{s.name}</h3>
                    <p className="speaker-title" style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: 0, fontWeight: 500 }}>{s.title}</p>
                  </div>
                  <div className="speaker-card-back">
                    <p className="speaker-bio" style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-light)' }}>{s.bio}</p>
                  </div>
                  <div className="speaker-touch-hint">
                    <i className="fas fa-hand-pointer" />
                    Tap to flip
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="section section-dark" id="schedule">
        <div className="container" style={{ textAlign: 'center' }}>
          <SectionTitle dark>Event Schedule</SectionTitle>
          <div style={{ maxWidth: 800, margin: '5rem auto 0', position: 'relative', textAlign: 'left' }}>
            <div style={{
              position: 'absolute', top: 0, left: 50, height: '100%', width: 3,
              background: 'rgba(255,255,255,0.2)',
            }} />
            {[
              { time: '9:00 AM', title: 'Registration & Welcome', desc: 'Check-in, networking breakfast, and welcome reception' },
              { time: '10:00 AM', title: 'Opening Ceremony', desc: 'Official opening and introduction to "Roots and Wings" theme' },
              { time: '10:30 AM', title: 'Session 1: Roots', desc: 'Exploring cultural heritage, traditional knowledge, and community foundations' },
              { time: '12:30 PM', title: 'Lunch & Networking', desc: 'Cultural cuisine and collaborative discussions' },
              { time: '2:00 PM', title: 'Session 2: Wings', desc: 'Innovation, technology, and future-focused solutions' },
              { time: '4:00 PM', title: 'Panel Discussion', desc: 'Bridging tradition and innovation for sustainable development' },
              { time: '5:30 PM', title: 'Closing & Reception', desc: 'Final thoughts, community commitments, and celebration' },
            ].map((item, i) => (
              <div key={i} className={`animate ${i % 2 === 0 ? 'slide-left' : 'slide-right'}`} style={{
                display: 'flex', gap: '2.5rem', marginBottom: '3rem',
                padding: '2rem', background: 'rgba(255,255,255,0.1)',
                borderRadius: 'var(--border-radius-lg)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: '2.5rem', left: '-1.5rem',
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'var(--accent)',
                  border: '5px solid var(--secondary)',
                  boxShadow: '0 0 0 2px var(--accent)',
                }} />
                <div style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--accent)', minWidth: 120 }}>{item.time}</div>
                <div>
                  <h4 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 600, color: '#fff' }}>{item.title}</h4>
                  <p style={{ opacity: 0.9, lineHeight: 1.6, color: '#fff' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TEDxDutse */}
      <section className="section section-gray" id="features">
        <div className="container" style={{ textAlign: 'center' }}>
          <SectionTitle>Why TEDxDutse?</SectionTitle>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem', marginTop: '5rem',
          }}>
            {[
              { icon: 'fa-lightbulb', title: 'Ideas Worth Spreading', desc: 'Discover groundbreaking ideas from local and global thought leaders that can change how you see the world and your community.' },
              { icon: 'fa-globe-africa', title: 'Global Community', desc: 'Join a worldwide network of curious minds and innovative thinkers across 170+ countries, united by the power of ideas.' },
              { icon: 'fa-hands-helping', title: 'Local Impact', desc: 'Connect with your community and discover how local solutions can address global challenges while preserving cultural heritage.' },
              { icon: 'fa-bullseye', title: 'Actionable Insights', desc: 'Take home practical tools and strategies that you can implement in your personal and professional life immediately.' },
              { icon: 'fa-seedling', title: 'Growth Mindset', desc: 'Challenge your perspectives and expand your thinking with diverse viewpoints from remarkable speakers and attendees.' },
              { icon: 'fa-link', title: 'Meaningful Connections', desc: 'Network with like-minded individuals who are passionate about making a positive difference in their communities.' },
            ].map((f, i) => (
              <div key={i} className="animate fade-in feature-card">
                <div className="feature-icon">
                  <i className={`fas ${f.icon}`} />
                </div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)', fontWeight: 600 }}>{f.title}</h4>
                <p style={{ color: 'var(--text-light)', lineHeight: 1.7, fontSize: '1.1rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="section" id="sponsors">
        <div className="container" style={{ textAlign: 'center' }}>
          <SectionTitle>Our Partners</SectionTitle>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '3rem', alignItems: 'center', marginTop: '5rem',
          }}>
            {[
              { src: 'https://via.placeholder.com/200x60/e62b1e/white?text=TED', alt: 'TED' },
              { src: 'https://via.placeholder.com/200x60/333333/white?text=Dutse+University', alt: 'Federal University Dutse' },
              { src: 'https://via.placeholder.com/200x60/0066cc/white?text=Jigawa+State', alt: 'Jigawa State Government' },
              { src: 'https://via.placeholder.com/200x60/ff6600/white?text=Innovation+Hub', alt: 'Dutse Innovation Hub' },
              { src: 'https://via.placeholder.com/200x60/green/white?text=Green+Energy', alt: 'Green Energy Solutions' },
              { src: '/transparent_logo.png', alt: 'Zenchida Nigeria Ltd', isLink: true, link: 'https://zenchidanigeria.com.ng/' },
              { src: 'https://via.placeholder.com/200x60/purple/white?text=Tech+Partners', alt: 'Tech Partners' },
            ].map((sp, i) => (
              <div key={i} className={`animate fade-in sponsor-logo`}>
                {sp.isLink ? (
                  <a href={sp.link} target="_blank" rel="noreferrer">
                    <img src={sp.src} alt={sp.alt} />
                  </a>
                ) : (
                  <img src={sp.src} alt={sp.alt} />
                )}
              </div>
            ))}
          </div>
          <div className="animate fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>Become a Partner</h3>
            <p style={{ marginBottom: '2rem', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
              Join us in spreading ideas worth sharing. Partner with TEDxDutse to reach engaged audiences and support community innovation.
            </p>
            <a href="#contact" className="cta-btn cta-primary">Partner With Us</a>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section section-dark">
        <div className="container" style={{ textAlign: 'center' }}>
          <SectionTitle dark>Stay Connected</SectionTitle>
          <p className="animate fade-in" style={{
            fontSize: '1.2rem', opacity: 0.9, maxWidth: 600,
            margin: '0 auto 3rem', textAlign: 'center', color: '#fff',
          }}>
            Be the first to know about speaker announcements, ticket releases, and exclusive TEDxDutse updates.
          </p>
          <form className="animate fade-in" style={{
            maxWidth: 600, margin: '3rem auto 0', display: 'flex',
            gap: '1rem', flexWrap: 'wrap', justifyContent: 'center',
          }} onSubmit={(e) => {
            e.preventDefault()
            const btn = e.currentTarget.querySelector('.newsletter-btn')
            const input = e.currentTarget.querySelector('.newsletter-input')
            if (input.value) {
              btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...'
              btn.disabled = true
              setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Subscribed!'
                setTimeout(() => {
                  btn.innerHTML = '<i class="fas fa-paper-plane"></i> Subscribe'
                  btn.disabled = false
                  input.value = ''
                }, 2000)
              }, 1500)
            }
          }}>
            <input type="email" className="newsletter-input" placeholder="Enter your email address" required style={{
              flex: 1, minWidth: 280, padding: '1rem 1.5rem', border: 'none',
              borderRadius: 'var(--border-radius-xl)', fontSize: '1rem',
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)',
              transition: 'var(--transition)',
            }} />
            <button type="submit" className="newsletter-btn" style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
              color: '#fff', border: 'none', borderRadius: 'var(--border-radius-xl)',
              fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)',
            }}>
              <i className="fas fa-paper-plane" /> Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  )
}
