
import { useState } from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectList from "@/components/coach/ProjectList";
import MessageCenter from "@/components/coach/MessageCenter";

const CoachDashboard = () => {
  const [activeTab, setActiveTab] = useState("projects");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <main className="flex-1 p-4 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor projects, communicate with residents, and provide assistance.
          </p>
        </div>
        
        <Tabs defaultValue="projects" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="projects">All Projects</TabsTrigger>
            <TabsTrigger value="messages">Message Center</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-6">
            <ProjectList />
          </TabsContent>
          
          <TabsContent value="messages" className="space-y-6">
            <MessageCenter />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CoachDashboard;
