import api from './api'

export const encounterService = {
  // Get all encounters with filters
  getEncounters: async (page = 1, pageSize = 20, filters = {}) => {
    const params = { page, page_size: pageSize, ...filters }
    const response = await api.get('/kunjungan', { params })
    return response.data
  },

  // Get single encounter by ID
  getEncounter: async (id) => {
    const response = await api.get(`/kunjungan/${id}`)
    return response.data
  },

  // Create new encounter
  createEncounter: async (encounterData) => {
    const response = await api.post('/kunjungan', encounterData)
    return response.data
  },

  // Update encounter status
  updateEncounterStatus: async (id, status) => {
    const response = await api.put(`/kunjungan/${id}/status`, { status })
    return response.data
  },

  // Add clinical note
  addClinicalNote: async (encounterId, noteData) => {
    const response = await api.post(`/kunjungan/${encounterId}/catatan`, noteData)
    return response.data
  },

  // Add diagnosis
  addDiagnosis: async (encounterId, diagnosisData) => {
    const response = await api.post(`/kunjungan/${encounterId}/diagnosis`, diagnosisData)
    return response.data
  },

  // Record vital signs
  recordVitalSigns: async (encounterId, vitalsData) => {
    const response = await api.post(`/kunjungan/${encounterId}/tanda-vital`, vitalsData)
    return response.data
  },
}
