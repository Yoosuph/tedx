export default function FloatingActions() {
  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 999,
    }}>
      <a
        href="https://wa.me/2349033773213?text=Hello%20TEDxDutse%20Team!"
        target="_blank"
        rel="noreferrer"
        className="fab fab-primary"
        style={{
          width: 56, height: 56, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', boxShadow: 'var(--shadow-lg)',
          transition: 'var(--transition)', cursor: 'pointer',
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          color: '#fff',
        }}
      >
        <i className="fab fa-whatsapp" />
        <span style={{
          position: 'absolute', right: 70, background: 'rgba(0,0,0,0.8)',
          color: '#fff', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius)',
          fontSize: '0.9rem', whiteSpace: 'nowrap', pointerEvents: 'none',
          opacity: 0, transition: 'var(--transition)',
        }} className="fab-tooltip">Chat with us</span>
      </a>
      <a
        href="https://tickets.tedxdutse.com"
        target="_blank"
        rel="noreferrer"
        className="fab fab-secondary"
        style={{
          width: 56, height: 56, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', boxShadow: 'var(--shadow-lg)',
          transition: 'var(--transition)', cursor: 'pointer',
          position: 'relative', overflow: 'hidden',
          background: '#fff', color: 'var(--primary)',
        }}
      >
        <i className="fas fa-ticket-alt" />
        <span style={{
          position: 'absolute', right: 70, background: 'rgba(0,0,0,0.8)',
          color: '#fff', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius)',
          fontSize: '0.9rem', whiteSpace: 'nowrap', pointerEvents: 'none',
          opacity: 0, transition: 'var(--transition)',
        }} className="fab-tooltip">Get Tickets</span>
      </a>
    </div>
  )
}
