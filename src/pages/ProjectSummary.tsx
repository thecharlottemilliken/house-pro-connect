
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import CreateProjectSteps from "@/components/project/create/CreateProjectSteps";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ProjectSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get location state data from the previous steps
  const { 
    propertyId, 
    renovationAreas,
    projectPreferences,
    constructionPreferences,
    designPreferences,
    managementPreferences,
    priorExperience
  } = location.state || {};
  
  // Define the steps for the project creation process
  const steps = [
    { number: 1, title: "Select a Property", current: false },
    { number: 2, title: "Select Renovation Areas", current: false },
    { number: 3, title: "Project Preferences", current: false },
    { number: 4, title: "Construction Preferences", current: false },
    { number: 5, title: "Design Preferences", current: false },
    { number: 6, title: "Management Preferences", current: false },
    { number: 7, title: "Prior Experience", current: false },
    { number: 8, title: "Summary", current: true },
  ];
  
  // Handle submission of the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a project title",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a project",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call Supabase edge function to create/update the project
      const { data, error } = await supabase.functions.invoke(
        'handle-project-update',
        {
          body: {
            propertyId,
            userId: user.id,
            title,
            description,
            renovationAreas,
            projectPreferences,
            constructionPreferences,
            designPreferences,
            managementPreferences,
            priorExperience
          }
        }
      );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Your project has been created successfully"
      });
      
      // Navigate to the project dashboard with the new project ID
      navigate(`/project-dashboard/${data}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle going back to the previous step
  const handleBack = () => {
    navigate("/prior-experience", { 
      state: { 
        propertyId,
        renovationAreas,
        projectPreferences,
        constructionPreferences,
        designPreferences,
        managementPreferences,
        priorExperience
      } 
    });
  };
  
  // Check if we have all required data from previous steps
  useEffect(() => {
    if (!propertyId) {
      toast({
        title: "Missing information",
        description: "Please start from the beginning of the project creation process",
        variant: "destructive"
      });
      navigate("/create-project");
    }
  }, [propertyId, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        <CreateProjectSteps steps={steps} />
        
        <div className="flex-1 p-4 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Project Summary</h1>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8">
            Give your project a name and provide a detailed description.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
            <div className="space-y-2">
              <Label htmlFor="title">Project Name</Label>
              <Input 
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Kitchen Renovation"
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project in detail..."
                className="min-h-[200px] w-full"
              />
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <Button 
                type="button" 
                onClick={handleBack}
                variant="outline"
                className="border-[#174c65] text-[#174c65]"
              >
                Previous Step
              </Button>
              
              <Button 
                type="submit"
                className="bg-[#174c65] hover:bg-[#174c65]/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Creating...
                  </>
                ) : "Create Project"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummary;
