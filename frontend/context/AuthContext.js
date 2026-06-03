import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const userData = localStorage.getItem('mjengoUser')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const register = (name, phone, email) => {
    const userData = { name, phone, email, id: Date.now() }
    localStorage.setItem('mjengoUser', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const login = (email, password) => {
    // For demo, just check if user exists in localStorage
    const userData = localStorage.getItem('mjengoUser')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      return parsed
    }
    throw new Error('Invalid credentials')
  }

  const logout = () => {
    localStorage.removeItem('mjengoUser')
    localStorage.removeItem('mjengoSites')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}