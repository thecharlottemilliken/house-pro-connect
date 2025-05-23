
import React, { useState } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface HomeAttributesSelectProps {
  selectedAttributes: string[]
  onAttributesChange: (attributes: string[]) => void
}

const predefinedAttributes = [
  "Front Yard",
  "Back Yard",
  "Historic Home",
  "Waterfront",
  "Multi-Level",
  "Open Floor Plan",
  "Hardwood Floors",
  "Finished Basement",
  "High Ceilings",
  "Modern Kitchen",
  "Pool",
  "Garage",
  "Fireplace",
  "Central Air",
  "Deck",
  "Patio",
  "Stainless Appliances",
  "Granite Countertops",
  "HVAC",
  "Updated",
  "Renovated",
  "New Construction",
  "Garden",
  "Fenced Yard",
  "Gourmet Kitchen"
]

export function HomeAttributesSelect({
  selectedAttributes,
  onAttributesChange,
}: HomeAttributesSelectProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const handleSelect = (value: string) => {
    if (!selectedAttributes.includes(value)) {
      onAttributesChange([...selectedAttributes, value])
    }
    setInputValue("")
    setOpen(false)
  }

  const handleRemove = (attribute: string) => {
    onAttributesChange(selectedAttributes.filter((item) => item !== attribute))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLInputElement
    if (e.key === "Enter" && target.value && !selectedAttributes.includes(target.value)) {
      e.preventDefault()
      handleSelect(target.value)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open}
            className="w-full justify-between"
          >
            Select or type attributes...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command className="w-full" onKeyDown={handleKeyDown}>
            <CommandInput 
              placeholder="Search attributes..." 
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty className="py-2 px-2 text-sm">
                {inputValue ? "Press enter to create this tag" : "No attributes found"}
              </CommandEmpty>
              <CommandGroup>
                {predefinedAttributes
                  .filter(attr => 
                    attr.toLowerCase().includes(inputValue.toLowerCase()) &&
                    !selectedAttributes.includes(attr)
                  )
                  .map((attribute) => (
                    <CommandItem
                      key={attribute}
                      value={attribute}
                      onSelect={handleSelect}
                      className="cursor-pointer"
                    >
                      {attribute}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        {selectedAttributes.map((attribute) => (
          <Badge
            key={attribute}
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 text-sm"
          >
            {attribute}
            <button
              type="button"
              onClick={() => handleRemove(attribute)}
              className="ml-1 hover:bg-muted rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        {selectedAttributes.length === 0 && (
          <p className="text-sm text-gray-500">No attributes selected. These will be populated automatically when using the "Fill Form" feature with a property URL.</p>
        )}
      </div>
    </div>
  )
}
