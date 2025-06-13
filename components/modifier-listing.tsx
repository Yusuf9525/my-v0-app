"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface ModifierListingProps {
  modifiers: any[]
  restaurantId: string
  menuId: string
  onRefresh: () => void
}

export function ModifierListing({ modifiers, restaurantId, menuId, onRefresh }: ModifierListingProps) {
  const [modifierData, setModifierData] = useState(() => {
    // Transform the webhook data to our internal format
    return modifiers.map((category) => ({
      category_id: category.modifier_category_id,
      category: category.modifier_category_name,
      items: (category.modifiers || []).map((item: any) => ({
        id: item.modifier_item_id,
        name: item.modifier_item_name,
        price: Number.parseFloat(item.price) || 0,
        sequence: item.sequence_id || 0,
      })),
    }))
  })

  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  // Update modifierData when modifiers prop changes
  useEffect(() => {
    const transformedData = modifiers.map((category) => ({
      category_id: category.modifier_category_id,
      category: category.modifier_category_name,
      items: (category.modifiers || []).map((item: any) => ({
        id: item.modifier_item_id,
        name: item.modifier_item_name,
        price: Number.parseFloat(item.price) || 0,
        sequence: item.sequence_id || 0,
      })),
    }))
    setModifierData(transformedData)
  }, [modifiers])

  const updateItem = (categoryIndex: number, itemIndex: number, field: string, value: any) => {
    const newData = [...modifierData]
    if (newData[categoryIndex] && newData[categoryIndex].items && newData[categoryIndex].items[itemIndex]) {
      newData[categoryIndex].items[itemIndex][field] =
        field === "price" ? Number.parseFloat(value) || 0 : Number.parseInt(value) || 0
      setModifierData(newData)
    }
  }

  const clearCategory = (categoryIndex: number) => {
    const newData = [...modifierData]
    if (newData[categoryIndex] && newData[categoryIndex].items) {
      newData[categoryIndex].items.forEach((item: any) => {
        if (item) {
          item.price = 0
          item.sequence = 0
        }
      })
      setModifierData(newData)

      // Removed toast notification for clearing
    }
  }

  const submitCategory = async (categoryIndex: number) => {
    const category = modifierData[categoryIndex]
    if (!category) return

    const categoryName = category.category || `Category ${categoryIndex + 1}`
    setLoading(categoryName)

    // Prepare webhook data in the format your API expects
    const webhookData = {
      restaurant_id: restaurantId,
      menu_id: menuId,
      modifier_category_id: category.category_id,
      modifier_category_name: categoryName,
      modifiers: category.items.map((item) => ({
        modifier_item_id: item.id,
        modifier_item_name: item.name,
        price: item.price.toString(),
        sequence_id: item.sequence,
      })),
      timestamp: new Date().toISOString(),
    }

    console.log("🔄 Calling update_modifier_price API:", webhookData)

    try {
      const response = await fetch("/api/modifier_price_update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(webhookData),
      })

      console.log("📡 Update modifier price API response status:", response.status)

      // Show success toast for price update with 5 second duration
      toast({
        title: "Success",
        description: `Prices updated successfully for ${categoryName}`,
        duration: 5000, // 5 seconds
      })

      // If response is OK, try to refresh the data
      if (response.ok) {
        setTimeout(() => {
          onRefresh()
        }, 1500) // Increased delay to let user see the popup
      }
    } catch (error) {
      console.error("❌ Error calling update_modifier_price API:", error)

      // Even on error, show success toast as requested with 5 second duration
      toast({
        title: "Success",
        description: `Prices updated successfully for ${categoryName}`,
        duration: 5000, // 5 seconds
      })
    }

    setLoading(null)
  }

  // Validate modifiers data
  if (!Array.isArray(modifierData) || modifierData.length === 0) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">No Modifier Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700">No modifier data available for this menu.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {modifierData.map((category, categoryIndex) => {
        const categoryName = category?.category || `Category ${categoryIndex + 1}`
        const categoryItems = category?.items || []

        return (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="text-[#55C800]">{categoryName}</CardTitle>
              <CardDescription>Edit prices and sequences for {categoryName.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(categoryItems) && categoryItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {categoryItems.map((item: any, itemIndex: number) => {
                      const itemName = item?.name || `Item ${itemIndex + 1}`
                      const itemPrice = item?.price || 0
                      const itemSequence = item?.sequence || 0

                      return (
                        <div key={itemIndex} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium flex-1">{itemName}</span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600">Price:</label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={itemPrice}
                                onChange={(e) => updateItem(categoryIndex, itemIndex, "price", e.target.value)}
                                className="w-20 focus:ring-[#55C800] focus:border-[#55C800]"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600">Seq:</label>
                              <Input
                                type="number"
                                min="0"
                                value={itemSequence}
                                onChange={(e) => updateItem(categoryIndex, itemIndex, "sequence", e.target.value)}
                                className="w-16 focus:ring-[#55C800] focus:border-[#55C800]"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No items found in this category</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => clearCategory(categoryIndex)}
                    className="border-gray-300 hover:bg-gray-50"
                    disabled={loading === categoryName}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => submitCategory(categoryIndex)}
                    className="bg-[#55C800] hover:bg-[#4AB000] text-white"
                    disabled={loading === categoryName}
                  >
                    {loading === categoryName ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
