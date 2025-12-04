import api from './api'

export const userService = {
  // Get all users with pagination and optional role filtering
  getUsers: async (role = '', page = 1, pageSize = 100) => {
    const params = { page, page_size: pageSize }
    if (role) params.role = role

    const response = await api.get('/pengguna', { params })
    return response.data
  },
}
