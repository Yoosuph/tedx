import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const dashCss = `
body { margin:0; padding:0; font-family:Arial,sans-serif; background:#000; color:#fff; }
.header { padding:20px; text-align:center; background:#111; border-bottom:3px solid #E62B1E; }
.header h2 { margin:0; font-size:22px; font-weight:700; }
.welcome { text-align:center; margin:20px 0; font-size:18px; }
.menu-container { padding:20px; display:grid; grid-template-columns:repeat(2,1fr); gap:18px; max-width:600px; margin:0 auto; }
.menu-item { background:#1A1A1A; border:2px solid #E62B1E; padding:25px 10px; border-radius:12px; text-align:center; font-size:15px; font-weight:bold; color:white; transition:0.25s ease-in-out; cursor:pointer; text-decoration:none; display:block; }
.menu-item i { font-size:32px; margin-bottom:12px; color:#E62B1E; transition:0.25s; display:block; }
.menu-item:hover { background:#E62B1E; color:#000; transform:scale(1.04); }
.menu-item:hover i { color:#000; }
a { text-decoration:none; color:inherit; }
@media(max-width:600px) { .menu-container { grid-template-columns:1fr 1fr; } .menu-item { padding:20px 8px; } }
.whatsapp-float { position:fixed; bottom:20px; right:20px; background-color:#25D366; color:white; border-radius:50%; width:60px; height:60px; display:flex; align-items:center; justify-content:center; font-size:28px; box-shadow:0 4px 8px rgba(0,0,0,0.3); z-index:1000; cursor:pointer; animation:float 2s ease-in-out infinite; }
.whatsapp-float:hover { transform:scale(1.2); }
@keyframes float { 0%{transform:translateY(0)} 50%{transform:translateY(-10px)} 100%{transform:translateY(0)} }
.modal { display:none; position:fixed; z-index:2000; left:0; top:0; width:100%; height:100%; overflow:auto; background-color:rgba(0,0,0,0.8); padding-top:60px; }
.modal-content { background-color:#1A1A1A; margin:5% auto; padding:20px; border:2px solid #E62B1E; width:80%; max-width:400px; border-radius:12px; color:#fff; text-align:center; position:relative; }
.modal-content h3 { margin-top:0; color:#E62B1E; }
.close { color:#fff; position:absolute; top:10px; right:15px; font-size:28px; font-weight:bold; cursor:pointer; }
.modal-content input[type="text"], .modal-content input[type="email"] { width:90%; padding:10px; margin:10px 0; border:1px solid #E62B1E; border-radius:8px; background:#000; color:#fff; }
.modal-content button { background-color:#E62B1E; color:#000; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.25s; }
.modal-content button:hover { background-color:#fff; color:#E62B1E; }
`

export default function DashboardPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [certForm, setCertForm] = useState({ real_name: '', email: '' })

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(d => { if (d.name) setName(d.name); else navigate('/checkin') })
      .catch(() => navigate('/checkin'))
  }, [])

  return (
    <div>
      <style>{dashCss}</style>
      <div className="header">
        <h2>TEDx Dutse – Attendee Dashboard</h2>
      </div>
      <p className="welcome">Welcome, <strong>{name || 'Attendee'}</strong></p>

      <div className="menu-container">
        <a href="/order-of-activities" className="menu-item">
          <i className="fas fa-list-ul" />
          <div>Order of Activities</div>
        </a>
        <a href="https://kahoot.it" target="_blank" rel="noreferrer" className="menu-item">
          <i className="fas fa-gamepad" />
          <div>Join Kahoot Game</div>
        </a>
        <div className="menu-item" onClick={() => setModalOpen(true)}>
          <i className="fas fa-award" />
          <div>Print Certificate</div>
        </div>
        <a href="/event-info" className="menu-item">
          <i className="fas fa-info-circle" />
          <div>Event Information</div>
        </a>
        <a href="/speakers" className="menu-item">
          <i className="fas fa-microphone" />
          <div>Speakers & Bio</div>
        </a>
      </div>

      <a href="https://chat.whatsapp.com/FSClJBjkgr6LYdDMcFx2A0" target="_blank" rel="noreferrer" className="whatsapp-float" title="Join TEDx Duste WhatsApp Community">
        <i className="fab fa-whatsapp" />
      </a>

      {modalOpen && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
            <h3>Request Your Certificate</h3>
            <p>To receive your TEDx certificate, please provide your <strong>real name</strong> and email address. It will be delivered to the email provided.</p>
            <form action="send_certificate.php" method="POST">
              <input type="text" name="real_name" placeholder="Your Full Name" required
                value={certForm.real_name} onChange={e => setCertForm({...certForm, real_name: e.target.value})} />
              <input type="email" name="email" placeholder="Your Email Address" required
                value={certForm.email} onChange={e => setCertForm({...certForm, email: e.target.value})} />
              <br />
              <button type="submit">Send Certificate</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
