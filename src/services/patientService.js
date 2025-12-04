import api from './api'

export const patientService = {
  // Get all patients with pagination and search
  getPatients: async (page = 1, pageSize = 20, search = '') => {
    const params = { page, page_size: pageSize }
    if (search) params.search = search

    const response = await api.get('/pasien', { params })
    return response.data
  },

  // Get single patient by ID
  getPatient: async (id) => {
    const response = await api.get(`/pasien/${id}`)
    return response.data
  },

  // Create new patient
  createPatient: async (patientData) => {
    const response = await api.post('/pasien', patientData)
    return response.data
  },

  // Update patient
  updatePatient: async (id, patientData) => {
    const response = await api.put(`/pasien/${id}`, patientData)
    return response.data
  },

  // Delete patient
  deletePatient: async (id) => {
    const response = await api.delete(`/pasien/${id}`)
    return response.data
  },

  // Get patient timeline
  getPatientTimeline: async (id) => {
    const response = await api.get(`/pasien/${id}/riwayat`)
    return response.data
  },
}
