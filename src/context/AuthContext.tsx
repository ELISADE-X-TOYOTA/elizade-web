import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  fetchCurrentUser,
  logoutApi,
  requestOtp,
  verifyOtp,
  type OtpRequestBody,
} from '@/lib/auth-api'
import { getAccessToken } from '@/lib/api'
import { canAccessAdminPortal as checkAdminPortal } from '@/lib/auth-utils'
import type { UserProfile } from '@/types'

interface AuthContextType {
  isAuthenticated: boolean
  user: UserProfile | null
  isAdmin: boolean
  isStaff: boolean
  canAccessAdminPortal: boolean
  isLoading: boolean
  login: (payload: OtpRequestBody) => Promise<void>
  logout: () => void
  completeOtp: (phone: string, code: string) => Promise<UserProfile>
  resetOtp: () => void
  pendingOtp: boolean
  pendingPhone: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pendingOtp, setPendingOtp] = useState(false)
  const [pendingPhone, setPendingPhone] = useState('')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const bootstrap = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const profile = await fetchCurrentUser()
      setUser(profile)
      setIsAuthenticated(true)
    } catch {
      logoutApi()
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  const login = async (payload: OtpRequestBody) => {
    await requestOtp(payload)
    setPendingPhone(payload.phone)
    setPendingOtp(true)
  }

  const completeOtp = async (phone: string, code: string) => {
    const data = await verifyOtp(phone, code)
    setPendingOtp(false)
    setPendingPhone('')
    setUser(data.user)
    setIsAuthenticated(true)
    return data.user
  }

  const resetOtp = () => {
    setPendingOtp(false)
    setPendingPhone('')
  }

  const logout = () => {
    logoutApi()
    setIsAuthenticated(false)
    setUser(null)
    setPendingOtp(false)
    setPendingPhone('')
  }

  const isAdmin = user?.role === 'admin'
  const isStaff = user?.role === 'staff'
  const canAccessAdminPortal = checkAdminPortal(user?.role)

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isAdmin,
        isStaff,
        canAccessAdminPortal,
        isLoading,
        login,
        logout,
        completeOtp,
        resetOtp,
        pendingOtp,
        pendingPhone,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}