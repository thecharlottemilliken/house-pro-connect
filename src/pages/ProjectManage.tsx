
import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { 
  Calendar as CalendarIcon, 
  ListTodo, 
  FileText,
  ChevronLeft, 
  ChevronRight,
  Search,
  Check,
  XCircle
} from "lucide-react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { useProjectData } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

// Define the task interface
interface Task {
  id: number;
  name: string;
  startDay: number;
  endDay: number;
  color: string;
  status: "Active" | "Pending" | "Completed";
}

// Define the phase interface
interface Phase {
  id: number;
  name: string;
  status: "Completed" | "In Progress" | "Upcoming";
  tasks: PhaseTask[];
  startDate?: string;
  endDate?: string;
}

interface PhaseTask {
  id: number;
  name: string;
  status: "Completed" | "In Progress" | "Not Started";
  assignee?: string;
  date?: string;
}

const ProjectManage = () => {
  const location = useLocation();
  const params = useParams();
  const { projectData, isLoading } = useProjectData(params.projectId, location.state);
  const [activeTab, setActiveTab] = useState("calendar");
  const [currentMonth, setCurrentMonth] = useState("January");
  const [dateRange, setDateRange] = useState("12/05/24 - 12/21/24");
  const [viewMode, setViewMode] = useState("Week");
  const [highlightedDay, setHighlightedDay] = useState(21); // Define the highlighted day
  
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

  // Define phases data
  const phases: Phase[] = [
    {
      id: 1,
      name: "Planning & Design",
      status: "Completed",
      tasks: [
        { id: 1, name: "Initial Consultation", status: "Completed", date: "Jan 10, 2024" },
        { id: 2, name: "Site Assessment", status: "Completed", date: "Jan 12, 2024" },
        { id: 3, name: "Design Concept Approval", status: "Completed", date: "Jan 15, 2024" }
      ],
      startDate: "Jan 10, 2024",
      endDate: "Jan 15, 2024"
    },
    {
      id: 2,
      name: "Demolition",
      status: "In Progress",
      tasks: [
        { id: 4, name: "Remove Old Fixtures", status: "Completed", date: "Jan 18, 2024" },
        { id: 5, name: "Wall Demolition", status: "In Progress", date: "Jan 21, 2024" },
        { id: 6, name: "Floor Removal", status: "Not Started", date: "Jan 23, 2024" }
      ],
      startDate: "Jan 18, 2024",
      endDate: "Jan 25, 2024"
    },
    {
      id: 3,
      name: "Rough Construction",
      status: "Upcoming",
      tasks: [
        { id: 7, name: "Framing", status: "Not Started", date: "Jan 26, 2024" },
        { id: 8, name: "Electrical Rough-In", status: "Not Started", date: "Jan 28, 2024" },
        { id: 9, name: "Plumbing Rough-In", status: "Not Started", date: "Jan 30, 2024" }
      ],
      startDate: "Jan 26, 2024",
      endDate: "Feb 5, 2024"
    },
    {
      id: 4,
      name: "Finishing",
      status: "Upcoming",
      tasks: [
        { id: 10, name: "Drywall Installation", status: "Not Started", date: "Feb 6, 2024" },
        { id: 11, name: "Cabinet Installation", status: "Not Started", date: "Feb 10, 2024" },
        { id: 12, name: "Flooring Installation", status: "Not Started", date: "Feb 14, 2024" }
      ],
      startDate: "Feb 6, 2024",
      endDate: "Feb 20, 2024"
    }
  ];
  
  const projectId = projectData?.id || params.projectId || "unknown";
  const projectTitle = projectData?.title || "Unknown Project";
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Loading project details...</div>
        </div>
      </div>
    );
  }

  // Sample events data
  const events = [
    { 
      id: 1, 
      title: "Tile Delivery", 
      day: 21, 
      time: "09:00 AM", 
      color: "#e84c88",
      fullTime: "9:00 AM"
    },
    { 
      id: 2, 
      title: "Tile Labor", 
      day: 26, 
      time: "10:00 AM", 
      color: "#4bc8eb",
      fullTime: "10:00 AM"
    },
    { 
      id: 3, 
      title: "Coach Call", 
      day: 26, 
      time: "12:00 PM", 
      color: "#9b74e9",
      fullTime: "12:00 PM"
    }
  ];

  // Calendar grid data
  const days = [
    { day: 21, name: "SUN", month: "JAN", fullDate: new Date(2024, 0, 21) },
    { day: 22, name: "MON", month: "JAN", fullDate: new Date(2024, 0, 22) },
    { day: 23, name: "TUE", month: "JAN", fullDate: new Date(2024, 0, 23) },
    { day: 24, name: "WED", month: "JAN", fullDate: new Date(2024, 0, 24) },
    { day: 25, name: "THU", month: "JAN", fullDate: new Date(2024, 0, 25) },
    { day: 26, name: "FRI", month: "JAN", fullDate: new Date(2024, 0, 26) },
    { day: 27, name: "SAT", month: "JAN", fullDate: new Date(2024, 0, 27) }
  ];

  // Time slots
  const timeSlots = [
    { label: "7 AM", time: 7 },
    { label: "8 AM", time: 8 },
    { label: "9 AM", time: 9 },
    { label: "10 AM", time: 10 },
    { label: "11 AM", time: 11 },
    { label: "12 PM", time: 12 },
    { label: "1 PM", time: 13 },
    { label: "2 PM", time: 14 },
    { label: "3 PM", time: 15 }
  ];

  // Get events for a specific day and timeSlot
  const getEventForTimeSlot = (day, time) => {
    return events.find(event => {
      const eventHour = event.time.includes('AM') 
        ? parseInt(event.time) 
        : (parseInt(event.time) === 12 ? 12 : parseInt(event.time) + 12);
      return event.day === day && eventHour === time;
    });
  };

  // Mini calendar grid data
  const miniCalendarDays = [
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true, selected: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true, active: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
    { day: 2, isCurrentMonth: false },
    { day: 3, isCurrentMonth: false },
    { day: 4, isCurrentMonth: false }
  ];

  // Today's events
  const todayEvents = events.filter(event => event.day === 21);
  
  // Tomorrow's events
  const tomorrowEvents = events.filter(event => event.day === 22);

  // Get status color and background
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'Completed':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: <Check className="h-4 w-4 text-green-600" /> };
      case 'In Progress':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: null };
      case 'Not Started':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: null };
      case 'Upcoming':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: null };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: null };
    }
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <div className="flex flex-1 h-[calc(100vh-64px)]">
        <ProjectSidebar 
          projectId={projectId} 
          projectTitle={projectTitle}
          activePage="manage"
        />
        
        <div className="flex-1 p-8 bg-white overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Project
            </h1>
            <div className="flex gap-4">
              <Button variant="outline" className="border border-gray-300">
                VIEW SOW
              </Button>
              <Button className="bg-[#0f566c] hover:bg-[#0d4a5d]">
                REQUEST CHANGES
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs defaultValue="calendar" onValueChange={setActiveTab} value={activeTab} className="w-full">
            <TabsList className="border-b border-gray-200 mb-6 p-0 bg-transparent w-full flex justify-start space-x-8 h-auto">
              <TabsTrigger 
                value="roadmap" 
                className={`flex items-center pb-3 px-0 ${activeTab === "roadmap" ? "border-b-2 border-[#0f566c] text-[#0f566c] font-medium" : "text-gray-500"} bg-transparent rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
              >
                <ListTodo className="mr-2 h-5 w-5" /> 
                Roadmap
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className={`flex items-center pb-3 px-0 ${activeTab === "calendar" ? "border-b-2 border-[#0f566c] text-[#0f566c] font-medium" : "text-gray-500"} bg-transparent rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
              >
                <CalendarIcon className="mr-2 h-5 w-5" /> 
                Calendar
              </TabsTrigger>
              <TabsTrigger 
                value="phases" 
                className={`flex items-center pb-3 px-0 ${activeTab === "phases" ? "border-b-2 border-[#0f566c] text-[#0f566c] font-medium" : "text-gray-500"} bg-transparent rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none`}
              >
                <FileText className="mr-2 h-5 w-5" /> 
                Phases
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="m-0 p-0">
              {/* Calendar Navigation */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                  <button className="p-2 text-gray-500 hover:text-gray-800">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-xl font-medium mx-2">January</span>
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
              
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left side - Mini calendar and events */}
                <div className="w-full lg:w-64 flex flex-col">
                  {/* Mini Calendar */}
                  <div className="bg-white rounded-md border border-gray-200 p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <button className="text-gray-500">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <h3 className="font-medium">January</h3>
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
                  
                  {/* Today's Events */}
                  <div className="bg-white rounded-md border border-gray-200 p-4 mb-4">
                    <div className="flex items-center mb-4">
                      <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                      <h3 className="font-medium">Today</h3>
                    </div>
                    
                    {todayEvents.length > 0 ? (
                      <div className="space-y-3">
                        {todayEvents.map(event => (
                          <div key={event.id} className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-3" 
                              style={{ backgroundColor: event.color }}
                            ></div>
                            <div>
                              <div className="font-medium">{event.title}</div>
                              <div className="text-sm text-gray-500">{event.fullTime}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No events today</p>
                    )}
                  </div>
                  
                  {/* Tomorrow's Events */}
                  <div className="bg-white rounded-md border border-gray-200 p-4">
                    <div className="flex items-center mb-4">
                      <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                      <h3 className="font-medium">Tomorrow</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3 bg-[#4bc8eb]"></div>
                        <div>
                          <div className="font-medium">Tile Labor</div>
                          <div className="text-sm text-gray-500">10:00am</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3 bg-[#9b74e9]"></div>
                        <div>
                          <div className="font-medium">Coach Call</div>
                          <div className="text-sm text-gray-500">12:00pm</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right side - Calendar grid */}
                <div className="flex-1 bg-white rounded-md border border-gray-200 overflow-auto">
                  <div className="min-w-[700px]">
                    {/* Calendar Header - Days */}
                    <div className="grid grid-cols-8 border-b border-gray-200">
                      {/* Time column header */}
                      <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                        <div className="text-gray-400 text-xs">EST<br/>GMT-5</div>
                      </div>
                      
                      {/* Day columns headers */}
                      {days.map((day, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "p-2 text-center",
                            i < days.length - 1 && "border-r border-gray-200",
                            day.day === 25 && "bg-blue-50"
                          )}
                        >
                          <div className="text-gray-500 font-medium">{day.name}</div>
                          <div className="text-2xl font-bold">{day.day}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar Body - Time slots and events */}
                    <div className="grid grid-cols-8">
                      {/* Time slots column */}
                      <div className="border-r border-gray-200">
                        {timeSlots.map((slot, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "h-20 flex items-center justify-center text-gray-500 text-sm",
                              i < timeSlots.length - 1 && "border-b border-gray-200"
                            )}
                          >
                            {slot.label}
                          </div>
                        ))}
                      </div>
                      
                      {/* Calendar cells for each day and time slot */}
                      {days.map((day, dayIndex) => (
                        <div key={dayIndex} className={cn(
                          "relative",
                          dayIndex < days.length - 1 && "border-r border-gray-200",
                          day.day === 25 && "bg-blue-50"
                        )}>
                          {timeSlots.map((timeSlot, timeIndex) => {
                            const event = getEventForTimeSlot(day.day, timeSlot.time);
                            return (
                              <div 
                                key={timeIndex} 
                                className={cn(
                                  "h-20 relative",
                                  timeIndex < timeSlots.length - 1 && "border-b border-gray-200"
                                )}
                              >
                                {event && (
                                  <div 
                                    className="absolute inset-1 rounded-md p-2 text-white flex flex-col"
                                    style={{ backgroundColor: event.color }}
                                  >
                                    <span className="text-xs">{event.fullTime}</span>
                                    <span className="font-medium">{event.title}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="roadmap" className="m-0 p-0">
              {/* Project Phases Title */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Project Phases</h2>
              </div>
              
              {/* Gantt Chart */}
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
            </TabsContent>
            
            <TabsContent value="phases" className="m-0 p-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Project Phases</h2>
                <Button className="bg-[#0f566c] hover:bg-[#0d4a5d]">
                  ADD PHASE
                </Button>
              </div>
              
              <div className="space-y-6">
                {phases.map((phase) => {
                  const { color, bgColor, icon } = getStatusStyles(phase.status);
                  
                  return (
                    <div key={phase.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      {/* Phase Header */}
                      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-800">{phase.name}</h3>
                          <div className={`${bgColor} ${color} text-xs font-medium px-2.5 py-1 rounded-full flex items-center`}>
                            {icon && <span className="mr-1">{icon}</span>}
                            {phase.status}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          {phase.startDate} - {phase.endDate}
                        </div>
                      </div>
                      
                      {/* Phase Tasks */}
                      <div className="divide-y divide-gray-200">
                        {phase.tasks.map((task) => {
                          const taskStyles = getStatusStyles(task.status);
                          
                          return (
                            <div key={task.id} className="px-6 py-4 flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                {task.status === 'Completed' ? (
                                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                ) : task.status === 'In Progress' ? (
                                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                )}
                                <span className="font-medium">{task.name}</span>
                                <div className={`${taskStyles.bgColor} ${taskStyles.color} text-xs px-2 py-0.5 rounded-full`}>
                                  {task.status}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-6">
                                <div className="text-sm text-gray-500">
                                  {task.date || 'Not scheduled'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {task.assignee || 'Unassigned'}
                                </div>
                                <Button variant="outline" size="sm" className="text-xs">
                                  Edit
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Add Task Button */}
                      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <Button variant="outline" size="sm" className="text-[#0f566c] border-[#0f566c]">
                          + Add Task
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProjectManage;
