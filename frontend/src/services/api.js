import axios from 'axios'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const hostedApiBaseUrl = 'https://contentrocket.onrender.com/api'
const apiBaseUrl = configuredApiBaseUrl || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : hostedApiBaseUrl)
export const apiIsConfigured = Boolean(apiBaseUrl)

export const api = axios.create({
  // Only local development may fall back to localhost. Production deployments
  // uses the shared hosted Django API unless the deployment overrides it.
  baseURL: apiBaseUrl,
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
