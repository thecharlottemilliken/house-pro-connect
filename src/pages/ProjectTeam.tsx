
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
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TeamMember {
  id: string;
  role: string;
  name: string;
  email: string;
  phone?: string;
}

const ProjectTeam = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const { projectData, isLoading } = useProjectData(params.projectId, location.state);
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const projectId = projectData?.id || params.projectId || "unknown";
  const projectTitle = projectData?.title || "Unknown Project";

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!projectId || !user) return;
      
      try {
        console.log("Fetching team members for project:", projectId);
        
        // First, get the project details to get the owner's ID
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('user_id')
          .eq('id', projectId)
          .single();
          
        if (projectError) throw projectError;
        
        console.log("Project data:", projectData);
        
        if (!projectData || !projectData.user_id) {
          console.error("No project owner found");
          setLoading(false);
          return;
        }
        
        // Array to collect team members
        let teamMembersList: TeamMember[] = [];
        
        // If current user is the project owner (resident)
        if (user.id === projectData.user_id) {
          console.log("Current user is the project owner, fetching coaches");
          // Fetch coaches to show to the resident
          const { data: coaches, error: coachesError } = await supabase
            .from('profiles')
            .select('id, name, email, role')
            .eq('role', 'coach');
            
          if (coachesError) throw coachesError;
          
          if (coaches && coaches.length > 0) {
            teamMembersList = [
              ...teamMembersList,
              ...coaches.map(coach => ({
                id: coach.id,
                name: coach.name || 'Unknown Coach',
                email: coach.email || '',
                role: coach.role,
                phone: "(555) 123-4567" // Placeholder phone number
              }))
            ];
          }
        } else {
          // User is likely a coach or other role, show them the project owner
          console.log("Current user is not the project owner, fetching project owner");
          const { data: owner, error: ownerError } = await supabase
            .from('profiles')
            .select('id, name, email, role')
            .eq('id', projectData.user_id)
            .single();
            
          if (ownerError) throw ownerError;
          
          if (owner) {
            teamMembersList.push({
              id: owner.id,
              name: owner.name || 'Project Owner',
              email: owner.email || '',
              role: owner.role,
              phone: "(555) 123-4567" // Placeholder phone number
            });
          }
        }
        
        // Filter out the current user from the team members list
        teamMembersList = teamMembersList.filter(member => member.id !== user.id);
        
        console.log("Team members found:", teamMembersList);
        setTeamMembers(teamMembersList);
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [projectId, user]);
  
  if (isLoading || loading) {
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
          <ProjectSidebar 
            projectId={projectId} 
            projectTitle={projectTitle}
            activePage="team"
          />
          
          <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-0">
                Project Team
              </h1>
              <Button className="bg-[#0f566c] hover:bg-[#0d4a5d] w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                INVITE A TEAM MEMBER
              </Button>
            </div>
            
            {teamMembers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No team members found for this project.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center mb-2">
                          <Avatar className="h-12 w-12 mr-3">
                            <AvatarImage src="/placeholder.svg" alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-gray-700 capitalize">{member.role}</h3>
                            <h2 className="font-medium text-lg text-gray-900">{member.name}</h2>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="text-sm text-gray-700 mb-2">{member.phone}</div>
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
            )}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectTeam;
