import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CheckInPage from './pages/CheckInPage'
import DashboardPage from './pages/DashboardPage'
import EventInfoPage from './pages/EventInfoPage'
import OrderOfActivitiesPage from './pages/OrderOfActivitiesPage'
import SpeakersPage from './pages/SpeakersPage'
import ScanPage from './pages/ScanPage'
import FloatingActions from './components/FloatingActions'
import './App.css'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkin" element={<CheckInPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/event-info" element={<EventInfoPage />} />
        <Route path="/order-of-activities" element={<OrderOfActivitiesPage />} />
        <Route path="/speakers" element={<SpeakersPage />} />
        <Route path="/scan" element={<ScanPage />} />
      </Routes>
      <FloatingActions />
    </>
  )
}

export default App
