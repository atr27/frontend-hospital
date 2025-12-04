import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { patientService } from '../../services/patientService'
import toast from 'react-hot-toast'
import { FiPlus, FiSearch, FiEye } from 'react-icons/fi'

function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    loadPatients()
  }, [pagination.page, search])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const data = await patientService.getPatients(pagination.page, pagination.pageSize, search)
      setPatients(data.data || [])
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.total_pages,
      }))
    } catch (error) {
      toast.error('Gagal memuat pasien')
      console.error('Error loading patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    loadPatients()
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pasien</h1>
          <p className="text-slate-500">Kelola catatan dan informasi pasien</p>
        </div>
        <Link to="/pasien/baru" className="btn btn-primary flex items-center justify-center sm:w-auto w-full">
          <FiPlus className="mr-2" />
          Pasien Baru
        </Link>
      </div>

      {/* Search */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Cari berdasarkan nama, MRN, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary sm:w-auto w-full">
            Cari
          </button>
        </form>
      </div>

      {/* Patients List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : patients.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Pasien
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      MRN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Umur/Jenis Kelamin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Kontak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                              {patient.first_name[0]}{patient.last_name[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {patient.first_name} {patient.last_name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {patient.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 font-mono">{patient.mrn}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {calculateAge(patient.date_of_birth)} tahun
                        </div>
                        <div className="text-sm text-slate-500 capitalize">
                          {patient.gender}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {patient.phone_number || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${patient.status === 'active' ? 'badge-success' :
                          patient.status === 'inactive' ? 'badge-warning' :
                            'badge-danger'
                          }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/pasien/${patient.id}`}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        >
                          <FiEye className="mr-1" />
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <div className="text-sm text-slate-700">
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
            <p className="text-slate-500">Tidak ada pasien ditemukan</p>
            <Link to="/pasien/baru" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
              Buat pasien pertama Anda
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientsPage
