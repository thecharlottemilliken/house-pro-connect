
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface JobsFilterBarProps {
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
  selectedPrice: string | null;
  setSelectedPrice: (price: string | null) => void;
  selectedDistance: string | null;
  setSelectedDistance: (distance: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const projectTypes = ["Kitchen", "Bathroom", "Living Room", "Office", "Dining Room"];
const priceRanges = [
  { label: "Any", value: "" },
  { label: "$7k-$11k", value: "7000-11000" },
  { label: "$11k-$15k", value: "11000-15000" },
  { label: "$15k-$25k", value: "15000-25000" },
];
const distances = [
  { label: "Any", value: "" },
  { label: "1 mile", value: "1" },
  { label: "2 miles", value: "2" },
];

const barBg = "bg-white/90";

export function JobsFilterBar({
  selectedType, setSelectedType, 
  selectedPrice, setSelectedPrice,
  selectedDistance, setSelectedDistance,
  searchQuery, setSearchQuery
}: JobsFilterBarProps) {
  return (
    <div className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-4 pb-2 pt-4 ${barBg} sticky top-0 z-30 rounded-tl-xl`}>
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-[#9b87f5]" />
        <span className="font-semibold text-[#222] text-base">Filter Projects</span>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-[170px] bg-[#F5F8FA] text-[#1A1F2C] border-gray-300"
        />
        {/* Type */}
        <Select value={selectedType ?? ""} onValueChange={val => setSelectedType(val || null)}>
          <SelectTrigger className="w-[120px] bg-[#F5F8FA] border-gray-300">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {projectTypes.map(type => (
              <SelectItem value={type} key={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Price */}
        <Select value={selectedPrice ?? ""} onValueChange={val => setSelectedPrice(val || null)}>
          <SelectTrigger className="w-[120px] bg-[#F5F8FA] border-gray-300">
            <SelectValue placeholder="Price" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map(r => (
              <SelectItem value={r.value} key={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Distance */}
        <Select value={selectedDistance ?? ""} onValueChange={val => setSelectedDistance(val || null)}>
          <SelectTrigger className="w-[120px] bg-[#F5F8FA] border-gray-300">
            <SelectValue placeholder="Distance" />
          </SelectTrigger>
          <SelectContent>
            {distances.map(d => (
              <SelectItem value={d.value} key={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default JobsFilterBar;
