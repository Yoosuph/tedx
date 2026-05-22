import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import SpeakersPage from './pages/SpeakersPage'
import SchedulePage from './pages/SchedulePage'
import GalleryPage from './pages/GalleryPage'
import SponsorsPage from './pages/SponsorsPage'

// Ticket System Pages
import TicketsPage from './pages/tickets/TicketsPage'
import TicketDisplayPage from './pages/tickets/TicketDisplayPage'
import RecoverTicketPage from './pages/tickets/RecoverTicketPage'
import VerifyPaymentPage from './pages/tickets/VerifyPaymentPage'
import AdminDashboard from './pages/tickets/AdminDashboard'
import TicketScanner from './pages/tickets/TicketScanner'
import VerifyTicket from './pages/tickets/VerifyTicket'
import TicketDetail from './pages/tickets/TicketDetail'

// Legacy Attendee Pages
import CheckInPage from './pages/CheckInPage'
import DashboardPage from './pages/DashboardPage'
import EventInfoPage from './pages/EventInfoPage'
import OrderOfActivitiesPage from './pages/OrderOfActivitiesPage'
import ScanPage from './pages/ScanPage'

import './App.css'

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/speakers" element={<SpeakersPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/sponsors" element={<SponsorsPage />} />

      {/* Ticket System - Public */}
      <Route path="/tickets" element={<TicketsPage />} />
      <Route path="/tickets/recover" element={<RecoverTicketPage />} />
      <Route path="/tickets/verify" element={<VerifyPaymentPage />} />
      <Route path="/ticket/:reference" element={<TicketDisplayPage />} />

      {/* Ticket System - Admin */}
      <Route path="/admin/tickets" element={<AdminDashboard />} />
      <Route path="/admin/tickets/scanner" element={<TicketScanner />} />
      <Route path="/admin/tickets/verify" element={<VerifyTicket />} />
      <Route path="/admin/tickets/:reference" element={<TicketDetail />} />

      {/* Legacy Attendee Pages */}
      <Route path="/checkin" element={<CheckInPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/event-info" element={<EventInfoPage />} />
      <Route path="/order-of-activities" element={<OrderOfActivitiesPage />} />
      <Route path="/scan" element={<ScanPage />} />

      {/* 404 */}
      <Route path="*" element={
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--dark)',
          color: 'var(--white)',
          fontFamily: 'var(--font-sans)',
          textAlign: 'center',
          padding: '2rem',
        }}>
          <h1 style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--ted-red)', marginBottom: '1rem' }}>404</h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--gray-400)' }}>Page not found</p>
          <a href="/" style={{
            padding: '1rem 2rem',
            background: 'var(--ted-red)',
            color: 'var(--white)',
            borderRadius: 'var(--radius-full)',
            textDecoration: 'none',
            fontWeight: 600,
          }}>Go Home</a>
        </div>
      } />
    </Routes>
  )
}

export default App
