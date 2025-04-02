
import { useState } from "react";
import { CalendarIcon, ListTodo, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CalendarView from "./Calendar/CalendarView";
import RoadmapView from "./Roadmap/RoadmapView";
import PhasesView from "./Phases/PhasesView";

interface ProjectManageTabsProps {
  defaultTab?: string;
}

const ProjectManageTabs = ({ defaultTab = "calendar" }: ProjectManageTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <Tabs defaultValue={defaultTab} onValueChange={setActiveTab} value={activeTab} className="w-full">
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
        <CalendarView />
      </TabsContent>
      
      <TabsContent value="roadmap" className="m-0 p-0">
        {/* Project Phases Title */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Project Phases</h2>
        </div>
        
        <RoadmapView />
      </TabsContent>
      
      <TabsContent value="phases" className="m-0 p-0">
        <PhasesView />
      </TabsContent>
    </Tabs>
  );
};

export default ProjectManageTabs;
