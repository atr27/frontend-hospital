import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { patientService } from '../../services/patientService'
import toast from 'react-hot-toast'
import { FiArrowLeft } from 'react-icons/fi'

function CreatePatientPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Format the data
      const patientData = {
        ...data,
        date_of_birth: new Date(data.date_of_birth).toISOString(),
        emergency_contact: {
          name: data.emergency_name,
          relationship: data.emergency_relationship,
          phone_number: data.emergency_phone,
          email: data.emergency_email,
        },
        insurance: data.insurance_provider ? {
          provider: data.insurance_provider,
          policy_number: data.insurance_policy_number,
          group_number: data.insurance_group_number,
        } : {},
      }

      // Remove emergency contact fields from root
      delete patientData.emergency_name
      delete patientData.emergency_relationship
      delete patientData.emergency_phone
      delete patientData.emergency_email

      await patientService.createPatient(patientData)
      toast.success('Pasien berhasil dibuat')
      navigate('/pasien')
    } catch (error) {
      toast.error('Gagal membuat pasien')
      console.error('Error creating patient:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/pasien" className="btn btn-ghost btn-sm">
          <FiArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Buat Pasien Baru</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Informasi Pribadi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Depan *
              </label>
              <input
                type="text"
                className={`input ${errors.first_name ? 'border-red-500' : ''}`}
                {...register('first_name', { required: 'Nama depan wajib diisi' })}
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Belakang *
              </label>
              <input
                type="text"
                className={`input ${errors.last_name ? 'border-red-500' : ''}`}
                {...register('last_name', { required: 'Nama belakang wajib diisi' })}
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Tengah
              </label>
              <input
                type="text"
                className="input"
                {...register('middle_name')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir *
              </label>
              <input
                type="date"
                className={`input ${errors.date_of_birth ? 'border-red-500' : ''}`}
                {...register('date_of_birth', { required: 'Tanggal lahir wajib diisi' })}
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin *
              </label>
              <select
                className={`input ${errors.gender ? 'border-red-500' : ''}`}
                {...register('gender', { required: 'Jenis kelamin wajib diisi' })}
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
                <option value="other">Lainnya</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Golongan Darah
              </label>
              <select className="input" {...register('blood_type')}>
                <option value="">Pilih golongan darah</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Pernikahan
              </label>
              <select className="input" {...register('marital_status')}>
                <option value="">Pilih status</option>
                <option value="single">Lajang</option>
                <option value="married">Menikah</option>
                <option value="divorced">Cerai</option>
                <option value="widowed">Janda/Duda</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kewarganegaraan
              </label>
              <input
                type="text"
                className="input"
                {...register('nationality')}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Informasi Kontak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="input"
                {...register('email')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                className="input"
                {...register('phone_number')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <input
                type="text"
                className="input"
                {...register('address')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kota
              </label>
              <input
                type="text"
                className="input"
                {...register('city')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provinsi
              </label>
              <input
                type="text"
                className="input"
                {...register('state')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Pos
              </label>
              <input
                type="text"
                className="input"
                {...register('zip_code')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Negara
              </label>
              <input
                type="text"
                className="input"
                {...register('country')}
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Kontak Darurat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama
              </label>
              <input
                type="text"
                className="input"
                {...register('emergency_name')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hubungan
              </label>
              <input
                type="text"
                className="input"
                {...register('emergency_relationship')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                className="input"
                {...register('emergency_phone')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="input"
                {...register('emergency_email')}
              />
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Informasi Asuransi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Penyedia Asuransi
              </label>
              <input
                type="text"
                className="input"
                {...register('insurance_provider')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Polis
              </label>
              <input
                type="text"
                className="input"
                {...register('insurance_policy_number')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Grup
              </label>
              <input
                type="text"
                className="input"
                {...register('insurance_group_number')}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Link to="/pasien" className="btn btn-secondary">
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Membuat...' : 'Buat Pasien'}
          </button>
        </div>
      </form>
    </div >
  )
}

export default CreatePatientPage
