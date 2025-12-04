import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { encounterService } from '../../services/encounterService'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiPlus } from 'react-icons/fi'
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

function EncounterDetailPage() {
  const { id } = useParams()
  const [encounter, setEncounter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false)
  const [showVitalsForm, setShowVitalsForm] = useState(false)

  const noteForm = useForm()
  const diagnosisForm = useForm()
  const vitalsForm = useForm()

  useEffect(() => {
    loadEncounter()
  }, [id])

  const loadEncounter = async () => {
    try {
      setLoading(true)
      const data = await encounterService.getEncounter(id)
      setEncounter(data)
    } catch (error) {
      toast.error('Gagal memuat kunjungan')
      console.error('Error loading encounter:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async (data) => {
    try {
      console.log('Adding clinical note:', JSON.stringify(data, null, 2))
      await encounterService.addClinicalNote(id, data)
      toast.success('Catatan klinis berhasil ditambahkan')
      setShowNoteForm(false)
      noteForm.reset()
      loadEncounter()
    } catch (error) {
      console.error('Error adding clinical note:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Gagal menambahkan catatan klinis')
    }
  }

  const handleAddDiagnosis = async (data) => {
    try {
      await encounterService.addDiagnosis(id, data)
      toast.success('Diagnosis berhasil ditambahkan')
      setShowDiagnosisForm(false)
      diagnosisForm.reset()
      loadEncounter()
    } catch (error) {
      toast.error('Gagal menambahkan diagnosis')
    }
  }

  const handleRecordVitals = async (data) => {
    try {
      // Convert string values to numbers
      const vitalsData = {
        temperature: data.temperature ? parseFloat(data.temperature) : null,
        temperature_unit: data.temperature_unit || 'celsius',
        heart_rate: data.heart_rate ? parseInt(data.heart_rate) : null,
        respiratory_rate: data.respiratory_rate ? parseInt(data.respiratory_rate) : null,
        blood_pressure_systolic: data.blood_pressure_systolic ? parseInt(data.blood_pressure_systolic) : null,
        blood_pressure_diastolic: data.blood_pressure_diastolic ? parseInt(data.blood_pressure_diastolic) : null,
        oxygen_saturation: data.oxygen_saturation ? parseFloat(data.oxygen_saturation) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        height: data.height ? parseFloat(data.height) : null,
        pain: data.pain ? parseInt(data.pain) : null,
        notes: data.notes || '',
      }

      await encounterService.recordVitalSigns(id, vitalsData)
      toast.success('Tanda vital berhasil dicatat')
      setShowVitalsForm(false)
      vitalsForm.reset()
      loadEncounter()
    } catch (error) {
      toast.error('Gagal mencatat tanda vital')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!encounter) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Kunjungan tidak ditemukan</p>
        <Link to="/kunjungan" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Kembali ke kunjungan
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/kunjungan" className="btn btn-ghost btn-sm">
              <FiArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold">Detail Kunjungan</h1>
          </div>
          <p className="text-gray-600 ml-10">
            {encounter.patient?.first_name} {encounter.patient?.last_name} - {encounter.patient?.mrn}
          </p>
        </div>
        <span className={`badge ${encounter.status === 'completed' ? 'badge-success' :
          encounter.status === 'in_progress' ? 'badge-warning' :
            'badge-info'
          }`}>
          {translateEncounterStatus(encounter.status)}
        </span>
      </div>

      {/* Encounter Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Tipe</h3>
          <p className="text-lg font-semibold">{translateEncounterType(encounter.encounter_type)}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Dokter</h3>
          <p className="text-lg font-semibold">
            {encounter.provider?.first_name} {encounter.provider?.last_name}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Tanggal Masuk</h3>
          <p className="text-lg font-semibold">
            {format(new Date(encounter.admission_date), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>

      {/* Chief Complaint */}
      {
        encounter.chief_complaint && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Keluhan Utama</h3>
            <p className="text-gray-700">{encounter.chief_complaint}</p>
          </div>
        )
      }

      {/* Vital Signs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Tanda Vital</h3>
          <button
            onClick={() => setShowVitalsForm(!showVitalsForm)}
            className="btn btn-primary btn-sm flex items-center"
          >
            <FiPlus className="mr-2" />
            Catat Tanda Vital
          </button>
        </div>

        {showVitalsForm && (
          <form onSubmit={vitalsForm.handleSubmit(handleRecordVitals)} className="mb-4 p-4 border rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suhu (°C)
                </label>
                <input type="number" step="0.1" className="input" {...vitalsForm.register('temperature')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detak Jantung (bpm)
                </label>
                <input type="number" className="input" {...vitalsForm.register('heart_rate')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TD Sistolik
                </label>
                <input type="number" className="input" {...vitalsForm.register('blood_pressure_systolic')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TD Diastolik
                </label>
                <input type="number" className="input" {...vitalsForm.register('blood_pressure_diastolic')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saturasi O2 (%)
                </label>
                <input type="number" step="0.1" className="input" {...vitalsForm.register('oxygen_saturation')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Berat (kg)
                </label>
                <input type="number" step="0.1" className="input" {...vitalsForm.register('weight')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tinggi (cm)
                </label>
                <input type="number" step="0.1" className="input" {...vitalsForm.register('height')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nyeri (0-10)
                </label>
                <input type="number" min="0" max="10" className="input" {...vitalsForm.register('pain')} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="btn btn-primary">Catat</button>
              <button type="button" onClick={() => setShowVitalsForm(false)} className="btn btn-secondary">
                Batal
              </button>
            </div>
          </form>
        )}

        {encounter.vital_signs && encounter.vital_signs.length > 0 ? (
          <div className="space-y-2">
            {encounter.vital_signs.map((vital) => (
              <div key={vital.id} className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500 mb-2">
                  {format(new Date(vital.measured_at), 'MMM dd, yyyy HH:mm')}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {vital.temperature && <div><span className="text-gray-500">Suhu:</span> {vital.temperature}°C</div>}
                  {vital.heart_rate && <div><span className="text-gray-500">DJ:</span> {vital.heart_rate} bpm</div>}
                  {vital.blood_pressure_systolic && (
                    <div>
                      <span className="text-gray-500">TD:</span> {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                    </div>
                  )}
                  {vital.oxygen_saturation && <div><span className="text-gray-500">O2:</span> {vital.oxygen_saturation}%</div>}
                  {vital.bmi && <div><span className="text-gray-500">BMI:</span> {vital.bmi.toFixed(1)}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Tidak ada tanda vital tercatat</p>
        )}
      </div>

      {/* Clinical Notes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Catatan Klinis</h3>
          <button
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="btn btn-primary btn-sm flex items-center"
          >
            <FiPlus className="mr-2" />
            Tambah Catatan
          </button>
        </div>

        {showNoteForm && (
          <form onSubmit={noteForm.handleSubmit(handleAddNote)} className="mb-4 p-4 border rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Catatan</label>
              <select className="input" {...noteForm.register('note_type', { required: true })}>
                <option value="soap">Catatan SOAP</option>
                <option value="progress">Catatan Perkembangan</option>
                <option value="consult">Catatan Konsultasi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subjektif</label>
              <textarea className="input" rows="2" {...noteForm.register('subjective')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objektif</label>
              <textarea className="input" rows="2" {...noteForm.register('objective')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penilaian</label>
              <textarea className="input" rows="2" {...noteForm.register('assessment')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rencana</label>
              <textarea className="input" rows="2" {...noteForm.register('plan')} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Simpan Catatan</button>
              <button type="button" onClick={() => setShowNoteForm(false)} className="btn btn-secondary">
                Batal
              </button>
            </div>
          </form>
        )}

        {encounter.clinical_notes && encounter.clinical_notes.length > 0 ? (
          <div className="space-y-4">
            {encounter.clinical_notes.map((note) => (
              <div key={note.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-info capitalize">{note.note_type}</span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                {note.subjective && <div className="mb-2"><strong>S:</strong> {note.subjective}</div>}
                {note.objective && <div className="mb-2"><strong>O:</strong> {note.objective}</div>}
                {note.assessment && <div className="mb-2"><strong>A:</strong> {note.assessment}</div>}
                {note.plan && <div className="mb-2"><strong>P:</strong> {note.plan}</div>}
                <p className="text-sm text-gray-500 mt-2">
                  Oleh: {note.author?.first_name} {note.author?.last_name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Tidak ada catatan klinis</p>
        )}
      </div>

      {/* Diagnoses */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Diagnosis</h3>
          <button
            onClick={() => setShowDiagnosisForm(!showDiagnosisForm)}
            className="btn btn-primary btn-sm flex items-center"
          >
            <FiPlus className="mr-2" />
            Tambah Diagnosis
          </button>
        </div>

        {showDiagnosisForm && (
          <form onSubmit={diagnosisForm.handleSubmit(handleAddDiagnosis)} className="mb-4 p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode ICD-10 *</label>
                <input className="input" {...diagnosisForm.register('icd10_code', { required: true })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Diagnosis *</label>
                <select className="input" {...diagnosisForm.register('diagnosis_type', { required: true })}>
                  <option value="primary">Primer</option>
                  <option value="secondary">Sekunder</option>
                  <option value="differential">Diferensial</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
              <input className="input" {...diagnosisForm.register('description', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <textarea className="input" rows="2" {...diagnosisForm.register('notes')} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Tambah Diagnosis</button>
              <button type="button" onClick={() => setShowDiagnosisForm(false)} className="btn btn-secondary">
                Batal
              </button>
            </div>
          </form>
        )}

        {encounter.diagnoses && encounter.diagnoses.length > 0 ? (
          <div className="space-y-2">
            {encounter.diagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{diagnosis.description}</p>
                    <p className="text-sm text-gray-500">ICD-10: {diagnosis.icd10_code}</p>
                  </div>
                  <span className="badge badge-info capitalize">{diagnosis.diagnosis_type}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Tidak ada diagnosis tercatat</p>
        )}
      </div>
    </div>
  )
}

export default EncounterDetailPage
