"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface LoginFormProps {
  onLogin: (user: any) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([
    { email: "yusuf@foodbot.ai", password: "Yusuf@9525", name: "Yusuf", role: "admin" },
    { email: "poncho@foodbot.ai", password: "Poncho@123", name: "Poncho", role: "user" },
  ])
  const { toast } = useToast()

  // Load users from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem("app_users")
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers)
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setUsers(parsedUsers)
        }
      } catch (error) {
        console.error("Error parsing saved users:", error)
      }
    }

    // Listen for user updates
    const handleUsersUpdated = () => {
      const savedUsers = localStorage.getItem("app_users")
      if (savedUsers) {
        try {
          const parsedUsers = JSON.parse(savedUsers)
          if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
            setUsers(parsedUsers)
          }
        } catch (error) {
          console.error("Error parsing saved users:", error)
        }
      }
    }

    window.addEventListener("usersUpdated", handleUsersUpdated)
    return () => window.removeEventListener("usersUpdated", handleUsersUpdated)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = users.find((u) => u.email === email && u.password === password)

    if (user) {
      onLogin(user)
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
        duration: 2000, // 2 seconds
      })
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
        duration: 2000, // 2 seconds
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#55C800]">FoodBot Login</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:ring-[#55C800] focus:border-[#55C800]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus:ring-[#55C800] focus:border-[#55C800]"
              />
            </div>
            <Button type="submit" className="w-full bg-[#55C800] hover:bg-[#4AB000] text-white" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
