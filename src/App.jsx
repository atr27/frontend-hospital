import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/patients/PatientsPage'
import PatientDetailPage from './pages/patients/PatientDetailPage'
import CreatePatientPage from './pages/patients/CreatePatientPage'
import EncountersPage from './pages/encounters/EncountersPage'
import EncounterDetailPage from './pages/encounters/EncounterDetailPage'
import CreateEncounterPage from './pages/encounters/CreateEncounterPage'
import AppointmentsPage from './pages/appointments/AppointmentsPage'
import CreateAppointmentPage from './pages/appointments/CreateAppointmentPage'
import NotFoundPage from './pages/NotFoundPage'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/masuk" replace />
  }

  return children
}

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/masuk" element={<LoginPage />} />
          <Route path="/login" element={<Navigate to="/masuk" replace />} />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/beranda" replace />} />
          <Route path="/beranda" element={<DashboardPage />} />

          {/* Patients */}
          <Route path="/pasien" element={<PatientsPage />} />
          <Route path="/pasien/baru" element={<CreatePatientPage />} />
          <Route path="/pasien/:id" element={<PatientDetailPage />} />

          {/* Encounters */}
          <Route path="/kunjungan" element={<EncountersPage />} />
          <Route path="/kunjungan/baru" element={<CreateEncounterPage />} />
          <Route path="/kunjungan/:id" element={<EncounterDetailPage />} />

          {/* Appointments */}
          <Route path="/janji-temu" element={<AppointmentsPage />} />
          <Route path="/janji-temu/baru" element={<CreateAppointmentPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
