
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Filter, Search } from "lucide-react";

interface PropertiesFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
  selectedPrice: string | null;
  setSelectedPrice: (price: string | null) => void;
}

const homeTypes = ["House", "Apartment", "Condo", "Townhouse", "Multi-family"];
const priceRanges = [
  { label: "Any", value: "any" },
  { label: "Under $500K", value: "0-500000" },
  { label: "$500K-$800K", value: "500000-800000" },
  { label: "$800K-$1M", value: "800000-1000000" },
  { label: "Over $1M", value: "1000000-" },
];

const barBg = "bg-white/90";

export function PropertiesFilterBar({
  searchQuery, 
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedPrice,
  setSelectedPrice
}: PropertiesFilterBarProps) {
  return (
    <div className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 py-3 ${barBg} w-full border-b border-gray-200`}>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Filter className="w-5 h-5 text-[#9b87f5]" />
        <span className="font-semibold text-[#222] text-base">Filter Properties</span>
      </div>
      <div className="flex flex-wrap gap-3 items-center flex-grow">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by address or name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#F5F8FA] text-[#1A1F2C] border-gray-300"
          />
        </div>
        
        {/* Property Type */}
        <Select value={selectedType || ""} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[140px] bg-[#F5F8FA] border-gray-300">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {homeTypes.map(type => (
              <SelectItem value={type.toLowerCase()} key={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Price */}
        <Select value={selectedPrice || ""} onValueChange={setSelectedPrice}>
          <SelectTrigger className="w-[140px] bg-[#F5F8FA] border-gray-300">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map(r => (
              <SelectItem value={r.value} key={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default PropertiesFilterBar;
