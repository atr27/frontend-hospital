import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { patientService } from '../../services/patientService'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiEdit, FiCalendar, FiFileText, FiTrash2 } from 'react-icons/fi'
import { format } from 'date-fns'

// Translate encounter status
const translateEncounterStatus = (status) => {
  const translations = {
    'scheduled': 'Terjadwal',
    'in_progress': 'Berlangsung',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan'
  }
  return translations[status] || status
}

// Translate encounter type
const translateEncounterType = (type) => {
  const translations = {
    'outpatient': 'Rawat Jalan',
    'inpatient': 'Rawat Inap',
    'emergency': 'Darurat',
    'wellness': 'Pemeriksaan Kesehatan',
    'telehealth': 'Telemedisin'
  }
  return translations[type] || type
}

// Translate appointment status
const translateAppointmentStatus = (status) => {
  const translations = {
    'scheduled': 'Terjadwal',
    'confirmed': 'Dikonfirmasi',
    'checked_in': 'Sudah Check In',
    'in_progress': 'Berlangsung',
    'completed': 'Selesai',
    'cancelled': 'Dibatalkan',
    'no_show': 'Tidak Hadir'
  }
  return translations[status] || status
}

// Translate appointment type
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

function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canDelete } = useAuthStore()
  const [patient, setPatient] = useState(null)
  const [timeline, setTimeline] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ringkasan')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadPatientData()
  }, [id])

  const loadPatientData = async () => {
    try {
      setLoading(true)
      const [patientData, timelineData] = await Promise.all([
        patientService.getPatient(id),
        patientService.getPatientTimeline(id),
      ])
      setPatient(patientData)
      setTimeline(timelineData)
    } catch (error) {
      toast.error('Gagal memuat data pasien')
      console.error('Error loading patient:', error)
    } finally {
      setLoading(false)
    }
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

  const handleDelete = async () => {
    try {
      await patientService.deletePatient(id)
      toast.success('Pasien berhasil dihapus')
      navigate('/pasien')
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki izin untuk menghapus pasien')
      } else {
        toast.error('Gagal menghapus pasien')
      }
      console.error('Error deleting patient:', error)
    }
    setShowDeleteConfirm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pasien tidak ditemukan</p>
        <Link to="/pasien" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Kembali ke daftar pasien
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/pasien" className="mr-4">
            <FiArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-gray-600">MRN: {patient.mrn}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/kunjungan/baru?patient=${patient.id}`} className="btn btn-primary flex items-center">
            <FiFileText className="mr-2" />
            Kunjungan Baru
          </Link>
          <Link to={`/janji-temu/baru?patient=${patient.id}`} className="btn btn-secondary flex items-center">
            <FiCalendar className="mr-2" />
            Buat Janji Temu
          </Link>
          {canDelete('patient') && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-danger flex items-center"
            >
              <FiTrash2 className="mr-2" />
              Hapus Pasien
            </button>
          )}
        </div>
      </div>

      {/* Patient Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Demografi</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Umur</p>
              <p className="text-sm font-medium">{calculateAge(patient.date_of_birth)} tahun</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Jenis Kelamin</p>
              <p className="text-sm font-medium capitalize">{patient.gender}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Golongan Darah</p>
              <p className="text-sm font-medium">{patient.blood_type || '-'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Informasi Kontak</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium">{patient.email || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Telepon</p>
              <p className="text-sm font-medium">{patient.phone_number || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Alamat</p>
              <p className="text-sm font-medium">{patient.address || '-'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Kontak Darurat</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Nama</p>
              <p className="text-sm font-medium">{patient.emergency_contact?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Hubungan</p>
              <p className="text-sm font-medium">{patient.emergency_contact?.relationship || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Telepon</p>
              <p className="text-sm font-medium">{patient.emergency_contact?.phone_number || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['ringkasan', 'alergi', 'obat', 'kunjungan', 'janji_temu'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab === 'ringkasan' ? 'Ringkasan' : tab === 'alergi' ? 'Alergi' : tab === 'obat' ? 'Obat' : tab === 'kunjungan' ? 'Kunjungan' : 'Janji Temu'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'ringkasan' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ringkasan Pasien</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tanggal Lahir</p>
                <p className="font-medium">{format(new Date(patient.date_of_birth), 'MMMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kewarganegaraan</p>
                <p className="font-medium">{patient.nationality || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status Pernikahan</p>
                <p className="font-medium capitalize">{patient.marital_status || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pekerjaan</p>
                <p className="font-medium">{patient.occupation || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alergi' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Alergi</h3>
            {timeline?.allergies && timeline.allergies.length > 0 ? (
              <div className="space-y-2">
                {timeline.allergies.map((allergy) => (
                  <div key={allergy.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{allergy.allergen}</p>
                        <p className="text-sm text-gray-500 capitalize">{allergy.allergy_type}</p>
                      </div>
                      <span className={`badge ${allergy.severity === 'severe' ? 'badge-danger' :
                        allergy.severity === 'moderate' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                        {allergy.severity}
                      </span>
                    </div>
                    {allergy.reaction && (
                      <p className="text-sm text-gray-600 mt-2">Reaction: {allergy.reaction}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada alergi tercatat</p>
            )}
          </div>
        )}

        {activeTab === 'obat' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Obat Saat Ini</h3>
            {timeline?.medications && timeline.medications.length > 0 ? (
              <div className="space-y-2">
                {timeline.medications.filter(m => m.status === 'active').map((medication) => (
                  <div key={medication.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{medication.medication_name}</p>
                        <p className="text-sm text-gray-500">
                          {medication.dosage} - {medication.frequency}
                        </p>
                      </div>
                      <span className="badge badge-success">Aktif</span>
                    </div>
                    {medication.instructions && (
                      <p className="text-sm text-gray-600 mt-2">{medication.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada obat aktif</p>
            )}
          </div>
        )}

        {activeTab === 'kunjungan' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Kunjungan Medis</h3>
            {timeline?.encounters && timeline.encounters.length > 0 ? (
              <div className="space-y-2">
                {timeline.encounters.map((encounter) => (
                  <Link
                    key={encounter.id}
                    to={`/kunjungan/${encounter.id}`}
                    className="block p-4 border rounded-lg hover:bg-slate-50 border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{translateEncounterType(encounter.encounter_type)}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(encounter.admission_date), 'MMMM dd, yyyy')}
                        </p>
                      </div>
                      <span className={`badge ${encounter.status === 'completed' ? 'badge-success' :
                        encounter.status === 'in_progress' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                        {translateEncounterStatus(encounter.status)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada kunjungan tercatat</p>
            )}
          </div>
        )}

        {activeTab === 'janji_temu' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Janji Temu</h3>
            {timeline?.appointments && timeline.appointments.length > 0 ? (
              <div className="space-y-2">
                {timeline.appointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{translateAppointmentType(appointment.appointment_type)}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(appointment.start_time), 'MMMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <span className={`badge ${appointment.status === 'completed' ? 'badge-success' :
                        appointment.status === 'cancelled' ? 'badge-danger' :
                          'badge-info'
                        }`}>
                        {translateAppointmentStatus(appointment.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada janji temu terjadwal</p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus pasien <strong>{patient.first_name} {patient.last_name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientDetailPage
