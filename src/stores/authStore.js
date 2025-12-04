import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await api.post('/otentikasi/masuk', { email, password })
          const { access_token, refresh_token, user } = response.data

          set({
            user,
            token: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
          })

          // Set default authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

          return { success: true }
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.message || 'Login failed',
          }
        }
      },

      logout: async () => {
        try {
          await api.post('/otentikasi/keluar')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          })
          delete api.defaults.headers.common['Authorization']
        }
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = useAuthStore.getState()
          const response = await api.post('/otentikasi/segarkan', {
            refresh_token: refreshToken,
          })
          const { access_token, refresh_token } = response.data

          set({
            token: access_token,
            refreshToken: refresh_token,
          })

          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

          return true
        } catch (error) {
          // If refresh fails, logout
          useAuthStore.getState().logout()
          return false
        }
      },

      setUser: (user) => set({ user }),

      // Permission helpers
      hasRole: (role) => {
        const { user } = useAuthStore.getState()
        if (!user || !user.roles) return false
        const userRoles = user.roles.map(r => r.code)
        return userRoles.includes(role)
      },

      hasPermission: (permission) => {
        const { user } = useAuthStore.getState()
        if (!user || !user.roles) return false

        for (const role of user.roles) {
          if (role.permissions && role.permissions.some(p => p.code === permission)) {
            return true
          }
        }
        return false
      },

      canDelete: (resource) => {
        const { user } = useAuthStore.getState()
        if (!user) return false

        const deletePermissions = {
          patient: 'delete_patients',
          encounter: 'update_encounters',
        }

        const permission = deletePermissions[resource]
        return permission ? useAuthStore.getState().hasPermission(permission) : false
      },

      isAdmin: () => {
        return useAuthStore.getState().hasRole('admin')
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialize axios with stored token
const token = useAuthStore.getState().token
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}
