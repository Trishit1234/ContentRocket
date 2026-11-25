import axios from 'axios'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
export const apiIsConfigured = import.meta.env.DEV || Boolean(configuredApiBaseUrl)

export const api = axios.create({
  // Only local development may fall back to localhost. Production deployments
  // must point at the shared hosted Django API via VITE_API_BASE_URL.
  baseURL: configuredApiBaseUrl || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '/api'),
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    config._accessToken = token
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.config?._accessToken === localStorage.getItem('access')) {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
    }
    return Promise.reject(error)
  },
)
