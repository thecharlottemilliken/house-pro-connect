
import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
import { toast } from "@/hooks/use-toast";

// Updated interfaces to match the new query structure
interface ProfileData {
  id?: string;
  name?: string;
  email?: string;
}

interface TeamMemberData {
  id: string;
  role: string;
  email: string | null;
  name: string | null;
  user_id: string;
  profiles?: ProfileData;
}

interface TeamMember {
  id: string;
  role: string;
  name: string;
  email: string;
  avatarUrl: string;
}

// Fetches team members from Supabase with the correct join
const useTeamMembers = (projectId: string | undefined) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const fetchTeamMembers = async () => {
      setLoading(true);

      // Use a direct join query instead of the nested select
      const { data, error } = await supabase
        .from("project_team_members")
        .select(`
          id,
          role,
          email,
          name,
          user_id,
          profiles:profiles(id, name, email)
        `)
        .eq("project_id", projectId);

      if (error) {
        console.error("Failed to load team members:", error);
        toast({
          title: "Error",
          description: "Failed to load team members. Please try again.",
          variant: "destructive"
        });
        setTeamMembers([]);
      } else {
        console.log("Team members data:", data);
        const formatted: TeamMember[] = (data as TeamMemberData[]).map((member) => {
          // Attempt to get name and email from profile first, fall back to direct fields
          const profile = member.profiles;
          const name = profile?.name || member.name || "Unnamed";
          const email = profile?.email || member.email || "No email";
          
          return {
            id: member.id,
            role: member.role,
            name: name,
            email: email,
            avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
          };
        });
        setTeamMembers(formatted);
      }

      setLoading(false);
    };

    fetchTeamMembers();
  }, [projectId]);

  return { teamMembers, loading };
};

// Function to add a team member
const addTeamMember = async (projectId: string, email: string, role: string, name?: string) => {
  try {
    // First check if user exists in profiles
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (userError) throw userError;

    // Add the team member
    const { error } = await supabase.from("project_team_members").insert({
      project_id: projectId,
      user_id: userData?.id || '00000000-0000-0000-0000-000000000000', // If user doesn't exist, use placeholder
      role: role,
      email: email,
      name: name || email.split('@')[0] // Use first part of email as default name
    });

    if (error) throw error;
    
    return { success: true };
  } catch (err: any) {
    console.error("Error adding team member:", err);
    return { success: false, error: err.message };
  }
};

const ProjectTeam = () => {
  const location = useLocation();
  const params = useParams();
  const isMobile = useIsMobile();
  const { projectData, isLoading: isProjectLoading } = useProjectData(params.projectId, location.state);

  const projectId = projectData?.id || params.projectId || "unknown";
  const projectTitle = projectData?.title || "Unknown Project";

  const { teamMembers, loading: isTeamLoading } = useTeamMembers(projectId);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("team_member");

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive"
      });
      return;
    }

    setIsInviting(true);
    try {
      const result = await addTeamMember(projectId, inviteEmail, inviteRole);
      if (result.success) {
        toast({
          title: "Success",
          description: "Team member invited successfully",
        });
        setInviteEmail("");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to invite team member",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error inviting team member:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
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
              <Button 
                className="bg-[#0f566c] hover:bg-[#0d4a5d] w-full sm:w-auto"
                onClick={() => {
                  // Simple dialog here, in a real app use a proper dialog component
                  const email = prompt("Enter team member's email:");
                  if (email) {
                    const role = prompt("Enter role (team_member, contractor, designer):", "team_member");
                    addTeamMember(projectId, email, role || "team_member")
                      .then(result => {
                        if (result.success) {
                          toast({
                            title: "Success",
                            description: "Team member added successfully",
                          });
                          // Refresh the page to show the new team member
                          window.location.reload();
                        } else {
                          toast({
                            title: "Error",
                            description: result.error || "Failed to add team member",
                            variant: "destructive"
                          });
                        }
                      });
                  }
                }}
              >
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
