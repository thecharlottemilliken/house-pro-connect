
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
        // Using untyped query to avoid TypeScript errors
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
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
          
        if (error) throw error;
        
        // Type assertion to match the expected Project[] type
        setProjects(data as Project[] || []);
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load your projects. Please try again.",
          variant: "destructive"
        });
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
                  <h2 className="text-lg font-semibold mb-1">{project.title}</h2>
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
