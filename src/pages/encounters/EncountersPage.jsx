import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { encounterService } from '../../services/encounterService'
import toast from 'react-hot-toast'
import { FiPlus, FiEye } from 'react-icons/fi'
import { format } from 'date-fns'

function EncountersPage() {
  const [encounters, setEncounters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  const getEncounterTypeLabel = (type) => {
    const types = {
      'outpatient': 'Rawat Jalan',
      'inpatient': 'Rawat Inap',
      'emergency': 'Darurat',
      'wellness': 'Pemeriksaan Kesehatan',
      'telehealth': 'Telemedisin',
    }
    return types[type] || type
  }

  const getEncounterStatusLabel = (status) => {
    const statuses = {
      'scheduled': 'Terjadwal',
      'in_progress': 'Berlangsung',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan',
    }
    return statuses[status] || status
  }

  useEffect(() => {
    loadEncounters()
  }, [pagination.page, filters])

  const loadEncounters = async () => {
    try {
      setLoading(true)
      const data = await encounterService.getEncounters(
        pagination.page,
        pagination.pageSize,
        filters.status ? { status: filters.status } : {}
      )
      setEncounters(data.data || [])
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.total_pages,
      }))
    } catch (error) {
      toast.error('Gagal memuat kunjungan')
      console.error('Error loading encounters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (encounterId, newStatus) => {
    try {
      await encounterService.updateEncounterStatus(encounterId, newStatus)
      setEncounters(encounters.map(enc =>
        enc.id === encounterId ? { ...enc, status: newStatus } : enc
      ))
      toast.success('Status kunjungan berhasil diperbarui')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Gagal memperbarui status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kunjungan</h1>
          <p className="text-gray-600">Kelola kunjungan klinis dan visit</p>
        </div>
        <Link to="/kunjungan/baru" className="btn btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Kunjungan Baru
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1">
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
              <option value="in_progress">Berlangsung</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Encounters List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : encounters.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. Kunjungan
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
                      Tanggal Masuk
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
                  {encounters.map((encounter) => (
                    <tr key={encounter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {encounter.encounter_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {encounter.patient?.first_name} {encounter.patient?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {encounter.patient?.mrn}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {encounter.provider?.first_name} {encounter.provider?.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getEncounterTypeLabel(encounter.encounter_type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(encounter.admission_date), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={encounter.status}
                          onChange={(e) => handleStatusChange(encounter.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:ring-2 cursor-pointer ${encounter.status === 'completed' ? 'bg-green-100 text-green-800 focus:ring-green-500' :
                              encounter.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500' :
                                encounter.status === 'cancelled' ? 'bg-red-100 text-red-800 focus:ring-red-500' :
                                  'bg-blue-100 text-blue-800 focus:ring-blue-500'
                            }`}
                        >
                          <option value="scheduled">Terjadwal</option>
                          <option value="in_progress">Berlangsung</option>
                          <option value="completed">Selesai</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/kunjungan/${encounter.id}`} className="text-primary-600 hover:text-primary-900 flex items-center justify-end">
                          <FiEye className="mr-1" />
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
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
            <p className="text-gray-500">Tidak ada kunjungan ditemukan</p>
            <Link to="/kunjungan/baru" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
              Buat kunjungan pertama Anda
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default EncountersPage
