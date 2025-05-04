
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { format, addDays, startOfDay, eachDayOfInterval, isSameDay, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectMilestonesWidgetProps {
  projectId: string;
  className?: string;
}

interface Milestone {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "pending" | "completed";
  color: string;
}

const ProjectMilestonesWidget = ({ projectId, className }: ProjectMilestonesWidgetProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [daysToShow, setDaysToShow] = useState<number>(10);
  const [days, setDays] = useState<Date[]>([]);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  // Mock milestone data - this would typically come from API
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 1,
      name: "Work Block Name",
      startDate: addDays(currentDate, -1),
      endDate: addDays(currentDate, 5),
      status: "active",
      color: "#f472b6"  // Pink
    },
    {
      id: 2,
      name: "Work Block Name",
      startDate: addDays(currentDate, 2),
      endDate: addDays(currentDate, 7),
      status: "active",
      color: "#8b5cf6"  // Purple
    },
    {
      id: 3,
      name: "Work Block Name",
      startDate: addDays(currentDate, 1),
      endDate: addDays(currentDate, 9),
      status: "active",
      color: "#d97706"  // Amber
    }
  ]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adjust days to show based on window width
  useEffect(() => {
    // Responsive days showing
    if (windowWidth < 640) {
      setDaysToShow(7); // Mobile
    } else if (windowWidth < 1024) {
      setDaysToShow(10); // Tablet
    } else {
      setDaysToShow(12); // Desktop
    }
  }, [windowWidth]);

  // Generate date range for display
  useEffect(() => {
    const start = startOfDay(currentDate);
    const end = addDays(start, daysToShow - 1);
    const daysArray = eachDayOfInterval({ start, end });
    setDays(daysArray);
  }, [currentDate, daysToShow]);

  // Check if a milestone is active on a specific day
  const isMilestoneActiveOnDay = (milestone: Milestone, day: Date): boolean => {
    return isWithinInterval(day, { 
      start: milestone.startDate, 
      end: milestone.endDate 
    });
  };

  // Get milestone position and span data for rendering
  const getMilestonePosition = (milestone: Milestone) => {
    const startIndex = days.findIndex(day => 
      isSameDay(day, milestone.startDate) || day > milestone.startDate
    );
    
    const endIndex = days.findIndex(day => 
      isSameDay(day, milestone.endDate) || day > milestone.endDate
    );
    
    const finalEndIndex = endIndex === -1 ? days.length - 1 : endIndex - 1;
    const span = (finalEndIndex - startIndex + 1) || 1;
    
    return {
      startIndex: startIndex >= 0 ? startIndex : 0,
      span: span > 0 ? span : 1,
      isVisible: startIndex < days.length && (endIndex === -1 || endIndex > 0)
    };
  };

  return (
    <Card className={cn("overflow-hidden shadow-md border-0", className)}>
      <CardHeader className="flex flex-row items-center justify-between py-4 px-4 bg-white border-b">
        <h3 className="text-lg font-semibold">Milestones</h3>
        <div className="text-gray-500 font-medium text-sm">
          {format(currentDate, "MMMM yyyy")}
        </div>
      </CardHeader>
      <CardContent className="p-0 bg-gray-50 overflow-hidden">
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            {/* Days Header */}
            <div className="grid" style={{ gridTemplateColumns: `repeat(${daysToShow}, minmax(50px, 1fr))` }}>
              {days.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div 
                    key={day.getTime()} 
                    className={cn(
                      "text-center py-2 border-b border-gray-200",
                      isToday && "bg-blue-50"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-medium",
                      isToday && "text-blue-600"
                    )}>
                      {format(day, "d")}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(day, "EEE")}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Gantt Chart Visualization */}
            <div className="relative min-h-[180px]">
              {/* Grid lines */}
              <div 
                className="absolute top-0 left-0 w-full h-full grid" 
                style={{ gridTemplateColumns: `repeat(${daysToShow}, minmax(50px, 1fr))` }}
              >
                {days.map((day) => (
                  <div 
                    key={day.getTime()} 
                    className={cn(
                      "border-r border-gray-200 h-full",
                      isSameDay(day, new Date()) && "bg-blue-50"
                    )}
                  />
                ))}
              </div>
              
              {/* Today marker */}
              {days.some(day => isSameDay(day, new Date())) && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10" 
                  style={{ 
                    left: `${days.findIndex(day => isSameDay(day, new Date())) * (100 / days.length)}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              )}
              
              {/* Milestone bars */}
              {milestones.map((milestone, index) => {
                const { startIndex, span, isVisible } = getMilestonePosition(milestone);
                
                if (!isVisible) return null;
                
                return (
                  <div 
                    key={milestone.id}
                    className="absolute h-10 flex items-center rounded-full z-20 px-3"
                    style={{
                      top: `${index * 48 + 24}px`,
                      left: `${startIndex * (100 / days.length)}%`,
                      width: `${span * (100 / days.length)}%`,
                      backgroundColor: milestone.color,
                    }}
                  >
                    <div className="flex items-center h-full w-full">
                      <span className="bg-white bg-opacity-90 text-xs px-2 py-0.5 rounded-full mr-2">
                        {milestone.status === "active" ? "Active" : milestone.status}
                      </span>
                      <span className="text-white font-medium text-sm truncate">
                        {milestone.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ProjectMilestonesWidget;
