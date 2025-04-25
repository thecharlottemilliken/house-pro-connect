
import React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface HomeAttributesSelectProps {
  selectedAttributes: string[];
  onAttributeChange: (attributes: string[]) => void;
}

const predefinedAttributes = [
  "Front Yard",
  "Back Yard",
  "Historic Home",
  "Waterfront",
  "Multi-Level",
  "Open Floor Plan",
  "Hardwood Floors",
  "Finished Basement"
];

export function HomeAttributesSelect({ selectedAttributes, onAttributeChange }: HomeAttributesSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSelect = (value: string) => {
    if (!selectedAttributes.includes(value)) {
      onAttributeChange([...selectedAttributes, value]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && inputValue && !predefinedAttributes.includes(inputValue)) {
      e.preventDefault();
      handleSelect(inputValue);
    }
  };

  const handleRemove = (attribute: string) => {
    onAttributeChange(selectedAttributes.filter(item => item !== attribute));
  };

  return (
    <div className="flex flex-col gap-4">
      <Command className="border rounded-lg" onKeyDown={handleKeyDown}>
        <CommandInput 
          ref={inputRef}
          placeholder="Select a tag or type to create..." 
          value={inputValue}
          onValueChange={setInputValue}
        />
        <CommandEmpty className="py-2 px-4 text-sm">
          {inputValue ? (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 px-2"
              onClick={() => handleSelect(inputValue)}
            >
              <Plus className="h-4 w-4" />
              Create "{inputValue}"
            </Button>
          ) : (
            "No attributes found."
          )}
        </CommandEmpty>
        <CommandGroup>
          {predefinedAttributes
            .filter(attr => !selectedAttributes.includes(attr))
            .map(attribute => (
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
        {selectedAttributes.map(attribute => (
          <span
            key={attribute}
            className="inline-flex items-center gap-1 bg-[#174c65] text-white px-3 py-1 rounded-full text-sm"
          >
            {attribute}
            <button
              onClick={() => handleRemove(attribute)}
              className="hover:text-gray-200 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
