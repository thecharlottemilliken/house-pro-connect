
import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import ActivityItem from "@/components/project/activity/ActivityItem";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TeamMemberFilter from "@/components/project/activity/TeamMemberFilter";

// Mock data for activity items
const activityItems = [
  {
    id: 1,
    user: "Jane Cooper",
    userImage: "https://randomuser.me/api/portraits/women/10.jpg",
    action: "added a new design document",
    item: "Kitchen Cabinet Layout",
    timestamp: "2023-04-15T14:30:00",
  },
  {
    id: 2,
    user: "Robert Fox",
    userImage: "https://randomuser.me/api/portraits/men/4.jpg",
    action: "updated project timeline",
    item: "Demolition Phase",
    timestamp: "2023-04-14T10:15:00",
  },
  {
    id: 3,
    user: "Leslie Alexander",
    userImage: "https://randomuser.me/api/portraits/women/4.jpg",
    action: "uploaded new photos",
    item: "Bathroom Tile Options",
    timestamp: "2023-04-13T16:45:00",
  },
  {
    id: 4,
    user: "Cody Fisher",
    userImage: "https://randomuser.me/api/portraits/men/7.jpg",
    action: "added a comment",
    item: "Floor Plan Review",
    timestamp: "2023-04-12T09:20:00",
  },
  {
    id: 5,
    user: "Jenny Wilson",
    userImage: "https://randomuser.me/api/portraits/women/3.jpg",
    action: "created a task",
    item: "Select Kitchen Appliances",
    timestamp: "2023-04-11T13:10:00",
  },
];

const ProjectActivityHistory = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState("all");
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);
  
  const { projectData, propertyDetails, isLoading } = useProjectData(
    params.projectId,
    location.state
  );

  if (isLoading || !propertyDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Loading project details...</div>
        </div>
      </div>
    );
  }

  const projectId = projectData?.id || params.projectId || "";
  const projectTitle = projectData?.title || "Activity History";

  // Filter activity items based on selection
  const filteredActivities = activityItems.filter(item => {
    if (filter === "all") return true;
    if (filter === "documents") return item.action.includes("document");
    if (filter === "comments") return item.action.includes("comment");
    if (filter === "uploads") return item.action.includes("upload");
    if (filter === "tasks") return item.action.includes("task");
    return true;
  }).filter(item => {
    if (!selectedTeamMember) return true;
    return item.user === selectedTeamMember;
  });

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectId} 
            projectTitle={projectTitle}
            activePage="activity"
          />
          
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-2xl font-bold mb-4 md:mb-0">Activity History</h1>
              
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <TeamMemberFilter 
                  selectedMember={selectedTeamMember}
                  onSelectMember={setSelectedTeamMember}
                />
                
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter activities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="comments">Comments</SelectItem>
                    <SelectItem value="uploads">Uploads</SelectItem>
                    <SelectItem value="tasks">Tasks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredActivities.length > 0 ? (
                filteredActivities.map(item => (
                  <ActivityItem key={item.id} item={item} />
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No activity items match your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectActivityHistory;
