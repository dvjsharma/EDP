"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./firebase"
import { useRouter, usePathname } from "next/navigation"

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Check if user has completed medical profile
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const hasBioData = userData.bioData && Object.keys(userData.bioData).length > 0

            // If user is logged in and trying to access login/signup pages, redirect to dashboard
            if (pathname === "/login" || pathname === "/signup") {
              router.push("/")
            }
            // If user doesn't have bioData and isn't on the medical page, redirect to medical
            else if (!hasBioData && pathname !== "/medical") {
              router.push("/medical")
            }
          }
        } catch (error) {
          console.error("Error checking user data:", error)
        }
      } else {
        // If user is not logged in and trying to access protected pages, redirect to login
        if (pathname !== "/login" && pathname !== "/signup") {
          router.push("/login")
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [pathname, router])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if user document exists, if not create one
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          dateOfJoining: serverTimestamp(),
          bioData: {},
          BPM: {},
          SPO2: {},
          temperature: {},
        })

        // New user, redirect to medical profile
        router.push("/medical")
      } else {
        // Check if user has bioData
        const userData = userDoc.data()
        if (!userData.bioData || Object.keys(userData.bioData).length === 0) {
          router.push("/medical")
        } else {
          router.push("/")
        }
      }
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)

      // Check if user has bioData
      const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        if (!userData.bioData || Object.keys(userData.bioData).length === 0) {
          router.push("/medical")
        } else {
          router.push("/")
        }
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Error signing in with email:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    try {
      setLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        dateOfJoining: serverTimestamp(),
        bioData: {},
        BPM: {},
        SPO2: {},
        temperature: {},
      })

      router.push("/medical")
    } catch (error) {
      console.error("Error signing up with email:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
