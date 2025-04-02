
import { useState, useEffect } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface Task {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
  status: "Active" | "Pending" | "Completed";
}

const RoadmapView = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [days, setDays] = useState<Date[]>([]);
  const isMobile = useIsMobile();
  
  // Define the tasks data with actual dates
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      name: "Demolition",
      startDate: addDays(new Date(), -2),
      endDate: addDays(new Date(), 4),
      color: "#e84c88",
      status: "Active"
    },
    {
      id: 2,
      name: "Framing",
      startDate: addDays(new Date(), 5),
      endDate: addDays(new Date(), 12),
      color: "#4bc8eb",
      status: "Pending"
    },
    {
      id: 3,
      name: "Electrical",
      startDate: addDays(new Date(), 8),
      endDate: addDays(new Date(), 15),
      color: "#9b74e9",
      status: "Pending"
    },
    {
      id: 4,
      name: "Plumbing",
      startDate: addDays(new Date(), 10),
      endDate: addDays(new Date(), 18),
      color: "#58c97b",
      status: "Pending"
    },
    {
      id: 5,
      name: "Drywall",
      startDate: addDays(new Date(), 19),
      endDate: addDays(new Date(), 25),
      color: "#f6a84c",
      status: "Pending"
    },
    {
      id: 6,
      name: "Painting",
      startDate: addDays(new Date(), 26),
      endDate: addDays(new Date(), 32),
      color: "#e06767",
      status: "Pending"
    }
  ]);

  // Generate the days for the current view
  useEffect(() => {
    // For mobile, show fewer days to ensure better visibility
    const daysToShow = isMobile ? 3 : 7;
    
    // Adjust the start date to be the current date for mobile
    const start = isMobile 
      ? new Date(currentDate) // Start from the current date on mobile
      : startOfWeek(currentDate, { weekStartsOn: 0 });
      
    // Calculate end date based on days to show
    const end = addDays(start, daysToShow - 1);
    
    const daysArray = eachDayOfInterval({ start, end });
    setDays(daysArray);
  }, [currentDate, isMobile]);

  // Format date range for display
  const dateRange = `${format(days[0] || new Date(), "MM/dd/yy")} - ${format(days[days.length - 1] || new Date(), "MM/dd/yy")}`;

  // Navigate to previous or next period
  const navigateToPreviousView = () => {
    setCurrentDate(prevDate => addDays(prevDate, isMobile ? -3 : -7));
  };

  const navigateToNextView = () => {
    setCurrentDate(prevDate => addDays(prevDate, isMobile ? 3 : 7));
  };

  // Check if the date is today
  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  // Calculate the position and width of a task bar
  const calculateTaskBarStyles = (task: Task) => {
    const startDateInView = days.find(day => isSameDay(day, task.startDate));
    const endDateInView = days.find(day => isSameDay(day, task.endDate));
    
    // Find the earliest and latest days in view
    const earliestDayIndex = startDateInView 
      ? days.findIndex(day => isSameDay(day, task.startDate))
      : -1;
    
    const latestDayIndex = endDateInView 
      ? days.findIndex(day => isSameDay(day, task.endDate))
      : -1;
    
    // Calculate left position
    let leftPosition = 0;
    let width = 0;
    
    if (earliestDayIndex >= 0 && latestDayIndex >= 0) {
      // Both start and end dates are in view
      leftPosition = (earliestDayIndex / days.length) * 100;
      width = ((latestDayIndex - earliestDayIndex + 1) / days.length) * 100;
    } else if (earliestDayIndex >= 0) {
      // Only start date is in view
      leftPosition = (earliestDayIndex / days.length) * 100;
      width = ((days.length - earliestDayIndex) / days.length) * 100;
    } else if (latestDayIndex >= 0) {
      // Only end date is in view
      leftPosition = 0;
      width = ((latestDayIndex + 1) / days.length) * 100;
    } else {
      // Check if the range spans the entire view
      const taskStartBeforeView = task.startDate < days[0];
      const taskEndAfterView = task.endDate > days[days.length - 1];
      
      if (taskStartBeforeView && taskEndAfterView) {
        // Task spans the entire view
        leftPosition = 0;
        width = 100;
      }
    }
    
    return {
      left: `${leftPosition}%`,
      width: `${width}%`,
    };
  };

  // Check if task is visible in the current view
  const isTaskVisible = (task: Task) => {
    const taskStartBeforeViewEnd = task.startDate <= days[days.length - 1];
    const taskEndAfterViewStart = task.endDate >= days[0];
    
    return taskStartBeforeViewEnd && taskEndAfterViewStart;
  };

  // Responsive task action button component
  const TaskActionButton = ({ status }: { status: string }) => {
    if (isMobile) {
      // Mobile version - simple button with icon or abbreviated text
      return (
        <button className="bg-[#0f566c] px-2 py-1 rounded text-xs whitespace-nowrap">
          {status === "Active" ? "✓" : "+"}
        </button>
      );
    }
    
    // Desktop version - full text button
    return (
      <button className="bg-[#0f566c] px-3 py-1 rounded text-sm whitespace-nowrap ml-2">
        {status === "Active" ? "MARK COMPLETE" : "SCHEDULE WORK"}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg flex flex-col h-[calc(100vh-240px)]">
      {/* Month Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-2 sm:px-4 pt-4 space-y-2 sm:space-y-0">
        <div className="flex items-center">
          <button 
            className="p-1 rounded hover:bg-gray-100 mobile-touch-target flex items-center justify-center" 
            onClick={navigateToPreviousView}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="mx-2 text-sm sm:text-base">{format(currentDate, "MMMM yyyy")}</span>
          <button 
            className="p-1 rounded hover:bg-gray-100 mobile-touch-target flex items-center justify-center" 
            onClick={navigateToNextView}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center bg-gray-100 rounded-md px-3 py-1 text-xs sm:text-sm">
          <CalendarIcon className="h-4 w-4 mr-2" />
          {dateRange}
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-x-auto">
        <div className="flex h-full min-w-full">
          {/* Task Names Column */}
          <div className={`${isMobile ? 'w-28' : 'w-48'} sticky left-0 bg-white z-10`}>
            <div className="h-[60px]"></div> {/* Header space */}
            {tasks.map(task => (
              <div key={task.id} className="h-20 flex items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2" style={{ backgroundColor: task.color }}></div>
                  <span className="font-medium text-xs sm:text-sm truncate max-w-[90px] sm:max-w-[150px]">{task.name}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Gantt Chart Grid */}
          <div className="flex-1">
            {/* Calendar Headers */}
            <div className={`grid grid-cols-${days.length} border-b border-gray-200 sticky top-0 bg-white z-10`} style={{ gridTemplateColumns: `repeat(${days.length}, minmax(80px, 1fr))` }}>
              {days.map(day => (
                <div 
                  key={day.getTime()} 
                  className={cn(
                    "text-center py-2",
                    isToday(day) ? 'bg-blue-100' : ''
                  )}
                >
                  <div className="font-medium text-sm sm:text-base">{format(day, "d")}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{format(day, "EEE")}</div>
                </div>
              ))}
            </div>
            
            {/* Task Timelines */}
            <div className="relative">
              {/* Grid Lines */}
              <div 
                className="absolute top-0 left-0 right-0 bottom-0 grid pointer-events-none" 
                style={{ gridTemplateColumns: `repeat(${days.length}, minmax(80px, 1fr))` }}
              >
                {days.map(day => (
                  <div 
                    key={day.getTime()} 
                    className={cn(
                      "border-l border-gray-100 h-full",
                      isToday(day) ? 'bg-blue-100' : ''
                    )}
                  ></div>
                ))}
              </div>
              
              {/* Today Indicator */}
              {days.findIndex(day => isToday(day)) !== -1 && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-blue-500" 
                  style={{
                    left: `${(days.findIndex(day => isToday(day)) + 0.5) / days.length * 100}%`,
                    zIndex: 5
                  }}
                ></div>
              )}
              
              {/* Task Bars */}
              {tasks.map((task) => (
                <div key={task.id} className="h-20 relative flex items-center">
                  {isTaskVisible(task) && (
                    <div 
                      className="absolute h-12 rounded-md px-2 sm:px-4 flex items-center justify-between"
                      style={{
                        backgroundColor: task.color,
                        ...calculateTaskBarStyles(task),
                        color: 'white',
                      }}
                    >
                      <span className={`font-medium truncate ${isMobile ? 'text-xs max-w-[60px]' : 'max-w-[150px]'}`}>
                        {task.status === "Active" ? "Active" : isMobile ? "Task" : "Requested Work Block"}
                      </span>
                      <TaskActionButton status={task.status} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default RoadmapView;
