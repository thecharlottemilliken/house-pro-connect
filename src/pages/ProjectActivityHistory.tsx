
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarProvider } from "@/components/ui/sidebar";
import ActivityItem from "@/components/project/activity/ActivityItem";
import TeamMemberFilter from "@/components/project/activity/TeamMemberFilter";
import ProjectSidebar from "@/components/project/ProjectSidebar";

const ProjectActivityHistory = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [teamMemberFilter, setTeamMemberFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");

  // Mock activity data
  const activities = [
    {
      id: 1,
      title: "Kitchen Remodeling Consultation",
      role: "Designer",
      personName: "Sophia Jackson",
      date: "February 10, 10:00 PM",
    },
    {
      id: 2,
      title: "Bathroom Tile Installation",
      role: "Plumber",
      personName: "Gary Fisher",
      date: "February 5, 12:00 PM",
    },
    {
      id: 3,
      title: "Deck Building Assessment",
      role: "Landscaper",
      personName: "Sarah Lee",
      date: "February 1, 8:15 AM",
    },
    {
      id: 4,
      title: "Roof Repair Evaluation",
      role: "Electrician",
      personName: "Doug Martin",
      date: "January 30, 3:00 PM",
    },
    {
      id: 5,
      title: "Interior Painting Estimate",
      role: "Carpenter",
      personName: "Mary Johnson",
      date: "January 25, 1:45 PM",
    },
    {
      id: 6,
      title: "Drywall Installation Review",
      role: "Coach",
      personName: "Don Smith",
      date: "January 15, 5:30 PM",
    }
  ];
  
  // Filter activities based on search query and team member filter
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchQuery === "" || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.personName.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesTeamFilter = teamMemberFilter === "all" || 
      activity.role.toLowerCase() === teamMemberFilter.toLowerCase();
      
    return matchesSearch && matchesTeamFilter;
  });

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-gray-50">
        <ProjectSidebar projectId={projectId || ""} activePage="activity" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Activity History</h1>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <TeamMemberFilter 
                  value={teamMemberFilter} 
                  onChange={setTeamMemberFilter}
                />
                
                <Button variant="outline" size="icon" className="ml-1">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-gray-500 whitespace-nowrap">Sort by</span>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Recent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="a-z">A-Z</SelectItem>
                    <SelectItem value="z-a">Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-white rounded-md shadow">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    title={activity.title}
                    role={activity.role}
                    personName={activity.personName}
                    date={activity.date}
                  />
                ))
              ) : (
                <div className="py-10 text-center text-gray-500">
                  No activities found.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProjectActivityHistory;
