import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, CreditCard, ExternalLink, UserPlus } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  role: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

const ProjectTeam = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const { projectData, isLoading: isProjectLoading } = useProjectData(params.projectId, location.state);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isTeamLoading, setIsTeamLoading] = useState(true);

  const projectId = projectData?.id || params.projectId || "unknown";
  const projectTitle = projectData?.title || "Unknown Project";

  useEffect(() => {
    if (projectId) {
      fetchTeamMembers(projectId);
    }
  }, [projectId]);

  const fetchTeamMembers = async (projectId: string) => {
    setIsTeamLoading(true);
    const { data, error } = await supabase
      .from("project_team_members")
      .select("role, user_id, profiles:profiles!user_id(name,email)") // 👈 hint at FK
      .eq("project_id", projectId);

    if (error) {
      console.error("Failed to load team members:", error);
      setTeamMembers([]);
    } else {
      setTeamMembers(
        data.map((member: any) => ({
          role: member.role,
          name: member.profiles?.name ?? "Unknown",
          email: member.profiles?.email ?? "Unknown",
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${member.profiles?.name ?? "U"}`,
        }))
      );
    }

    setIsTeamLoading(false);
  };

  if (isProjectLoading || isTeamLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Loading project details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />

      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar projectId={projectId} projectTitle={projectTitle} activePage="team" />

          <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-0">Project Team</h1>
              <Button className="bg-[#0f566c] hover:bg-[#0d4a5d] w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                INVITE A TEAM MEMBER
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center mb-2">
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-gray-700">{member.role}</h3>
                          <h2 className="font-medium text-lg text-gray-900">{member.name}</h2>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="text-sm text-gray-700">{member.email}</div>
                    </div>

                    <div className="flex border-t border-gray-200">
                      <button className="flex-1 py-3 flex justify-center items-center text-gray-600 hover:bg-gray-50">
                        <MessageSquare className="h-5 w-5" />
                      </button>
                      <div className="border-r border-gray-200"></div>
                      <button className="flex-1 py-3 flex justify-center items-center text-gray-600 hover:bg-gray-50">
                        <Phone className="h-5 w-5" />
                      </button>
                      <div className="border-r border-gray-200"></div>
                      <button className="flex-1 py-3 flex justify-center items-center text-gray-600 hover:bg-gray-50">
                        <CreditCard className="h-5 w-5" />
                      </button>
                      <div className="border-r border-gray-200"></div>
                      <button className="flex-1 py-3 flex justify-center items-center text-gray-600 hover:bg-gray-50">
                        <ExternalLink className="h-5 w-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectTeam;
