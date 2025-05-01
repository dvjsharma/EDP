import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { HealthDataProvider } from "@/lib/health-data-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Patient Health Monitor",
  description: "Monitor and analyze patient health data",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <HealthDataProvider>
              {children}
              <Toaster />
            </HealthDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
