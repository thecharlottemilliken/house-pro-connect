
import { useState, useEffect } from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus, Calendar as CalendarIcon } from "lucide-react";
import ProjectList from "@/components/coach/ProjectList";
import MessageCenter from "@/components/coach/MessageCenter";
import JWTDebugger from "@/components/debug/JWTDebugger";
import { useCoachProjects } from "@/hooks/useCoachProjects";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MeetupScheduleWidget } from "@/components/coach/MeetupScheduleWidget";
import CoachCalendarView from "@/components/coach/CoachCalendarView";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";

const CoachDashboard = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const { fetchProjects } = useCoachProjects();
  const [isAddingCoaches, setIsAddingCoaches] = useState(false);
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();

  // Set up real-time notifications for new coaching requests
  useEffect(() => {
    if (!user) return;
    
    const channelName = `coach_dashboard_notifications_${user.id}`;
    console.log(`Setting up ${channelName} subscription for user:`, user.id);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id} AND type=eq.project_coaching_request`
        },
        (payload) => {
          console.log('Coach received new project request notification:', payload);
          toast.success('New coaching request received');
          
          // Refresh data
          fetchProjects();
          refreshNotifications();
        }
      )
      .subscribe((status) => {
        console.log(`Coach dashboard subscription status: ${status}`);
      });
    
    return () => {
      console.log(`Removing ${channelName} subscription`);
      supabase.removeChannel(channel);
    };
  }, [user, fetchProjects, refreshNotifications]);

  const handleRefresh = () => {
    fetchProjects();
    refreshNotifications();
  };

  const handleAddCoachesToProjects = async () => {
    try {
      setIsAddingCoaches(true);
      const { data, error } = await supabase.functions.invoke(
        'add-coaches-to-projects',
        { method: 'POST' }
      );
      
      if (error) {
        console.error("Error adding coaches to projects:", error);
        toast.error("Failed to add coaches to projects. Please try again.");
      } else {
        toast.success("Coaches have been added to all projects");
        fetchProjects();
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsAddingCoaches(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      <JWTDebugger />
      <main className="flex-1 p-4 md:p-10">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Monitor projects, communicate with residents, and provide assistance.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleAddCoachesToProjects}
              variant="outline" 
              className="flex items-center gap-2"
              disabled={isAddingCoaches}
            >
              <UserPlus size={16} />
              {isAddingCoaches ? "Adding..." : "Add Coaches to Projects"}
            </Button>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh Data
            </Button>
          </div>
        </div>
        
        {/* Add the MeetupScheduleWidget here, above the tabs */}
        <MeetupScheduleWidget />
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="projects">Open Projects</TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="messages">Message Center</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-6">
            <ProjectList />
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-6">
            <Card className="p-6">
              <CoachCalendarView />
            </Card>
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
