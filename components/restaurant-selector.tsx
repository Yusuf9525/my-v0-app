"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, ChevronUp, ChevronDown } from "lucide-react"

interface RestaurantSelectorProps {
  onSelect: (restaurant: any) => void
  selected: any
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export function RestaurantSelector({ onSelect, selected, searchValue = "", onSearchChange }: RestaurantSelectorProps) {
  const [restaurants, setRestaurants] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  useEffect(() => {
    // Load restaurants from localStorage (updated by admin)
    const loadRestaurants = () => {
      const savedRestaurants = localStorage.getItem("app_restaurants")
      if (savedRestaurants) {
        try {
          const parsedRestaurants = JSON.parse(savedRestaurants)
          setRestaurants(parsedRestaurants)
        } catch (error) {
          console.error("Error parsing restaurants:", error)
        }
      }
    }

    // Load initially
    loadRestaurants()

    // Listen for storage changes to update restaurants in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "app_restaurants") {
        loadRestaurants()
      }
    }

    // Listen for custom events for same-tab updates
    const handleRestaurantsUpdated = () => {
      loadRestaurants()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("restaurantsUpdated", handleRestaurantsUpdated)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("restaurantsUpdated", handleRestaurantsUpdated)
    }
  }, [])

  // Filter restaurants based on search
  const filteredRestaurants = restaurants.filter((restaurant: any) =>
    restaurant.name.toLowerCase().includes(searchValue.toLowerCase()),
  )

  const handleSearchFocus = () => {
    setShowSearchResults(true)
  }

  const handleSearchBlur = () => {
    // Delay hiding to allow for clicks on results
    setTimeout(() => setShowSearchResults(false), 200)
  }

  const handleRestaurantClick = (restaurant: any) => {
    onSelect(restaurant)
    setShowSearchResults(false)
    onSearchChange?.("")
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="restaurant-select">Select Restaurant</Label>

      {/* Dropdown Selector */}
      <Select
        value={selected?.id || ""}
        onValueChange={(value) => {
          const restaurant = restaurants.find((r: any) => r.id === value)
          if (restaurant) onSelect(restaurant)
        }}
      >
        <SelectTrigger id="restaurant-select" className="focus:ring-[#55C800] focus:border-[#55C800]">
          <SelectValue placeholder="Choose a restaurant..." />
        </SelectTrigger>
        <SelectContent>
          {restaurants.map((restaurant: any) => (
            <SelectItem key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Input
            placeholder="Search restaurant"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            className="pr-10 border-2 border-[#55C800] focus:ring-[#55C800] focus:border-[#55C800]"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>

        {/* Search Results */}
        {showSearchResults && searchValue && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-hidden border-2 border-[#55C800]">
            <CardContent className="p-0">
              <div className="relative">
                {/* Scroll Up Indicator */}
                <div className="absolute top-2 right-2 z-10">
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>

                {/* Restaurant List */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredRestaurants.map((restaurant: any) => (
                    <div
                      key={restaurant.id}
                      onClick={() => handleRestaurantClick(restaurant)}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                        selected?.id === restaurant.id ? "bg-green-100 text-green-800" : "text-gray-700"
                      }`}
                    >
                      {restaurant.name}
                    </div>
                  ))}
                  {filteredRestaurants.length === 0 && (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No restaurants found matching "{searchValue}"
                    </div>
                  )}
                </div>

                {/* Scroll Down Indicator */}
                <div className="absolute bottom-2 right-2 z-10">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
