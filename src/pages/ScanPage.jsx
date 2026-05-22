import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'

const css = `
body { margin:0; padding:0; background:#000; font-family:Arial; overflow:hidden; }
#reader { width:100vw; height:100vh; position:relative; }
#reader video { object-fit:cover !important; width:100% !important; height:100% !important; }
.scan-frame { position:absolute; top:50%; left:50%; width:260px; height:260px; transform:translate(-50%,-50%); border:3px solid #e62b1e; border-radius:10px; pointer-events:none; box-shadow:0 0 10px #e62b1e; }
.scan-btn { background:#e62b1e; color:#000; padding:14px 25px; border:none; border-radius:8px; font-size:18px; font-weight:bold; width:80%; margin:15px auto; display:none; text-align:center; cursor:pointer; }
.btn-center { width:100%; position:absolute; bottom:20px; left:0; text-align:center; }
.modal-box { display:none; background:#111; border:2px solid #e62b1e; width:90%; margin:0 auto; padding:15px; border-radius:10px; color:#fff; position:absolute; top:10px; left:0; right:0; }
.modal-box h3 { margin:0 0 10px; color:#e62b1e; }
`

export default function ScanPage() {
  const scanningRef = useRef(false)
  const html5QrCodeRef = useRef(null)

  useEffect(() => {
    const script1 = document.createElement('script')
    script1.src = 'https://unpkg.com/html5-qrcode'
    script1.onload = startScanner
    document.body.appendChild(script1)

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {})
      }
    }
  }, [])

  function cleanRef(raw) {
    if (raw.includes('reference=')) {
      let ref = raw.split('reference=')[1]
      return ref.split('&')[0].trim()
    }
    return raw.replace(/[^A-Za-z0-9]/g, '').trim().toUpperCase()
  }

  function startScanner() {
    const Html5Qrcode = window.Html5Qrcode
    if (!Html5Qrcode) return

    const readerEl = document.getElementById('reader')
    if (!readerEl) return

    html5QrCodeRef.current = new Html5Qrcode("reader")
    scanningRef.current = true

    html5QrCodeRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 260 },
      onScanSuccess
    ).catch(() => {
      Swal.fire("Camera Error", "Unable to access camera.", "error")
    })
  }

  function onScanSuccess(scannedText) {
    if (!scanningRef.current) return
    scanningRef.current = false

    html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current.clear()).catch(() => {})

    let clean = cleanRef(scannedText)

    fetch("/verify_ticket.php?reference=" + clean)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          Swal.fire("Verified", "Ticket is valid.", "success")
          document.getElementById("td_name").textContent = data.name
          document.getElementById("td_email").textContent = data.email
          document.getElementById("td_phone").textContent = data.phone
          document.getElementById("td_type").textContent = data.ticket_type
          document.getElementById("td_amount").textContent = data.amount
          document.getElementById("ticketDetails").style.display = "block"
        } else if (data.status === "used") {
          Swal.fire("Already Used", "Ticket has been scanned previously.", "warning")
        } else {
          Swal.fire("Invalid Ticket", "Ticket does not exist.", "error")
        }
        document.getElementById("scanAgainBtn").style.display = "inline-block"
      })
      .catch(() => {
        Swal.fire("Error", "Could not validate ticket.", "error")
        document.getElementById("scanAgainBtn").style.display = "inline-block"
      })
  }

  return (
    <div>
      <style>{css}</style>
      <div id="reader" />
      <div className="scan-frame" />

      <div className="modal-box" id="ticketDetails">
        <h3>Ticket Details</h3>
        <p><strong>Name:</strong> <span id="td_name"></span></p>
        <p><strong>Email:</strong> <span id="td_email"></span></p>
        <p><strong>Phone:</strong> <span id="td_phone"></span></p>
        <p><strong>Ticket Type:</strong> <span id="td_type"></span></p>
        <p><strong>Amount:</strong> ₦<span id="td_amount"></span></p>
      </div>

      <div className="btn-center">
        <button id="scanAgainBtn" className="scan-btn" onClick={() => window.location.reload()}>Scan Again</button>
      </div>
    </div>
  )
}
