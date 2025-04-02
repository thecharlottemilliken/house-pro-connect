
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CalendarHeaderProps {
  currentMonth: string;
  viewMode: string;
  setViewMode: (mode: string) => void;
}

const CalendarHeader = ({ currentMonth, viewMode, setViewMode }: CalendarHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
      <div className="flex items-center mb-4 md:mb-0">
        <button className="p-2 text-gray-500 hover:text-gray-800">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-xl font-medium mx-2">{currentMonth}</span>
        <button className="p-2 text-gray-500 hover:text-gray-800">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button className="bg-white text-gray-600 px-4 py-1 rounded-md border border-gray-200">
          Today
        </button>
        
        <div className="flex items-center rounded-md overflow-hidden border border-gray-300">
          <button 
            className={`px-3 py-1 text-sm ${viewMode === "Day" ? "bg-[#0f566c] text-white" : "bg-white text-gray-600"}`}
            onClick={() => setViewMode("Day")}
          >
            Day
          </button>
          <button 
            className={`px-3 py-1 text-sm ${viewMode === "Week" ? "bg-[#0f566c] text-white" : "bg-white text-gray-600"}`}
            onClick={() => setViewMode("Week")}
          >
            Week
          </button>
          <button 
            className={`px-3 py-1 text-sm ${viewMode === "Month" ? "bg-[#0f566c] text-white" : "bg-white text-gray-600"}`}
            onClick={() => setViewMode("Month")}
          >
            Month
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search" 
            className="pl-9 h-8 w-60 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
