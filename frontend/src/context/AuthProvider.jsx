import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { api } from '../services/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem('access') ? {} : null)

  useEffect(() => {
    const initialToken = localStorage.getItem('access')
    if (!initialToken) return
    api.get('/auth/me/').then((r) => {
      if (localStorage.getItem('access') === initialToken) setUser(r.data)
    }).catch(() => {
      if (localStorage.getItem('access') === initialToken || !localStorage.getItem('access')) setUser(null)
    })
  }, [])

  const login = async (email, password) => {
    const r = await api.post('/auth/login/', { username: email, password })
    localStorage.setItem('access', r.data.access)
    localStorage.setItem('refresh', r.data.refresh)
    setUser({ email })
  }

  const register = async (email, password) => {
    const r = await api.post('/auth/register/', { email, password })
    localStorage.setItem('access', r.data.access)
    localStorage.setItem('refresh', r.data.refresh)
    setUser(r.data.user)
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
