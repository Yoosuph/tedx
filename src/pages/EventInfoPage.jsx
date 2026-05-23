const css = `
body { margin:0; font-family:Arial,sans-serif; background:#000; color:#fff; }
.header { padding:20px; text-align:center; background:#111; border-bottom:3px solid #E62B1E; }
.header h2 { margin:0; font-size:22px; font-weight:700; }
.container-inner { padding:20px; }
.welcome { text-align:center; margin-bottom:20px; font-size:18px; }
.card { background:#1A1A1A; border:2px solid #E62B1E; border-radius:10px; padding:18px; margin-bottom:20px; }
.card h3 { margin-top:0; color:#E62B1E; }
.card p { line-height:1.5; font-size:15px; }
@media(max-width:600px) { .container-inner { padding:15px; } }
a.back-btn { display:inline-block; margin-bottom:15px; padding:10px 15px; background:#E62B1E; color:#000; font-weight:bold; text-decoration:none; border-radius:6px; transition:0.25s; }
a.back-btn:hover { background:#c32418; }
`

import { Link } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';

export default function EventInfoPage() {
  const { siteConfig } = useSiteData();
  return (
    <div>
      <style>{css}</style>
      <div className="header">
        <h2>TEDx Dutse – Event Info</h2>
      </div>
      <div className="container-inner">
        <p className="welcome">Hello, <strong>Attendee</strong>! Here's the event info:</p>
        <Link to="/dashboard" className="back-btn">&larr; Back to Dashboard</Link>

        {[
          { title: 'Event Name', content: `${siteConfig.eventName} ${siteConfig.eventYear}: "${siteConfig.theme}"` },
          { title: 'Date & Time', content: `${siteConfig.date}<br />${siteConfig.time}` },
          { title: 'Venue', content: siteConfig.venue },
          { title: 'Dress Code', content: siteConfig.dressCode },
          { title: 'Contact / Support', content: `For any inquiries, contact:<br />WhatsApp: ${siteConfig.contact.phone} <br />Email: ${siteConfig.contact.email}` },
        ].map((c, i) => (
          <div key={i} className="card">
            <h3>{c.title}</h3>
            <p dangerouslySetInnerHTML={{ __html: c.content }} />
          </div>
        ))}
      </div>
    </div>
  )
}
