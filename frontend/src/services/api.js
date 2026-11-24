import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
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
