'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, isAdmin } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdminUser: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdminUser: false,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setIsAdminUser(false)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)
      
      if (user) {
        const adminStatus = await isAdmin()
        setIsAdminUser(adminStatus)
        
        if (!adminStatus && pathname?.startsWith('/admin')) {
          router.push('/')
        }
      } else if (pathname?.startsWith('/admin')) {
        router.push('/')
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [pathname, router])

  return (
    <AuthContext.Provider value={{ user, loading, isAdminUser, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}