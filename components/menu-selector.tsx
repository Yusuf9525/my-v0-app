"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface MenuSelectorProps {
  menus: any[]
  onSelect: (menu: any) => void
  selected: any
}

export function MenuSelector({ menus, onSelect, selected }: MenuSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="menu-select">Select Menu</Label>
      <Select
        value={selected?.id || ""}
        onValueChange={(value) => {
          const menu = menus.find((m) => m.id === value)
          if (menu) onSelect(menu)
        }}
      >
        <SelectTrigger
          id="menu-select"
          className="focus:ring-[#55C800] focus:border-[#55C800]"
        >
          <SelectValue placeholder="Choose a menu..." />
        </SelectTrigger>
        <SelectContent>
          {menus.map((menu) => (
            <SelectItem key={menu.id} value={menu.id}>
              {menu.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
