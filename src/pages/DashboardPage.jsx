import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUsers, FiCalendar, FiFileText, FiActivity, FiArrowUp, FiArrowRight, FiClock } from 'react-icons/fi'
import { patientService } from '../services/patientService'
import { appointmentService } from '../services/appointmentService'
import { encounterService } from '../services/encounterService'

function DashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    activeEncounters: 0,
  })
  const [recentPatients, setRecentPatients] = useState([])
  const [todayAppointments, setTodayAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load patients
      const patientsData = await patientService.getPatients(1, 5)
      setRecentPatients(patientsData.data || [])
      setStats(prev => ({ ...prev, totalPatients: patientsData.total || 0 }))

      // Load today's appointments
      const today = new Date().toISOString().split('T')[0]
      const appointmentsData = await appointmentService.getAppointments(1, 10, { date: today })
      setTodayAppointments(appointmentsData.data || [])
      setStats(prev => ({ ...prev, todayAppointments: appointmentsData.total || 0 }))

      // Load active encounters
      const encountersData = await encounterService.getEncounters(1, 1, { status: 'in_progress' })
      setStats(prev => ({ ...prev, activeEncounters: encountersData.total || 0 }))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Pasien',
      value: stats.totalPatients,
      icon: FiUsers,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/pasien',
      trend: '+12%',
      trendUp: true
    },
    {
      name: "Janji Temu Hari Ini",
      value: stats.todayAppointments,
      icon: FiCalendar,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      link: '/janji-temu',
      trend: '+5%',
      trendUp: true
    },
    {
      name: 'Kunjungan Aktif',
      value: stats.activeEncounters,
      icon: FiFileText,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      link: '/kunjungan',
      trend: '-2%',
      trendUp: false
    },
    {
      name: 'Efisiensi Sistem',
      value: '98%',
      icon: FiActivity,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '#',
      trend: '+1%',
      trendUp: true
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="mt-1 text-slate-500">Ringkasan aktivitas rumah sakit hari ini.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/pasien/baru" className="btn btn-primary">
            + Pasien Baru
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="card hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl transition-colors group-hover:scale-110 duration-200`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`flex items-center font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.trendUp ? <FiArrowUp className="mr-1 h-3 w-3" /> : <FiArrowUp className="mr-1 h-3 w-3 rotate-180" />}
                {stat.trend}
              </span>
              <span className="ml-2 text-slate-500">dari bulan lalu</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Patients */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Pasien Terbaru</h2>
            <Link to="/pasien" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center group">
              Lihat semua <FiArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pasien</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">MRN</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Gender</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {recentPatients.length > 0 ? (
                  recentPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                              {patient.first_name[0]}{patient.last_name[0]}
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900">{patient.first_name} {patient.last_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500 font-mono">{patient.mrn}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                          {patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-slate-500 text-sm">
                      Tidak ada data pasien terbaru
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Janji Temu Hari Ini</h2>
            <Link to="/janji-temu" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center group">
              Lihat semua <FiArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary-200 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center text-xs font-medium text-slate-500 shadow-sm">
                        <span className="text-slate-500 text-[10px] uppercase">{new Date(appointment.start_time).toLocaleDateString('id-ID', { month: 'short' })}</span>
                        <span className="text-slate-900 font-bold text-sm">{new Date(appointment.start_time).getDate()}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {appointment.patient?.first_name} {appointment.patient?.last_name}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-slate-500">
                        <FiClock className="mr-1 h-3 w-3" />
                        {new Date(appointment.start_time).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${appointment.status === 'scheduled' ? 'badge-info' :
                    appointment.status === 'confirmed' ? 'badge-success' :
                      appointment.status === 'cancelled' ? 'badge-danger' :
                        'badge-warning'
                    }`}>
                    {appointment.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <FiCalendar className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-slate-500 text-sm">Tidak ada janji temu untuk hari ini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
