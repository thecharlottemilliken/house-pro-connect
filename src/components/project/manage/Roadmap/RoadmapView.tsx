
import { useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: number;
  name: string;
  startDay: number;
  endDay: number;
  color: string;
  status: "Active" | "Pending" | "Completed";
}

const RoadmapView = () => {
  const [currentMonth, setCurrentMonth] = useState("January");
  const [dateRange, setDateRange] = useState("12/05/24 - 12/21/24");
  const [highlightedDay, setHighlightedDay] = useState(21);
  
  // Define the tasks data
  const tasks: Task[] = [
    {
      id: 1,
      name: "Demolition",
      startDay: 6,
      endDay: 12,
      color: "#e84c88",
      status: "Active"
    },
    {
      id: 2,
      name: "Framing",
      startDay: 13,
      endDay: 20,
      color: "#4bc8eb",
      status: "Pending"
    },
    {
      id: 3,
      name: "Electrical",
      startDay: 15,
      endDay: 22,
      color: "#9b74e9",
      status: "Pending"
    }
  ];
  
  // Calendar grid data for roadmap
  const days = [
    { day: 21, name: "SUN", month: "JAN", fullDate: new Date(2024, 0, 21) },
    { day: 22, name: "MON", month: "JAN", fullDate: new Date(2024, 0, 22) },
    { day: 23, name: "TUE", month: "JAN", fullDate: new Date(2024, 0, 23) },
    { day: 24, name: "WED", month: "JAN", fullDate: new Date(2024, 0, 24) },
    { day: 25, name: "THU", month: "JAN", fullDate: new Date(2024, 0, 25) },
    { day: 26, name: "FRI", month: "JAN", fullDate: new Date(2024, 0, 26) },
    { day: 27, name: "SAT", month: "JAN", fullDate: new Date(2024, 0, 27) }
  ];

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
              <button className="p-1 rounded">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="mx-2">{currentMonth}</span>
              <button className="p-1 rounded">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center bg-gray-100 rounded-md px-3 py-1 text-sm">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {dateRange}
            </div>
          </div>
          
          {/* Calendar Headers */}
          <div className="grid grid-cols-16 border-b border-gray-200">
            {days.map(day => (
              <div 
                key={day.day} 
                className={`text-center py-2 ${
                  day.day === highlightedDay ? 'bg-blue-100' : ''
                }`}
              >
                <div className="font-medium">{day.day}</div>
                <div className="text-sm text-gray-500">{day.name}</div>
              </div>
            ))}
          </div>
          
          {/* Task Timelines */}
          <div className="relative">
            {/* Grid Lines */}
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-cols-16 pointer-events-none">
              {Array.from({ length: 16 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`border-l border-gray-100 h-full ${
                    days[i]?.day === highlightedDay ? 'bg-blue-100' : ''
                  }`}
                ></div>
              ))}
            </div>
            
            {/* Today Indicator */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500" style={{
              left: `${((highlightedDay - 5) / 16) * 100}%`,
              zIndex: 5
            }}></div>
            
            {/* Task Bars */}
            {tasks.map((task, index) => (
              <div key={task.id} className="h-20 relative flex items-center">
                {task.status === "Active" ? (
                  <div 
                    className="absolute h-12 rounded-md px-4 flex items-center justify-between"
                    style={{
                      backgroundColor: task.color,
                      left: `${((task.startDay - 5) / 16) * 100}%`,
                      width: `${((task.endDay - task.startDay + 1) / 16) * 100}%`,
                      color: 'white'
                    }}
                  >
                    <span className="font-medium">Active</span>
                    <button className="bg-[#0f566c] px-3 py-1 rounded text-sm">
                      MARK COMPLETE
                    </button>
                  </div>
                ) : (
                  <div 
                    className="absolute h-12 rounded-md px-4 flex items-center justify-between"
                    style={{
                      backgroundColor: task.color,
                      left: `${((task.startDay - 5) / 16) * 100}%`,
                      width: `${((task.endDay - task.startDay + 1) / 16) * 100}%`,
                      color: 'white'
                    }}
                  >
                    <span className="font-medium">Requested Work Block</span>
                    <button className="bg-[#0f566c] px-3 py-1 rounded text-sm">
                      SCHEDULE WORK
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
