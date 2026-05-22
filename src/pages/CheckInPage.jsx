import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const checkinCss = `
:root { --ted-red: #E62B1E; --black: #111; --white: #fff; }
body { margin:0; font-family: Arial, Helvetica, sans-serif; background: var(--black); color: var(--white); }
.header { background: var(--ted-red); padding: 20px; text-align: center; }
.header h1 { margin:0; font-size:26px; font-weight:800; }
.container-inner { margin:20px; background: #ffffff15; padding:20px; border-radius:12px; backdrop-filter:blur(4px); }
label { font-weight:600; margin-bottom:6px; display:block; font-size:15px; }
input[type="text"], input[type="tel"], input[type="email"] {
  width:100%; padding:14px; border-radius:8px; border:1px solid #333;
  margin-bottom:16px; background: var(--white); color: var(--black);
  font-size:15px; box-sizing:border-box;
}
.btn { width:100%; background:var(--ted-red); color:var(--white); padding:14px;
  border:none; border-radius:8px; font-size:17px; font-weight:700; cursor:pointer; margin-top:10px; }
.btn:hover { background:#c32418; }
.instructions { margin-top:15px; font-size:13px; opacity:0.85; text-align:center; }
.qr-box { background:#ffffff10; padding:15px; border-radius:10px; margin-top:20px; text-align:center; font-size:13px; color:#ddd; }
@media (max-width:480px) { .header h1 { font-size:22px; } .container-inner { padding:16px; margin:15px; } }
`

export default function CheckInPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', phone: '', email: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { full_name, phone, email } = form
    const phonePattern = /^(?:\+234|0)[0-9]{10}$/

    if (!full_name || !phone) {
      Swal.fire({ icon: 'error', title: 'Missing Information', text: 'Full name and phone number are required.', confirmButtonColor: '#E62B1E' })
      return
    }
    if (!phonePattern.test(phone)) {
      Swal.fire({ icon: 'warning', title: 'Invalid Phone Number', text: 'Please enter a valid WhatsApp number (e.g., +2348012345678 or 08012345678).', confirmButtonColor: '#E62B1E' })
      return
    }

    try {
      const res = await fetch('process_checkin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(form),
      })
      const text = await res.text()
      document.open()
      document.write(text)
      document.close()
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not connect to server.', confirmButtonColor: '#E62B1E' })
    }
  }

  return (
    <div>
      <style>{checkinCss}</style>
      <div className="header">
        <h1>TEDxDutse Check-In</h1>
      </div>
      <div className="container-inner">
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input type="text" name="full_name" placeholder="Enter your full name"
            value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />

          <label>Phone Number (WhatsApp)</label>
          <input type="tel" name="phone" placeholder="+2348012345678"
            value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />

          <label>Email Address</label>
          <input type="email" name="email" placeholder="Enter your email (optional)"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />

          <button type="submit" className="btn">Continue</button>
        </form>

        <p className="instructions">Scan the QR code at the entrance or fill this form to proceed.</p>
        <div className="qr-box">
          Generate QR pointing to:<br />
          <b>https://tedxdutse.com/checkin.php</b>
        </div>
      </div>
    </div>
  )
}
