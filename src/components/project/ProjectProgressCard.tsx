
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";

interface ProjectProgressCardProps {
  projectId: string;
  className?: string;
}

interface WorkBlock {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: "completed" | "inProgress" | "upcoming" | "delayed";
  percentComplete?: number;
}

const ProjectProgressCard = ({ projectId, className }: ProjectProgressCardProps) => {
  // Mock data - in real app, fetch from API
  const today = new Date();
  const mockWorkBlocks: WorkBlock[] = [
    {
      id: "wb1",
      title: "Demolition",
      startDate: addDays(today, -2),
      endDate: addDays(today, 2),
      status: "inProgress",
      percentComplete: 50
    },
    {
      id: "wb2",
      title: "Electrical Work",
      startDate: addDays(today, 3),
      endDate: addDays(today, 6),
      status: "upcoming"
    },
    {
      id: "wb3",
      title: "Plumbing",
      startDate: addDays(today, 4),
      endDate: addDays(today, 8),
      status: "upcoming"
    },
    {
      id: "wb4",
      title: "Tiling",
      startDate: addDays(today, 9),
      endDate: addDays(today, 12),
      status: "upcoming"
    }
  ];

  const daysToShow = 14;
  const dayRange = Array.from({ length: daysToShow }, (_, i) => addDays(today, i - 2));
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "completed": return "bg-green-500";
      case "inProgress": return "bg-blue-500";
      case "upcoming": return "bg-gray-300";
      case "delayed": return "bg-red-500";
      default: return "bg-gray-300";
    }
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-[#f8f9fa] border-b p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Project Progress</h3>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-blue-600 hover:text-blue-800 p-0"
          >
            View Full Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Date headers */}
          <div className="grid grid-cols-[150px_repeat(14,1fr)] mb-2">
            <div className="px-2 py-1 font-medium">Work Block</div>
            {dayRange.map((date, i) => (
              <div 
                key={i}
                className={cn(
                  "px-2 py-1 text-center font-medium text-xs",
                  isWeekend(date) && "bg-gray-50",
                  isToday(date) && "bg-blue-50"
                )}
              >
                <div>{format(date, "EEE")}</div>
                <div className={cn(
                  "font-bold",
                  isToday(date) && "text-blue-600"
                )}>
                  {format(date, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Work blocks timeline */}
          <div className="space-y-2">
            {mockWorkBlocks.map(block => {
              // Calculate position on the timeline
              const startIdx = dayRange.findIndex(day => 
                day.toDateString() === block.startDate.toDateString()
              );
              const endIdx = dayRange.findIndex(day => 
                day.toDateString() === block.endDate.toDateString()
              );
              
              // If completely outside our range, don't show
              if (endIdx < 0 || startIdx >= dayRange.length) return null;
              
              // Adjust to visible range if partially visible
              const visibleStartIdx = Math.max(0, startIdx);
              const visibleEndIdx = Math.min(dayRange.length - 1, endIdx);
              
              // Calculate span (number of days)
              const span = visibleEndIdx - visibleStartIdx + 1;

              return (
                <div key={block.id} className="grid grid-cols-[150px_repeat(14,1fr)] h-9">
                  <div className="px-2 flex items-center font-medium text-sm truncate">
                    {block.title}
                  </div>
                  {/* Empty cells before start */}
                  {Array.from({ length: visibleStartIdx }, (_, i) => (
                    <div key={`pre-${i}`} className="border-r border-gray-100"></div>
                  ))}
                  {/* The block itself */}
                  <div 
                    className={cn(
                      "rounded-md mx-1 px-2 text-white text-xs flex items-center justify-center",
                      getStatusColor(block.status)
                    )}
                    style={{ 
                      gridColumn: `span ${span}` 
                    }}
                  >
                    {block.percentComplete !== undefined && (
                      <div className="font-medium">{block.percentComplete}%</div>
                    )}
                  </div>
                  {/* Empty cells after end */}
                  {Array.from({ length: dayRange.length - visibleEndIdx - 1 }, (_, i) => (
                    <div key={`post-${i}`} className="border-r border-gray-100"></div>
                  ))}
                </div>
              );
            })}

            {mockWorkBlocks.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                No work blocks scheduled yet.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectProgressCard;
