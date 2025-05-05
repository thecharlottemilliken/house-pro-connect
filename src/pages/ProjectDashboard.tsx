
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Project } from "@/types/project";

interface ProjectDashboardProps {
  // Add any props here
}

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        toast({
          title: "Error",
          description: "Project ID is missing.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('handle-project-update', {
          method: 'POST',
          body: {
            projectId: projectId,
            userId: user?.id
          }
        });

        if (error) {
          console.error("Error fetching project data:", error);
          toast({
            title: "Error",
            description: "Failed to load project data.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        setProjectData(data as Project);
        setLoading(false);
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, user]);

  const handleShareProject = () => {
    // Implement share project functionality here
    console.log("Share project clicked");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="border-b">
        {/* Here would be your navbar, but we'll add that later if needed */}
      </div>
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{projectData?.title || 'Project Dashboard'}</h1>
                  {projectData?.description && (
                    <p className="text-gray-600 mt-1 max-w-2xl">{projectData.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleShareProject}>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                  <Button size="sm" onClick={() => navigate(`/project-manage/${projectId}`)}>
                    Manage Project <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
                <Button variant="secondary" size="sm">Add Task</Button>
                <Button variant="secondary" size="sm">Upload Document</Button>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-2">Project Overview</h2>
                <p>Status: In Progress</p>
                <p>Start Date: August 1, 2024</p>
                <p>Due Date: December 31, 2024</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-2">Team Members</h2>
                <ul>
                  <li>John Doe - Architect</li>
                  <li>Jane Smith - Contractor</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;
