
import { useState, useEffect } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

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
    }
  ]);

  // Generate the days for the current week
  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    const daysArray = eachDayOfInterval({ start, end });
    setDays(daysArray);
  }, [currentDate]);

  // Format date range for display
  const dateRange = `${format(days[0] || new Date(), "MM/dd/yy")} - ${format(days[days.length - 1] || new Date(), "MM/dd/yy")}`;

  // Navigate to previous or next week
  const navigateToPreviousWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };

  const navigateToNextWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, 7));
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

  return (
    <div className="bg-white rounded-lg">
      {/* Task List */}
      <div className="flex mb-4">
        {/* Task Names Column */}
        <div className="w-48 pr-4">
          {tasks.map(task => (
            <div key={task.id} className="h-20 flex items-center">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: task.color }}></div>
                <span className="font-medium">{task.name}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Gantt Chart Grid */}
        <div className="flex-1">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <button className="p-1 rounded hover:bg-gray-100" onClick={navigateToPreviousWeek}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="mx-2">{format(currentDate, "MMMM yyyy")}</span>
              <button className="p-1 rounded hover:bg-gray-100" onClick={navigateToNextWeek}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center bg-gray-100 rounded-md px-3 py-1 text-sm">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {dateRange}
            </div>
          </div>
          
          {/* Calendar Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {days.map(day => (
              <div 
                key={day.getTime()} 
                className={cn(
                  "text-center py-2",
                  isToday(day) ? 'bg-blue-100' : ''
                )}
              >
                <div className="font-medium">{format(day, "d")}</div>
                <div className="text-sm text-gray-500">{format(day, "EEE")}</div>
              </div>
            ))}
          </div>
          
          {/* Task Timelines */}
          <div className="relative">
            {/* Grid Lines */}
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-cols-7 pointer-events-none">
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
                    className="absolute h-12 rounded-md px-4 flex items-center justify-between"
                    style={{
                      backgroundColor: task.color,
                      ...calculateTaskBarStyles(task),
                      color: 'white',
                      minWidth: '100px'
                    }}
                  >
                    <span className="font-medium">
                      {task.status === "Active" ? "Active" : "Requested Work Block"}
                    </span>
                    <button className="bg-[#0f566c] px-3 py-1 rounded text-sm whitespace-nowrap">
                      {task.status === "Active" ? "MARK COMPLETE" : "SCHEDULE WORK"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;
