import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { encounterService } from '../../services/encounterService'
import { patientService } from '../../services/patientService'
import toast from 'react-hot-toast'
import { FiArrowLeft } from 'react-icons/fi'
import { useAuthStore } from '../../stores/authStore'

function CreateEncounterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [loadingPatients, setLoadingPatients] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    loadPatients()
    // Pre-fill patient if passed in URL
    const patientId = searchParams.get('patient')
    if (patientId) {
      setValue('patient_id', patientId)
    }
    // Pre-fill provider with current user
    if (user?.id) {
      setValue('provider_id', user.id)
    }
  }, [])

  const loadPatients = async () => {
    try {
      const data = await patientService.getPatients(1, 100)
      setPatients(data.data || [])
    } catch (error) {
      console.error('Error loading patients:', error)
    } finally {
      setLoadingPatients(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Validate required IDs
      if (!data.patient_id || data.patient_id === '' || data.patient_id === 'null') {
        toast.error('Silakan pilih pasien')
        setLoading(false)
        return
      }

      // Backend expects UUIDs as strings, not integers
      const payload = {
        ...data,
        patient_id: data.patient_id,  // Keep as UUID string
        provider_id: user.id,  // Use user.id directly (UUID string)
        admission_date: new Date(data.admission_date).toISOString(),
      }

      console.log('Sending payload:', JSON.stringify(payload, null, 2))

      await encounterService.createEncounter(payload)
      toast.success('Kunjungan berhasil dibuat')
      navigate('/kunjungan')
    } catch (error) {
      console.error('Error creating encounter:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Gagal membuat kunjungan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/kunjungan" className="btn btn-ghost btn-circle">
          <FiArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">Buat Kunjungan Baru</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Informasi Kunjungan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pasien *
              </label>
              <select
                className={`input ${errors.patient_id ? 'border-red-500' : ''}`}
                {...register('patient_id', { required: 'Pasien wajib dipilih' })}
                disabled={loadingPatients}
              >
                <option value="">Pilih pasien</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} - {patient.mrn}
                  </option>
                ))}
              </select>
              {errors.patient_id && (
                <p className="mt-1 text-sm text-red-600">{errors.patient_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dokter *
              </label>
              <input
                type="text"
                className="input bg-gray-50"
                value={`${user?.first_name} ${user?.last_name}`}
                disabled
              />
              <input type="hidden" {...register('provider_id')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Kunjungan *
              </label>
              <select
                className={`input ${errors.encounter_type ? 'border-red-500' : ''}`}
                {...register('encounter_type', { required: 'Tipe kunjungan wajib dipilih' })}
              >
                <option value="">Pilih tipe</option>
                <option value="outpatient">Rawat Jalan</option>
                <option value="inpatient">Rawat Inap</option>
                <option value="emergency">Darurat</option>
                <option value="wellness">Pemeriksaan Kesehatan</option>
                <option value="telehealth">Telemedisin</option>
              </select>
              {errors.encounter_type && (
                <p className="mt-1 text-sm text-red-600">{errors.encounter_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioritas
              </label>
              <select className="input" {...register('priority')}>
                <option value="routine">Rutin</option>
                <option value="urgent">Mendesak</option>
                <option value="emergent">Darurat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Masuk *
              </label>
              <input
                type="datetime-local"
                className={`input ${errors.admission_date ? 'border-red-500' : ''}`}
                {...register('admission_date', { required: 'Tanggal masuk wajib diisi' })}
                defaultValue={new Date().toISOString().slice(0, 16)}
              />
              {errors.admission_date && (
                <p className="mt-1 text-sm text-red-600">{errors.admission_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departemen
              </label>
              <input
                type="text"
                className="input"
                {...register('department')}
                placeholder="mis: Penyakit Dalam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi
              </label>
              <input
                type="text"
                className="input"
                {...register('location')}
                placeholder="mis: Ruang 201"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keluhan Utama
              </label>
              <textarea
                className="input"
                rows="2"
                {...register('chief_complaint')}
                placeholder="Keluhan utama atau alasan kunjungan pasien"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alasan Kunjungan
              </label>
              <textarea
                className="input"
                rows="2"
                {...register('reason_for_visit')}
                placeholder="Alasan kunjungan secara detail"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Link to="/kunjungan" className="btn btn-secondary">
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Membuat...' : 'Buat Kunjungan'}
          </button>
        </div>
      </form>
    </div >
  )
}

export default CreateEncounterPage
