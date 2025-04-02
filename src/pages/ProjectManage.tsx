
import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { 
  Calendar as CalendarIcon, 
  ListTodo, 
  FileText,
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { useProjectData } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";

const ProjectManage = () => {
  const location = useLocation();
  const params = useParams();
  const { projectData, isLoading } = useProjectData(params.projectId, location.state);
  const [activeTab, setActiveTab] = useState("roadmap");
  const [currentMonth, setCurrentMonth] = useState("January");
  const [dateRange, setDateRange] = useState("12/05/24 - 12/21/24");
  
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

  // Sample tasks for the Gantt chart
  const tasks = [
    { id: 1, name: "Tile Job", color: "#e84c88", status: "Active", startDay: 5, endDay: 11 },
    { id: 2, name: "Drywall Install", color: "#4bc8eb", status: "Requested", startDay: 14, endDay: 17 }
  ];

  // Days for the Gantt chart
  const days = [
    { day: 5, name: "Mon" },
    { day: 6, name: "Tue" },
    { day: 7, name: "Wed" },
    { day: 8, name: "Thur" },
    { day: 9, name: "Fri" },
    { day: 10, name: "Sat" },
    { day: 11, name: "Sun" },
    { day: 12, name: "Mon" },
    { day: 13, name: "Tue" },
    { day: 14, name: "Wed" },
    { day: 15, name: "Thur" },
    { day: 16, name: "Fri" },
    { day: 17, name: "Sat" },
    { day: 18, name: "Sun" },
    { day: 19, name: "Mon" },
    { day: 20, name: "Tue" }
  ];

  const highlightedDay = 14; // Day to highlight with blue background

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
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button 
                className={`flex items-center pb-3 ${activeTab === "roadmap" ? "border-b-2 border-[#0f566c] text-[#0f566c] font-medium" : "text-gray-500"}`}
                onClick={() => setActiveTab("roadmap")}
              >
                <ListTodo className="mr-2 h-5 w-5" /> 
                Roadmap
              </button>
              <button 
                className={`flex items-center pb-3 ${activeTab === "calendar" ? "border-b-2 border-[#0f566c] text-[#0f566c] font-medium" : "text-gray-500"}`}
                onClick={() => setActiveTab("calendar")}
              >
                <CalendarIcon className="mr-2 h-5 w-5" /> 
                Calendar
              </button>
              <button 
                className={`flex items-center pb-3 ${activeTab === "phases" ? "border-b-2 border-[#0f566c] text-[#0f566c] font-medium" : "text-gray-500"}`}
                onClick={() => setActiveTab("phases")}
              >
                <FileText className="mr-2 h-5 w-5" /> 
                Phases
              </button>
            </div>
          </div>
          
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
        </div>
      </div>
    </div>
  );
};

export default ProjectManage;
