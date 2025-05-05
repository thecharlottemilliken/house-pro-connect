import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProjectGrid from "@/components/projects/ProjectGrid";
import EmptyProjectState from "@/components/projects/EmptyProjectState";
import { Project } from "@/types/project";

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching projects for user:", user?.id);
      
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('handle-project-update', {
        method: 'POST',
        body: { 
          userId: user?.id,
          operation: "get-user-projects"
        }
      });
      
      if (edgeError) {
        console.error("Error using edge function:", edgeError);
        throw edgeError;
      }
      
      if (edgeData && Array.isArray(edgeData.projects)) {
        console.log(`Found ${edgeData.projects.length} projects via edge function`);
        setProjects(edgeData.projects);
        setIsLoading(false);
        return;
      }
      
      // If edge function doesn't return expected data, try direct query
      console.warn("Edge function did not return expected data, trying direct query");
      
      // First, get projects the user created directly
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          property_id,
          created_at,
          property:properties(
            property_name,
            image_url,
            address_line1,
            city,
            state,
            zip_code
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (ownedError) throw ownedError;
      
      // Mark owned projects
      const ownedProjectsWithRole = (ownedProjects || []).map(project => ({
        ...project,
        is_owner: true
      }));
      
      // Then, get projects where the user is a team member but not the owner
      const { data: teamMemberships, error: teamError } = await supabase
        .from('project_team_members')
        .select(`
          role,
          project_id
        `)
        .eq('user_id', user?.id);
      
      if (teamError) throw teamError;

      let teamProjects: Project[] = [];
      
      if (teamMemberships && teamMemberships.length > 0) {
        const projectIds = teamMemberships.map(member => member.project_id);
        
        const { data: teamProjectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            id,
            title,
            property_id,
            created_at,
            property:properties(
              property_name,
              image_url,
              address_line1,
              city,
              state,
              zip_code
            )
          `)
          .in('id', projectIds);
          
        if (projectsError) throw projectsError;
        
        // Match projects with their roles from teamMemberships
        teamProjects = (teamProjectsData || []).map(project => {
          const membership = teamMemberships.find(m => m.project_id === project.id);
          return {
            ...project,
            is_owner: false,
            team_role: membership?.role || 'Team Member'
          };
        });
      }
      
      // Combine and deduplicate the results
      const projectMap = new Map<string, Project>();
      
      // Add owned projects to the map first (they take precedence)
      ownedProjectsWithRole.forEach(project => {
        projectMap.set(project.id, project);
      });
      
      // Add team projects only if not already in the map
      teamProjects.forEach(project => {
        if (!projectMap.has(project.id)) {
          projectMap.set(project.id, project);
        }
      });
      
      // Convert map back to array
      const allProjects = Array.from(projectMap.values());
      
      console.log(`Found ${allProjects.length} projects in total`);
      setProjects(allProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast("Error", {
        description: "Failed to load your projects. Please try again."
      });
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const goToProjectDashboard = (projectId: string) => {
    navigate(`/project-dashboard/${projectId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <main className="flex-1 p-4 md:p-10">
        <ProjectHeader />
        
        {isLoading ? (
          <div className="py-8 text-center">Loading your projects...</div>
        ) : projects.length === 0 ? (
          <EmptyProjectState />
        ) : (
          <ProjectGrid 
            projects={projects} 
            onProjectClick={goToProjectDashboard}
          />
        )}
      </main>
    </div>
  );
};

export default Projects;
