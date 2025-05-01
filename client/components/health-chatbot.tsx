"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useHealthData } from "@/lib/health-data-provider"
import { Icons } from "@/components/icons"
import MainNav from "@/components/main-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { useAuth } from "@/lib/auth-provider"
import ReactMarkdown from "react-markdown"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function HealthChatbot() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { healthData } = useHealthData()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your health assistant. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Prepare health data for the AI
  const prepareHealthContext = () => {
    // Get the last 7 days of data
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Filter and format BPM data
    const bpmData = Object.entries(healthData.BPM || {})
    .filter(([timestamp]) => new Date(timestamp) >= sevenDaysAgo)
    .map(([timestamp, value]) => {
      const bpm = Object.values(value)[0]
      return `${new Date(timestamp).toLocaleString()}: ${bpm} BPM`;
    });

    // Filter and format SPO2 data
    const spo2Data = Object.entries(healthData.SPO2 || {})
      .filter(([timestamp]) => new Date(timestamp) >= sevenDaysAgo)
      .map(([timestamp, value]) => {
        const spo2 = Object.values(value)[0];
        return `${new Date(timestamp).toLocaleString()}: ${spo2}%`;
      });

    // Filter and format temperature data
    const tempData = Object.entries(healthData.temperature || {})
      .filter(([timestamp]) => new Date(timestamp) >= sevenDaysAgo)
      .map(([timestamp, value]) => {
        const temp = Object.values(value)[0];
        return `${new Date(timestamp).toLocaleString()}: ${temp}°C`;
      });


    return {
      bioData: healthData.bioData || {},
      bpmData,
      spo2Data,
      tempData,
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    setIsLoading(true)

    try {
      // Prepare health context
      const healthContext = prepareHealthContext()
      // console.log("Health context:", healthContext)

      // Custom system prompt with health data context
      const systemPrompt = `
        You are a helpful health assistant that provides information and advice based on the user's health data.
        
        User's health data for the past 7 days:
        
        BPM readings:
        ${healthContext.bpmData.length > 0 ? healthContext.bpmData.join("\n") : "No BPM data available"}
        
        SPO2 readings:
        ${healthContext.spo2Data.length > 0 ? healthContext.spo2Data.join("\n") : "No SPO2 data available"}
        
        Temperature readings:
        ${healthContext.tempData.length > 0 ? healthContext.tempData.join("\n") : "No temperature data available"}
        
        Bio data:
        ${
          Object.entries(healthContext.bioData).map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: [\n  ${value.map((v) => `"${v}"`).join(",\n  ")}\n]`;
            } else if (typeof value === "boolean") {
              return `${key}: ${value ? "true" : "false"}`;
            } else {
              return `${key}: ${value}`;
            }
          }).join("\n") || "No bio data available"
        }

        
        Important guidelines:
        1. Only provide health information and advice based on the user's data.
        2. Do not make definitive medical diagnoses.
        3. Encourage the user to consult with healthcare professionals for serious concerns.
        4. Be empathetic and supportive.
        5. Keep responses concise and easy to understand.
        6. If you don't have enough information, ask clarifying questions.
        7. Ignore all 0 health data readings.
      `
      console.log("System prompt:", systemPrompt)
      console.log("Data message:", healthContext.bioData)
      // Generate response using Gemini

      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const result = await model.generateContent(systemPrompt + "\nUser: " + userMessage)
      const response = await result.response
      const text = response.text()

      // Add AI response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: text }])
    } catch (error) {
      console.error("Error generating response:", error)
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      })

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <Card className="h-[calc(100vh-10rem)]">
            <CardHeader>
              <CardTitle>Health Assistant</CardTitle>
              <CardDescription>Chat with your AI health assistant about your health data and concerns</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`flex max-w-[80%] items-start gap-3 rounded-lg p-3 ${
                          message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                        )}
                        <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        {message.role === "user" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
                            {user?.photoURL && <AvatarImage src={user.photoURL || "/placeholder.svg"} />}
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[80%] items-center gap-3 rounded-lg bg-muted p-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? <Icons.spinner className="h-4 w-4 animate-spin" /> : <Icons.send className="h-4 w-4" />}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
