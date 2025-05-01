"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useHealthData } from "@/lib/health-data-provider"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Icons } from "@/components/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Heart, Thermometer } from "lucide-react"
import Link from "next/link"
import MainNav from "@/components/main-nav"
import { useAuth } from "@/lib/auth-provider"
import axios from "axios"

export default function Dashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { healthData, setHealthData, refresher } = useHealthData()
  const [isLoadingBPM, setIsLoadingBPM] = useState(false)
  const [isLoadingSPO2, setIsLoadingSPO2] = useState(false)
  const [isLoadingTemp, setIsLoadingTemp] = useState(false)
  const gunhost = "192.168.226.238"
  const kioskhost = "192.168.226.27"
  // Mock API calls
  const fetchBPM = async () => {
    setIsLoadingBPM(true)
    try {
      // Simulate API call
      const response = await axios.get(`http://${kioskhost}:80/bpm`)

      const bpmValue = response.data
      // Update context
      setHealthData((prev) => ({
        ...prev,
        BPM: {
          ...prev.BPM,
          [new Date().toISOString()]: bpmValue,
        },
      }))

      // Update Firebase
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid)
        await updateDoc(userRef, {
          [`BPM.${new Date().toISOString()}`]: bpmValue,
        })
      }
      refresher();
      toast({
        title: "BPM Updated",
        description: `Your heart rate is ${bpmValue} BPM`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch BPM data",
        variant: "destructive",
      })
    } finally {
      setIsLoadingBPM(false)
    }
  }

  const fetchSPO2 = async () => {
    setIsLoadingSPO2(true)
    try {
      // Simulate API call
      const response = await axios.get(`http://${kioskhost}:80/spo2`)

      const spo2Value =   response.data

      // Update context
      setHealthData((prev) => ({
        ...prev,
        SPO2: {
          ...prev.SPO2,
          [new Date().toISOString()]: spo2Value,
        },
      }))

      // Update Firebase
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid)
        await updateDoc(userRef, {
          [`SPO2.${new Date().toISOString()}`]: spo2Value,
        })
      }
      refresher();
      toast({
        title: "SPO2 Updated",
        description: `Your oxygen saturation is ${spo2Value}%`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch SPO2 data",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSPO2(false)
    }
  }

  const fetchTemperature = async () => {
    setIsLoadingTemp(true)
    try {
      // Simulate API call
      const response = await axios.get(`http://${gunhost}:80/ambient`)
      console.log("Resp: ", response)
      // const data = await response.json()
      const tempValue =   response.data

      // Update context
      setHealthData((prev) => ({  
        ...prev,
        temperature: {
          ...prev.temperature,
          [new Date().toISOString()]: tempValue,
        },
      }))

      // Update Firebase
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid)
        await updateDoc(userRef, {
          [`temperature.${new Date().toISOString()}`]: tempValue,
        })
      }
      refresher();
      toast({
        title: "Temperature Updated",
        description: `Your body temperature is ${tempValue}°C`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch temperature data",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTemp(false)
    }
  }

  // Get latest readings
  const getLatestReading = (dataType: "BPM" | "SPO2" | "temperature") => {
    const entries = Object.entries(healthData[dataType] || {})
    if (entries.length === 0) return "No data"

    // Sort by date (newest first) and get the first entry
    entries.sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    console.log("data haiii", dataType, entries);
    // return entries[0][1];
    
    return Object.values(entries[0][1])[0];
  }
  console.log("wha data aaagya", (
    Object.entries(healthData.temperature || {})
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .slice(0, 5)
      .map(([timestamp, value]) => (
        <div key={timestamp} className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{new Date(timestamp).toLocaleString()}</div>
          <div className="font-medium">{value}°C</div>
        </div>
  ))));
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Health Dashboard</h1>
            <p className="text-muted-foreground">Monitor your vital signs and health metrics</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                <Heart className="h-4 w-4 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getLatestReading("BPM")} BPM</div>
              </CardContent>
              <CardFooter>
                <Button onClick={fetchBPM} className="w-full" disabled={isLoadingBPM}>
                  {isLoadingBPM ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Measuring...
                    </>
                  ) : (
                    "Measure BPM"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Oxygen Saturation</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getLatestReading("SPO2")}%</div>
              </CardContent>
              <CardFooter>
                <Button onClick={fetchSPO2} className="w-full" disabled={isLoadingSPO2}>
                  {isLoadingSPO2 ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Measuring...
                    </>
                  ) : (
                    "Measure SPO2"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Body Temperature</CardTitle>
                <Thermometer className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getLatestReading("temperature")}°C</div>
              </CardContent>
              <CardFooter>
                <Button onClick={fetchTemperature} className="w-full" disabled={isLoadingTemp}>
                  {isLoadingTemp ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Measuring...
                    </>
                  ) : (
                    "Measure Temperature"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Tabs defaultValue="bpm" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bpm">Heart Rate History</TabsTrigger>
              <TabsTrigger value="spo2">SPO2 History</TabsTrigger>
              <TabsTrigger value="temp">Temperature History</TabsTrigger>
            </TabsList>
            <TabsContent value="bpm">
              <Card>
                <CardHeader>
                  <CardTitle>Heart Rate Measurements</CardTitle>
                  <CardDescription>Your recent BPM readings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(healthData.BPM || {}).length > 0 ? (
                      Object.entries(healthData.BPM || {})
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                        .slice(0, 5)
                        .map(([timestamp, value]) => (
                          <div key={timestamp} className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">{new Date(timestamp).toLocaleString()}</div>
                            <div className="font-medium">{Object.values(value)[0]} BPM</div>
                          </div>
                        ))
                    ) : (
                      <p className="text-center text-muted-foreground">No BPM data available</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/analytics" className="w-full">
                    <Button variant="outline" className="w-full">
                      View Full Analytics
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="spo2">
              <Card>
                <CardHeader>
                  <CardTitle>Oxygen Saturation Measurements</CardTitle>
                  <CardDescription>Your recent SPO2 readings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(healthData.SPO2 || {}).length > 0 ? (
                      Object.entries(healthData.SPO2 || {})
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                        .slice(0, 5)
                        .map(([timestamp, value]) => (
                          <div key={timestamp} className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{new Date(timestamp).toLocaleString()}</p>
                            <p className="font-medium">{Object.values(value)[0]}%</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-center text-muted-foreground">No SPO2 data available</p>
                    )}
                    
                    
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/analytics" className="w-full">
                    <Button variant="outline" className="w-full">
                      View Full Analytics
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="temp">
              <Card>
                <CardHeader>
                  <CardTitle>Temperature Measurements</CardTitle>
                  <CardDescription>Your recent temperature readings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(healthData.temperature || {}).length > 0 ? (
                      Object.entries(healthData.temperature || {})
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                        .slice(0, 5)
                        .map(([timestamp, value]) => (
                          <div key={timestamp} className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">{new Date(timestamp).toLocaleString()}</div>
                            <div className="font-medium">{Object.values(value)[0]}°C</div>
                          </div>
                        ))
                    ) : (
                      <p className="text-center text-muted-foreground">No temperature data available</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/analytics" className="w-full">
                    <Button variant="outline" className="w-full">
                      View Full Analytics
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center">
            <Link href="/chatbot">
              <Button size="lg" className="gap-2">
                <Icons.message className="h-4 w-4" />
                Talk to Health Assistant
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
