"use client"

import { useState, useEffect } from "react"
import { RestaurantSelector } from "@/components/restaurant-selector"
import { MenuSelector } from "@/components/menu-selector"
import { ModifierListing } from "@/components/modifier-listing"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Search } from "lucide-react"

export function UserDashboard() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [selectedMenu, setSelectedMenu] = useState<any>(null)
  const [menus, setMenus] = useState<any[]>([])
  const [modifiers, setModifiers] = useState<any[]>([])
  const [modifierSearch, setModifierSearch] = useState("")
  const [restaurantSearch, setRestaurantSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const { toast } = useToast()

  // Initial load from localStorage - runs only once
  useEffect(() => {
    const initializeFromStorage = async () => {
      const restaurantId = localStorage.getItem("restaurant_id")
      const menuId = localStorage.getItem("menu_id")

      if (restaurantId) {
        const savedRestaurants = localStorage.getItem("app_restaurants")
        if (savedRestaurants) {
          try {
            const restaurants = JSON.parse(savedRestaurants)
            const restaurant = restaurants.find((r: any) => r.id === restaurantId)
            if (restaurant) {
              setSelectedRestaurant(restaurant)
              await handleRestaurantSelect(restaurant, false)

              if (menuId) {
                // Restore menu selection and load modifiers
                const menu = { id: menuId, name: `Menu ${menuId}` }
                setSelectedMenu(menu)
                await loadModifiers(restaurant.id, menuId)
              }
            }
          } catch (error) {
            console.error("Error parsing saved data:", error)
          }
        }
      }
      setInitialized(true)
    }

    if (!initialized) {
      initializeFromStorage()
    }
  }, [initialized])

  const handleRestaurantSelect = async (restaurant: any, clearMenu = true) => {
    setSelectedRestaurant(restaurant)
    if (clearMenu) {
      setSelectedMenu(null)
      setModifiers([])
      setModifierSearch("")
      localStorage.removeItem("menu_id")
    }
    localStorage.setItem("restaurant_id", restaurant.id)
    setLoading(true)

    try {
      const response = await fetch("/api/restaurant_menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.json()

      // Handle different possible response formats
      let menuArray = []

      if (Array.isArray(responseData)) {
        menuArray = responseData
      } else if (Array.isArray(responseData.menus)) {
        menuArray = responseData.menus
      } else if (Array.isArray(responseData.data)) {
        menuArray = responseData.data
      } else {
        menuArray = []
      }

      // Map the menu array to the expected format
      const mappedMenus = menuArray.map((menu: any) => ({
        id: menu.menu_id || menu.id || `menu_${Math.random().toString(36).substr(2, 5)}`,
        name: menu.menu_name || menu.name || "Unnamed Menu",
      }))

      setMenus(mappedMenus)

      // Removed toast notification for loading menus
    } catch (error) {
      // Only show error toast for critical failures
      console.error("Failed to load menus:", error)
      setMenus([])
    }

    setLoading(false)
  }

  const handleMenuSelect = async (menu: any) => {
    setSelectedMenu(menu)
    setModifierSearch("")
    localStorage.setItem("menu_id", menu.id)
    await loadModifiers(selectedRestaurant.id, menu.id)
  }

  const loadModifiers = async (restaurantId: string, menuId: string) => {
    setLoading(true)
    setModifiers([]) // Clear existing modifiers first

    try {
      console.log(`🔄 Loading modifiers for restaurant: ${restaurantId}, menu: ${menuId}`)

      const response = await fetch("/api/modifier_listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          menu_id: menuId,
          timestamp: new Date().toISOString(),
        }),
      })

      console.log(`📡 Modifier listing response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.json()
      console.log("✅ Modifier listing response:", responseData)

      // Handle different possible response formats
      let modifierArray = []

      if (Array.isArray(responseData)) {
        modifierArray = responseData
      } else if (responseData && Array.isArray(responseData.modifiers)) {
        modifierArray = responseData.modifiers
      } else if (responseData && Array.isArray(responseData.data)) {
        modifierArray = responseData.data
      } else if (responseData && Array.isArray(responseData.modifier_categories)) {
        modifierArray = responseData.modifier_categories
      } else {
        console.warn("Unexpected response format:", responseData)
        modifierArray = []
      }

      console.log(`✅ Processed modifier array:`, modifierArray)
      console.log(`✅ Modifier count: ${modifierArray.length}`)

      setModifiers(modifierArray)

      // Removed toast notification for loading modifiers
    } catch (error) {
      console.error("❌ Error loading modifiers:", error)
      setModifiers([])
    }

    setLoading(false)
  }

  const refreshModifiers = () => {
    if (selectedRestaurant && selectedMenu) {
      console.log("🔄 Refreshing modifiers...")
      loadModifiers(selectedRestaurant.id, selectedMenu.id)
    }
  }

  // Filter modifiers based on search
  const filteredModifiers = modifiers.filter((modifier) =>
    modifier.modifier_category_name?.toLowerCase().includes(modifierSearch.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#55C800]">User Dashboard</CardTitle>
          <CardDescription>Select a restaurant and menu to manage modifiers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RestaurantSelector
            onSelect={handleRestaurantSelect}
            selected={selectedRestaurant}
            searchValue={restaurantSearch}
            onSearchChange={setRestaurantSearch}
          />

          {selectedRestaurant && (
            <div className="space-y-4">
              {loading && (
                <div className="flex items-center gap-2 text-[#55C800]">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#55C800]"></div>
                  <span>Loading...</span>
                </div>
              )}
              <MenuSelector menus={menus} onSelect={handleMenuSelect} selected={selectedMenu} />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMenu && modifiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[#55C800]">Search Modifier Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={modifierSearch}
                onChange={(e) => setModifierSearch(e.target.value)}
                className="pl-10 focus:ring-[#55C800] focus:border-[#55C800]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMenu && filteredModifiers.length > 0 && (
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center gap-2 text-[#55C800]">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#55C800]"></div>
              <span>Loading modifiers...</span>
            </div>
          )}
          <ModifierListing
            modifiers={filteredModifiers}
            restaurantId={selectedRestaurant.id}
            menuId={selectedMenu.id}
            onRefresh={refreshModifiers}
          />
        </div>
      )}

      {selectedMenu && modifiers.length > 0 && filteredModifiers.length === 0 && modifierSearch && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">No Categories Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">No modifier categories found matching "{modifierSearch}"</p>
          </CardContent>
        </Card>
      )}

      {selectedMenu && modifiers.length === 0 && !loading && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">No Modifiers Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">No modifier categories were found for this menu.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
