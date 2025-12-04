import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { appointmentService } from '../../services/appointmentService'
import { patientService } from '../../services/patientService'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'
import { FiArrowLeft } from 'react-icons/fi'
import { format } from 'date-fns'

function CreateAppointmentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState([])
  const [providers, setProviders] = useState([])
  const [availability, setAvailability] = useState([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      duration: 30,
    },
  })

  const watchedDuration = watch('duration')

  useEffect(() => {
    loadPatients()
    loadProviders()

    // Pre-fill patient if passed in URL
    const patientId = searchParams.get('patient')
    if (patientId) {
      setValue('patient_id', patientId)
    }
  }, [])

  useEffect(() => {
    if (selectedProvider && selectedDate) {
      loadProviderAvailability()
    }
  }, [selectedProvider, selectedDate])

  const loadPatients = async () => {
    try {
      const data = await patientService.getPatients(1, 100)
      setPatients(data.data || [])
    } catch (error) {
      console.error('Error loading patients:', error)
    }
  }

  const loadProviders = async () => {
    try {
      // Fetch users with doctor role
      const data = await userService.getUsers('doctor', 1, 100)
      setProviders(data.data || [])
    } catch (error) {
      console.error('Error loading providers:', error)
    }
  }

  const loadProviderAvailability = async () => {
    try {
      setLoadingAvailability(true)
      const slots = await appointmentService.getProviderAvailability(selectedProvider, selectedDate)
      setAvailability(slots || [])
    } catch (error) {
      console.error('Error loading availability:', error)
      setAvailability([])
    } finally {
      setLoadingAvailability(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const appointmentData = {
        ...data,
        start_time: new Date(data.start_time).toISOString(),
        duration: parseInt(data.duration),
      }

      await appointmentService.createAppointment(appointmentData)
      toast.success('Janji temu berhasil dibuat!')
      navigate('/janji-temu')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat janji temu')
      console.error('Error creating appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSlotSelect = (slot) => {
    setValue('start_time', format(new Date(slot.start_time), "yyyy-MM-dd'T'HH:mm"))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Link to="/janji-temu" className="mr-4">
          <FiArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Janji Temu Baru</h1>
          <p className="text-gray-600">Jadwalkan janji temu pasien baru</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Detail Janji Temu</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pasien *
                  </label>
                  <select
                    className={`input ${errors.patient_id ? 'border-red-500' : ''}`}
                    {...register('patient_id', { required: 'Pasien wajib dipilih' })}
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
                  <select
                    className={`input ${errors.provider_id ? 'border-red-500' : ''}`}
                    {...register('provider_id', { required: 'Dokter wajib dipilih' })}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                  >
                    <option value="">Pilih dokter</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        Dr. {provider.first_name} {provider.last_name}
                      </option>
                    ))}
                  </select>
                  {errors.provider_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.provider_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe Janji Temu *
                  </label>
                  <select
                    className={`input ${errors.appointment_type ? 'border-red-500' : ''}`}
                    {...register('appointment_type', { required: 'Tipe wajib dipilih' })}
                  >
                    <option value="">Pilih tipe</option>
                    <option value="consultation">Konsultasi</option>
                    <option value="follow_up">Tindak Lanjut</option>
                    <option value="wellness">Pemeriksaan Kesehatan</option>
                    <option value="procedure">Prosedur</option>
                    <option value="telehealth">Telemedisin</option>
                  </select>
                  {errors.appointment_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.appointment_type.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal *
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durasi (menit) *
                    </label>
                    <select
                      className="input"
                      {...register('duration', { required: true })}
                    >
                      <option value="15">15 menit</option>
                      <option value="30">30 menit</option>
                      <option value="45">45 menit</option>
                      <option value="60">1 jam</option>
                      <option value="90">1,5 jam</option>
                      <option value="120">2 jam</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Mulai *
                  </label>
                  <input
                    type="datetime-local"
                    className={`input ${errors.start_time ? 'border-red-500' : ''}`}
                    {...register('start_time', { required: 'Waktu mulai wajib diisi' })}
                  />
                  {errors.start_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    className="input"
                    {...register('location')}
                    placeholder="mis: Gedung A, Ruang 201"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan Kunjungan
                  </label>
                  <textarea
                    className="input"
                    rows="3"
                    {...register('reason_for_visit')}
                    placeholder="Deskripsi singkat alasan janji temu ini"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    className="input"
                    rows="2"
                    {...register('notes')}
                    placeholder="Catatan tambahan atau instruksi"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Link to="/janji-temu" className="btn btn-secondary">
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary disabled:opacity-50"
              >
                {loading ? 'Membuat...' : 'Buat Janji Temu'}
              </button>
            </div>
          </form>
        </div>

        {/* Availability Sidebar */}
        <div className="card h-fit sticky top-6">
          <h3 className="text-lg font-semibold mb-4">Slot Waktu Tersedia</h3>

          {!selectedProvider ? (
            <p className="text-gray-500 text-sm">Pilih dokter untuk melihat ketersediaan</p>
          ) : loadingAvailability ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : availability.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availability.filter(slot => slot.available).map((slot, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSlotSelect(slot)}
                  className="w-full text-left px-3 py-2 border rounded-lg hover:bg-primary-50 hover:border-primary-500 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {format(new Date(slot.start_time), 'HH:mm')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {watchedDuration} min
                    </span>
                  </div>
                </button>
              ))}
              {availability.filter(slot => slot.available).length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  Tidak ada slot tersedia untuk tanggal ini
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Tidak ada data ketersediaan</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateAppointmentPage
