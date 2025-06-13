"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search } from "lucide-react"

export function AdminDashboard() {
  const [users, setUsers] = useState([
    { id: 1, name: "Yusuf", email: "yusuf@foodbot.ai", password: "Yusuf@9525", role: "admin" },
    { id: 2, name: "Poncho", email: "poncho@foodbot.ai", password: "Poncho@123", role: "user" },
  ])

  const [restaurants, setRestaurants] = useState([])
  const [restaurantSearch, setRestaurantSearch] = useState("")

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  })

  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    id: "",
  })

  const { toast } = useToast()

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem("app_users")
    const savedRestaurants = localStorage.getItem("app_restaurants")

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

    if (savedRestaurants) {
      try {
        const parsedRestaurants = JSON.parse(savedRestaurants)
        if (Array.isArray(parsedRestaurants) && parsedRestaurants.length > 0) {
          setRestaurants(parsedRestaurants)
        }
      } catch (error) {
        console.error("Error parsing saved restaurants:", error)
      }
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem("app_users", JSON.stringify(users))
      // Trigger custom event for cross-component updates
      window.dispatchEvent(new CustomEvent("usersUpdated"))
    } catch (error) {
      console.error("Error saving users to localStorage:", error)
    }
  }, [users])

  useEffect(() => {
    try {
      localStorage.setItem("app_restaurants", JSON.stringify(restaurants))
      // Trigger custom event for cross-component updates
      window.dispatchEvent(new CustomEvent("restaurantsUpdated"))
    } catch (error) {
      console.error("Error saving restaurants to localStorage:", error)
    }
  }, [restaurants])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    // Check if email already exists
    if (users.some((user) => user.email === newUser.email)) {
      toast({
        title: "Error",
        description: "Email already exists",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    try {
      // Call webhook to create user
      const response = await fetch("/api/create_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      const user = {
        id: Math.max(...users.map((u) => u.id), 0) + 1,
        ...newUser,
      }

      setUsers((prevUsers) => [...prevUsers, user])
      setNewUser({ name: "", email: "", password: "", role: "user" })

      toast({
        title: "Success",
        description: "User created successfully",
        duration: 2000, // 2 seconds
      })
    } catch (error) {
      // Still create user locally even if webhook fails
      const user = {
        id: Math.max(...users.map((u) => u.id), 0) + 1,
        ...newUser,
      }

      setUsers((prevUsers) => [...prevUsers, user])
      setNewUser({ name: "", email: "", password: "", role: "user" })

      toast({
        title: "Success",
        description: "User created successfully",
        duration: 2000, // 2 seconds
      })
    }
  }

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newRestaurant.name || !newRestaurant.id) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    // Check if restaurant ID already exists
    if (restaurants.some((r) => r.id === newRestaurant.id)) {
      toast({
        title: "Error",
        description: "Restaurant ID already exists",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    try {
      // Call webhook to create restaurant
      const response = await fetch("/api/create_restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRestaurant),
      })

      setRestaurants((prevRestaurants) => [...prevRestaurants, { ...newRestaurant }])
      setNewRestaurant({ name: "", id: "" })

      toast({
        title: "Success",
        description: "Restaurant created successfully",
        duration: 2000, // 2 seconds
      })
    } catch (error) {
      // Still create restaurant locally even if webhook fails
      setRestaurants((prevRestaurants) => [...prevRestaurants, { ...newRestaurant }])
      setNewRestaurant({ name: "", id: "" })

      toast({
        title: "Success",
        description: "Restaurant created successfully",
        duration: 2000, // 2 seconds
      })
    }
  }

  const deleteUser = (userId: number) => {
    // Prevent deletion of default admin and user accounts
    if (userId <= 2) {
      toast({
        title: "Error",
        description: "Cannot delete default accounts",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
  }

  const deleteRestaurant = (restaurantId: string) => {
    setRestaurants((prevRestaurants) => prevRestaurants.filter((restaurant) => restaurant.id !== restaurantId))
  }

  // Filter restaurants based on search
  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(restaurantSearch.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#55C800]">Admin Dashboard</CardTitle>
          <CardDescription>Manage users and restaurants</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create User Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Name</Label>
                <Input
                  id="userName"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter user name"
                  className="focus:ring-[#55C800] focus:border-[#55C800]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                  className="focus:ring-[#55C800] focus:border-[#55C800]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userPassword">Password</Label>
                <Input
                  id="userPassword"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                  className="focus:ring-[#55C800] focus:border-[#55C800]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userRole">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger className="focus:ring-[#55C800] focus:border-[#55C800]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-[#55C800] hover:bg-[#4AB000]">
                Create User
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Add Restaurant Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRestaurant} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input
                  id="restaurantName"
                  value={newRestaurant.name}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                  placeholder="Enter restaurant name"
                  className="focus:ring-[#55C800] focus:border-[#55C800]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restaurantId">Restaurant ID</Label>
                <Input
                  id="restaurantId"
                  value={newRestaurant.id}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, id: e.target.value })}
                  placeholder="Enter restaurant ID (e.g., rest_4)"
                  className="focus:ring-[#55C800] focus:border-[#55C800]"
                />
              </div>
              <Button type="submit" className="w-full bg-[#55C800] hover:bg-[#4AB000]">
                Add Restaurant
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === "admin" ? "bg-[#55C800] text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                    {user.id > 2 && (
                      <Button variant="destructive" size="sm" onClick={() => deleteUser(user.id)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Restaurants List */}
        <Card>
          <CardHeader>
            <CardTitle>All Restaurants ({restaurants.length})</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search restaurants..."
                value={restaurantSearch}
                onChange={(e) => setRestaurantSearch(e.target.value)}
                className="pl-10 focus:ring-[#55C800] focus:border-[#55C800]"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{restaurant.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="destructive" size="sm" onClick={() => deleteRestaurant(restaurant.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {filteredRestaurants.length === 0 && restaurantSearch && (
                <div className="text-center py-4 text-gray-500">
                  <p>No restaurants found matching "{restaurantSearch}"</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
