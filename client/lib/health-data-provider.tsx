"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "./firebase"
import { useAuth } from "./auth-provider"

type HealthDataType = {
  BPM: Record<string, string>
  SPO2: Record<string, string>
  temperature: Record<string, string>
  bioData: Record<string, any>
}

type HealthDataContextType = {
  healthData: HealthDataType
  setHealthData: React.Dispatch<React.SetStateAction<HealthDataType>>
  refresher: () => void
}

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined)

export function HealthDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [healthData, setHealthData] = useState<HealthDataType>({
    BPM: {},
    SPO2: {},
    temperature: {},
    bioData: {},
  })
  const [refresh, setRefresh] = useState(true);
  const refresher = () => {
    setRefresh(!refresh);
  }
  useEffect(() => {
    const fetchHealthData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()

            setHealthData({
              BPM: userData.BPM || {},
              SPO2: userData.SPO2 || {},
              temperature: userData.temperature || {},
              bioData: userData.bioData || {},
            })
          }
        } catch (error) {
          console.error("Error fetching health data:", error)
        }
      }
    }

    fetchHealthData()
  }, [user, refresh])

  return <HealthDataContext.Provider value={{ healthData, setHealthData, refresher }}>{children}</HealthDataContext.Provider>
}

export function useHealthData() {
  const context = useContext(HealthDataContext)

  if (context === undefined) {
    throw new Error("useHealthData must be used within a HealthDataProvider")
  }

  return context
}
