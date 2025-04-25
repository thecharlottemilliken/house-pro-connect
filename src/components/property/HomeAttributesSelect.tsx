
import React from "react"
import { Command as CommandPrimitive } from "cmdk"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

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
]

export function HomeAttributesSelect({
  selectedAttributes,
  onAttributesChange,
}: HomeAttributesSelectProps) {
  const [inputValue, setInputValue] = React.useState("")

  const handleSelect = (value: string) => {
    // Don't add if already selected
    if (!selectedAttributes.includes(value)) {
      onAttributesChange([...selectedAttributes, value])
    }
    setInputValue("")
  }

  const handleRemove = (attribute: string) => {
    onAttributesChange(selectedAttributes.filter((item) => item !== attribute))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue && !predefinedAttributes.includes(inputValue)) {
      e.preventDefault()
      handleSelect(inputValue)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Command className="border rounded-lg">
        <CommandInput 
          placeholder="Select a tag or type to create..." 
          value={inputValue}
          onValueChange={setInputValue}
          onKeyDown={handleKeyDown}
        />
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
      </Command>

      <div className="flex flex-wrap gap-2">
        {selectedAttributes.map((attribute) => (
          <Badge
            key={attribute}
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1 text-sm"
          >
            {attribute}
            <button
              onClick={() => handleRemove(attribute)}
              className="ml-1 hover:bg-muted rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}
