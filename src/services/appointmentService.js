import api from './api'

export const appointmentService = {
  // Get all appointments with filters
  getAppointments: async (page = 1, pageSize = 20, filters = {}) => {
    const params = { page, page_size: pageSize, ...filters }
    const response = await api.get('/janji-temu', { params })
    return response.data
  },

  // Get single appointment by ID
  getAppointment: async (id) => {
    const response = await api.get(`/janji-temu/${id}`)
    return response.data
  },

  // Create new appointment
  createAppointment: async (appointmentData) => {
    const response = await api.post('/janji-temu', appointmentData)
    return response.data
  },

  // Update appointment
  updateAppointment: async (id, appointmentData) => {
    const response = await api.put(`/janji-temu/${id}`, appointmentData)
    return response.data
  },

  // Cancel appointment
  cancelAppointment: async (id, reason) => {
    const response = await api.post(`/janji-temu/${id}/batal`, { reason })
    return response.data
  },

  // Check-in appointment
  checkInAppointment: async (id) => {
    const response = await api.post(`/janji-temu/${id}/check-in`)
    return response.data
  },

  // Get provider availability
  getProviderAvailability: async (providerId, date) => {
    const response = await api.get(`/janji-temu/ketersediaan`, {
      params: { date, provider_id: providerId },
    })
    return response.data
  },
}
