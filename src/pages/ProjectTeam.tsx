
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
import { useProfileRole } from "@/profile/ProfileRole";

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
  const { user, profile } = useAuth();
  const { role: userRole } = useProfileRole();
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
          
        if (projectError) {
          console.error("Error fetching project data:", projectError);
          // Instead of throwing, we'll try to continue with an alternate approach
          if (userRole === 'coach') {
            // If user is a coach, try to find residents with projects
            const { data: projects } = await supabase
              .from('projects')
              .select('user_id')
              .eq('id', projectId);
              
            if (projects && projects.length > 0) {
              // Get the first project's owner
              const projectOwnerId = projects[0].user_id;
              
              // Fetch the owner's profile
              const { data: ownerProfile } = await supabase
                .from('profiles')
                .select('id, name, email, role')
                .eq('id', projectOwnerId);
                
              if (ownerProfile && ownerProfile.length > 0) {
                const teamMember = {
                  id: ownerProfile[0].id,
                  name: ownerProfile[0].name || 'Project Owner',
                  email: ownerProfile[0].email || '',
                  role: ownerProfile[0].role || 'resident',
                  phone: "(555) 123-4567" // Placeholder
                };
                
                setTeamMembers([teamMember]);
                console.log("Found project owner as team member:", teamMember);
              }
            }
          }
          setLoading(false);
          return;
        }
        
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
            
          if (coachesError) {
            console.error("Error fetching coaches:", coachesError);
          } else if (coaches && coaches.length > 0) {
            teamMembersList = [
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
          
          // Using maybeSingle() instead of single() to avoid errors when no rows are found
          const { data: owner, error: ownerError } = await supabase
            .from('profiles')
            .select('id, name, email, role')
            .eq('id', projectData.user_id)
            .maybeSingle();
            
          if (ownerError) {
            console.error("Error fetching owner profile:", ownerError);
          } else if (owner) {
            teamMembersList.push({
              id: owner.id,
              name: owner.name || 'Project Owner',
              email: owner.email || '',
              role: owner.role || 'resident',
              phone: "(555) 123-4567" // Placeholder phone number
            });
          } else {
            // If we couldn't find the owner profile, try a different approach
            // This is a fallback in case the user_id in projects doesn't match any profile
            console.log("Owner profile not found, attempting to find project owner another way");
            
            const { data: ownerProfiles } = await supabase
              .from('profiles')
              .select('id, name, email, role')
              .eq('id', projectData.user_id);
              
            if (ownerProfiles && ownerProfiles.length > 0) {
              teamMembersList.push({
                id: ownerProfiles[0].id,
                name: ownerProfiles[0].name || 'Project Owner',
                email: ownerProfiles[0].email || '',
                role: ownerProfiles[0].role || 'resident',
                phone: "(555) 123-4567" // Placeholder phone number
              });
            }
          }
        }
        
        // If we still don't have any team members, try to get anyone associated with this project
        if (teamMembersList.length === 0) {
          console.log("No team members found with standard approach, looking for anyone related to this project");
          
          // First check if the logged in user is a coach
          if (userRole === 'coach') {
            // Find the project owner
            const { data: projectOwners } = await supabase
              .from('projects')
              .select('user_id')
              .eq('id', projectId);
              
            if (projectOwners && projectOwners.length > 0) {
              const ownerId = projectOwners[0].user_id;
              
              // Get the owner's profile
              const { data: ownerInfo } = await supabase
                .from('profiles')
                .select('id, name, email, role')
                .eq('id', ownerId);
                
              if (ownerInfo && ownerInfo.length > 0) {
                teamMembersList.push({
                  id: ownerInfo[0].id,
                  name: ownerInfo[0].name || 'Project Owner',
                  email: ownerInfo[0].email || '',
                  role: ownerInfo[0].role || 'resident',
                  phone: "(555) 123-4567" // Placeholder
                });
              }
            }
          } else {
            // If user is a resident, get all coaches
            const { data: coaches } = await supabase
              .from('profiles')
              .select('id, name, email, role')
              .eq('role', 'coach');
              
            if (coaches) {
              teamMembersList = [
                ...teamMembersList,
                ...coaches.map(coach => ({
                  id: coach.id,
                  name: coach.name || 'Unknown Coach',
                  email: coach.email || '',
                  role: coach.role,
                  phone: "(555) 123-4567" // Placeholder
                }))
              ];
            }
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
  }, [projectId, user, userRole]);
  
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
