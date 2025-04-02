
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniCalendarProps {
  currentMonth: string;
  miniCalendarDays: {
    day: number;
    isCurrentMonth: boolean;
    selected?: boolean;
    active?: boolean;
  }[];
}

const MiniCalendar = ({ currentMonth, miniCalendarDays }: MiniCalendarProps) => {
  return (
    <div className="bg-white rounded-md border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <button className="text-gray-500">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="font-medium">{currentMonth}</h3>
        <button className="text-gray-500">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        <div className="text-xs text-gray-500 h-6 flex items-center justify-center">M</div>
        <div className="text-xs text-gray-500 h-6 flex items-center justify-center">T</div>
        <div className="text-xs text-gray-500 h-6 flex items-center justify-center">W</div>
        <div className="text-xs text-gray-500 h-6 flex items-center justify-center">Th</div>
        <div className="text-xs text-gray-500 h-6 flex items-center justify-center">F</div>
        <div className="text-xs text-gray-500 h-6 flex items-center justify-center">Sa</div>
        <div className="text-xs text-gray-500 h-6 flex items-center justify-center">Su</div>
        
        {miniCalendarDays.map((day, i) => (
          <div 
            key={i} 
            className={cn(
              "h-6 w-6 text-xs rounded-full flex items-center justify-center",
              day.isCurrentMonth ? "text-gray-700" : "text-gray-400",
              day.active && "bg-[#0f566c] text-white",
              day.selected && "border border-[#0f566c]"
            )}
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniCalendar;
