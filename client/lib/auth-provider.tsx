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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)

      // Redirect logic
      if (user) {
        // If user is logged in and trying to access login/signup pages, redirect to dashboard
        if (pathname === "/login" || pathname === "/signup") {
          router.push("/")
        }
      } else {
        // If user is not logged in and trying to access protected pages, redirect to login
        if (pathname !== "/login" && pathname !== "/signup") {
          router.push("/login")
        }
      }
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
      }

      router.push("/")
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
      router.push("/")
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

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        dateOfJoining: serverTimestamp(),
        bioData: {},
        BPM: {},
        SPO2: {},
        temperature: {},
      })

      router.push("/")
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
