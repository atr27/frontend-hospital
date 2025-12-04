import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { appointmentService } from '../../services/appointmentService'
import toast from 'react-hot-toast'
import { FiPlus, FiCalendar } from 'react-icons/fi'
import { format } from 'date-fns'

// Translate appointment type from English to Indonesian
const translateAppointmentType = (type) => {
  const translations = {
    'consultation': 'Konsultasi',
    'follow_up': 'Tindak Lanjut',
    'wellness': 'Pemeriksaan Kesehatan',
    'procedure': 'Prosedur',
    'emergency': 'Darurat',
    'telehealth': 'Telemedisin'
  }
  return translations[type] || type
}

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    loadAppointments()
  }, [pagination.page, filters])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const queryFilters = {}
      if (filters.status) queryFilters.status = filters.status
      if (filters.date) queryFilters.date = filters.date

      const data = await appointmentService.getAppointments(
        pagination.page,
        pagination.pageSize,
        queryFilters
      )
      setAppointments(data.data || [])
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.total_pages,
      }))
    } catch (error) {
      toast.error('Gagal memuat janji temu')
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (id) => {
    try {
      await appointmentService.checkInAppointment(id)
      toast.success('Pasien berhasil check in')
      loadAppointments()
    } catch (error) {
      toast.error('Gagal check in')
    }
  }

  const handleCancel = async (id) => {
    const reason = prompt('Masukkan alasan pembatalan:')
    if (!reason) return

    try {
      await appointmentService.cancelAppointment(id, reason)
      toast.success('Janji temu berhasil dibatalkan')
      loadAppointments()
    } catch (error) {
      toast.error('Gagal membatalkan janji temu')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Janji Temu</h1>
          <p className="text-gray-600">Kelola janji temu dan penjadwalan pasien</p>
        </div>
        <Link to="/janji-temu/baru" className="btn btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Janji Temu Baru
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              className="input"
              value={filters.date}
              onChange={(e) => {
                setFilters({ ...filters, date: e.target.value })
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value })
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
            >
              <option value="">Semua Status</option>
              <option value="scheduled">Terjadwal</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="checked_in">Sudah Check In</option>
              <option value="in_progress">Berlangsung</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
              <option value="no_show">Tidak Hadir</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : appointments.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pasien
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dokter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(appointment.start_time), 'HH:mm')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.duration} mnt
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                              {appointment.patient?.first_name?.[0]}{appointment.patient?.last_name?.[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient?.first_name} {appointment.patient?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.patient?.mrn}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.provider?.first_name} {appointment.provider?.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {translateAppointmentType(appointment.appointment_type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${appointment.status === 'completed' ? 'badge-success' :
                          appointment.status === 'cancelled' ? 'badge-danger' :
                            appointment.status === 'checked_in' ? 'badge-warning' :
                              'badge-info'
                          }`}>
                          {appointment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {appointment.status === 'scheduled' && (
                            <button
                              onClick={() => handleCheckIn(appointment.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Check In
                            </button>
                          )}
                          {['scheduled', 'confirmed'].includes(appointment.status) && (
                            <button
                              onClick={() => handleCancel(appointment.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span> sampai{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                </span>{' '}
                dari <span className="font-medium">{pagination.total}</span> hasil
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-2">Tidak ada janji temu ditemukan</p>
            <Link to="/janji-temu/baru" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
              Jadwalkan janji temu
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentsPage
