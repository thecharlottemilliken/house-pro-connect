
import React from "react";
import { Filter, ChevronsDown } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const JobFilters = () => {
  return (
    <form className="flex flex-wrap gap-x-2 gap-y-3 items-center">
      <Select>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Project Underway Est." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="soon">Start Soon</SelectItem>
          <SelectItem value="next-7-days">Next 7 Days</SelectItem>
          <SelectItem value="next-30-days">Next 30 Days</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Project Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="remodel">Remodel</SelectItem>
          <SelectItem value="repair">Repair</SelectItem>
          <SelectItem value="add-on">Add-on</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Speciality" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="electrician">Electrician</SelectItem>
          <SelectItem value="plumber">Plumber</SelectItem>
          <SelectItem value="carpenter">Carpenter</SelectItem>
          <SelectItem value="designer">Designer</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Project Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="small">Small</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="large">Large</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="link" size="sm" className="text-[#1f2633] ml-3">
        <Filter className="inline mr-1 text-[#1f2633]" size={18}/> ADVANCED FILTERS
      </Button>
      {/* Sort By (right side on desktop) */}
      {/* Can float right on larger screens, here is simple for clarity */}
      <Select>
        <SelectTrigger className="w-[130px] ml-auto">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Recent</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="nearby">Nearby</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
};

export default JobFilters;
