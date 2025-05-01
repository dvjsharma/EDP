"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useHealthData } from "@/lib/health-data-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, LineChart } from "@/components/ui/chart"
import MainNav from "@/components/main-nav"

export default function AnalyticsDashboard() {
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
      value: Number.parseFloat(Object.values(value)[0]),
    }))
  }

  // Calculate statistics
  const calculateStats = (dataType: "BPM" | "SPO2" | "temperature") => {
    const entries = Object.entries(healthData[dataType] || {})
    if (entries.length === 0) return { avg: 0, min: 0, max: 0 }

    const values = entries.map(([_, value]) => Number.parseFloat(Object.values(value)[0]))
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

          <Tabs defaultValue="bpm" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bpm">Heart Rate</TabsTrigger>
              <TabsTrigger value="spo2">Oxygen Saturation</TabsTrigger>
              <TabsTrigger value="temp">Temperature</TabsTrigger>
            </TabsList>

            <TabsContent value="bpm">
              <Card>
                <CardHeader>
                  <CardTitle>Heart Rate Analysis</CardTitle>
                  <CardDescription>Your BPM readings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Average</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{calculateStats("BPM").avg} BPM</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Minimum</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{calculateStats("BPM").min} BPM</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Maximum</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{calculateStats("BPM").max} BPM</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="h-[300px]">
                    {prepareChartData("BPM").length > 0 ? (
                      <ChartContainer>
                        <LineChart
                          data={prepareChartData("BPM")}
                          xAxisKey="date"
                          series={[
                            {
                              key: "value",
                              label: "BPM",
                              color: "hsl(346, 84.3%, 60.6%)",
                            },
                          ]}
                          tooltip={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                                      <span className="font-bold text-muted-foreground">{payload[0].payload.date}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">BPM</span>
                                      <span className="font-bold">{payload[0].value}</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </ChartContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No BPM data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="spo2">
              <Card>
                <CardHeader>
                  <CardTitle>Oxygen Saturation Analysis</CardTitle>
                  <CardDescription>Your SPO2 readings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Average</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{calculateStats("SPO2").avg}%</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Minimum</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{calculateStats("SPO2").min}%</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Maximum</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{calculateStats("SPO2").max}%</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="h-[300px]">
                    {prepareChartData("SPO2").length > 0 ? (
                      <ChartContainer>
                        <LineChart
                          data={prepareChartData("SPO2")}
                          xAxisKey="date"
                          series={[
                            {
                              key: "value",
                              label: "SPO2",
                              color: "hsl(217, 91.2%, 59.8%)",
                            },
                          ]}
                          tooltip={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                                      <span className="font-bold text-muted-foreground">{payload[0].payload.date}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">SPO2</span>
                                      <span className="font-bold">{payload[0].value}%</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </ChartContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No SPO2 data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="temp">
              <Card>
                <CardHeader>
                  <CardTitle>Temperature Analysis</CardTitle>
                  <CardDescription>Your temperature readings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Average</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{calculateStats("temperature").avg}°C</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Minimum</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{calculateStats("temperature").min}°C</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Maximum</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{calculateStats("temperature").max}°C</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="h-[300px]">
                    {prepareChartData("temperature").length > 0 ? (
                      <ChartContainer>
                        <LineChart
                          data={prepareChartData("temperature")}
                          xAxisKey="date"
                          series={[
                            {
                              key: "value",
                              label: "Temperature",
                              color: "hsl(43, 96.4%, 58.6%)",
                            },
                          ]}
                          tooltip={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                                      <span className="font-bold text-muted-foreground">{payload[0].payload.date}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        Temperature
                                      </span>
                                      <span className="font-bold">{payload[0].value}°C</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </ChartContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No temperature data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
