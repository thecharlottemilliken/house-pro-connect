
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
        // First, get the project details to get the owner's ID
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('user_id')
          .eq('id', projectId)
          .single();
          
        if (projectError) throw projectError;

        // Get all profiles that could be part of this project
        // For coaches: we need to see the project owner (resident)
        // For residents: we need to see coaches
        let profilesQuery = supabase.from('profiles').select('id, name, email, role');
        
        if (user.id === projectData.user_id) {
          // User is the project owner (resident), show them coaches
          profilesQuery = profilesQuery.eq('role', 'coach');
        } else {
          // User is likely a coach, show them the project owner
          profilesQuery = profilesQuery.eq('id', projectData.user_id);
        }
        
        const { data: profiles, error: profilesError } = await profilesQuery;

        if (profilesError) throw profilesError;

        // Filter out the current user and format the team members
        const filteredTeamMembers = profiles
          .filter(profile => profile.id !== user.id)
          .map(profile => ({
            id: profile.id,
            name: profile.name || 'Unknown User',
            email: profile.email || '',
            role: profile.role,
            phone: "(555) 123-4567" // Placeholder phone number
          }));

        setTeamMembers(filteredTeamMembers);
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
