
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  property_id: string;
  title: string;
  created_at: string;
  property: {
    property_name: string;
    image_url: string;
    address_line1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  is_owner: boolean;
  team_role?: string;
}

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching projects for user:", user.id);
        
        // First try to use RPC to bypass RLS issues
        const { data: rpcData, error: rpcError } = await supabase.rpc('handle_project_update', {
          p_project_id: null, // Just retrieving, not updating
          p_property_id: null,
          p_user_id: user.id,
          p_title: '',
          p_renovation_areas: null,
          p_project_preferences: null,
          p_construction_preferences: null,
          p_design_preferences: null,
          p_management_preferences: null,
          p_prior_experience: null
        });
        
        if (rpcError) {
          console.warn('RPC method failed, trying direct query:', rpcError);
          
          // If RPC fails, try direct query for user's owned projects
          const { data: ownedProjects, error: ownedError } = await supabase
            .from('projects')
            .select(`
              id,
              title,
              property_id,
              created_at,
              user_id
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (ownedError) {
            console.error('Direct query failed:', ownedError);
            throw ownedError;
          }
          
          // Process the projects data
          if (ownedProjects && ownedProjects.length > 0) {
            const projectIds = ownedProjects.map(project => project.property_id);
            
            // Fetch properties data
            const { data: propertiesData, error: propertiesError } = await supabase
              .from('properties')
              .select(`
                id,
                property_name,
                image_url,
                address_line1,
                city,
                state,
                zip_code
              `)
              .in('id', projectIds);
            
            if (propertiesError) {
              console.error('Error fetching properties:', propertiesError);
              throw propertiesError;
            }
            
            // Create a map for easy property lookup
            const propertiesMap = new Map();
            if (propertiesData) {
              propertiesData.forEach(property => {
                propertiesMap.set(property.id, property);
              });
            }
            
            // Map projects with their properties
            const processedProjects = ownedProjects.map(project => {
              const property = propertiesMap.get(project.property_id) || {
                property_name: "Unknown Property",
                image_url: "",
                address_line1: "Address not available",
                city: "Unknown",
                state: "Unknown",
                zip_code: ""
              };
              
              return {
                id: project.id,
                title: project.title,
                property_id: project.property_id,
                created_at: project.created_at,
                property,
                is_owner: true
              };
            });
            
            setProjects(processedProjects);
          } else {
            setProjects([]);
          }
        } else {
          // If RPC was successful, continue with original logic
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
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (ownedError) throw ownedError;
          
          // Mark owned projects
          const ownedProjectsWithRole = (ownedProjects || []).map(project => ({
            ...project,
            is_owner: true
          }));
          
          // Then, get projects where the user is a team member but not the owner
          // Fix: Query project_team_members first, then join with projects table
          const { data: teamMemberships, error: teamError } = await supabase
            .from('project_team_members')
            .select(`
              role,
              project_id
            `)
            .eq('user_id', user.id);
          
          if (teamError) throw teamError;

          let teamProjects: Project[] = [];
          
          // If user is a team member on any projects, fetch those projects
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
          
          // Create a Map to store unique projects by ID
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
          
          // Convert map back to array for state
          const allProjects = Array.from(projectMap.values());
          
          console.log(`Found ${allProjects.length} projects in total`);
          setProjects(allProjects);
        }
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load your projects. Please try again.",
          variant: "destructive"
        });
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [user]);

  const goToProjectDashboard = (projectId: string) => {
    navigate(`/project-dashboard/${projectId}`);
  };
  
  const formatAddress = (project: Project) => {
    const property = project.property;
    return `${property.address_line1}, ${property.city}, ${property.state} ${property.zip_code}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <main className="flex-1 p-4 md:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-3 sm:gap-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Projects</h1>
          <Button 
            className="bg-[#174c65] hover:bg-[#174c65]/90 w-full sm:w-auto"
            onClick={() => navigate("/create-project")}
          >
            <Plus className="mr-2 h-4 w-4" /> CREATE NEW PROJECT
          </Button>
        </div>
        
        {isLoading ? (
          <div className="py-8 text-center">Loading your projects...</div>
        ) : projects.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Projects Yet</h2>
            <p className="text-gray-600 mb-4">You haven't created any projects yet. Start your first renovation project today!</p>
            <Button 
              className="bg-[#174c65] hover:bg-[#174c65]/90"
              onClick={() => navigate("/create-project")}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={project.property.image_url} 
                    alt={project.property.property_name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between mb-1">
                    <h2 className="text-lg font-semibold">{project.title}</h2>
                    {!project.is_owner && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {project.team_role || 'Team Member'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base text-gray-700 mb-2">{project.property.property_name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{formatAddress(project)}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Created on {new Date(project.created_at).toLocaleDateString()}
                  </p>
                  <Button 
                    className="w-full bg-[#174c65] hover:bg-[#174c65]/90 justify-between"
                    onClick={() => goToProjectDashboard(project.id)}
                  >
                    VIEW PROJECT <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
