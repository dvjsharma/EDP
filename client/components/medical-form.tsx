"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useHealthData } from "@/lib/health-data-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, LineChart } from "@/components/ui/chart"
import MainNav from "@/components/main-nav"

export default function MedicalForm() {
  // const { data: session } = useSession()
  const { healthData } = useHealthData()
  const [timeRange, setTimeRange] = useState("7days")

  // Prepare chart data
  const prepareChartData = (dataType: "BPM" | "SPO2" | "temperature") => {
    const entries = Object.entries(healthData[dataType] || {})
    if (entries.length === 0) return []

    // Sort by date (oldest first)
    entries.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())

    // Filter by time range
    const now = new Date()
    const filtered = entries.filter(([timestamp]) => {
      const date = new Date(timestamp)
      if (timeRange === "24hours") {
        return now.getTime() - date.getTime() <= 24 * 60 * 60 * 1000
      } else if (timeRange === "7days") {
        return now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000
      } else if (timeRange === "30days") {
        return now.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000
      }
      return true
    })

    // Format for chart
    return filtered.map(([timestamp, value]) => ({
      date: new Date(timestamp).toLocaleString(),
      value: Number.parseFloat(value),
    }))
  }

  // Calculate statistics
  const calculateStats = (dataType: "BPM" | "SPO2" | "temperature") => {
    const entries = Object.entries(healthData[dataType] || {})
    if (entries.length === 0) return { avg: 0, min: 0, max: 0 }

    const values = entries.map(([_, value]) => Number.parseFloat(value))
    const sum = values.reduce((acc, val) => acc + val, 0)

    return {
      avg: (sum / values.length).toFixed(1),
      min: Math.min(...values).toFixed(1),
      max: Math.max(...values).toFixed(1),
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Health Analytics</h1>
            <p className="text-muted-foreground">Analyze your health data over time</p>
          </div>

          <div className="flex justify-end">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24hours">Last 24 Hours</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </main>
    </div>
  )
}
