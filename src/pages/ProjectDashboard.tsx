import React from "react";
import { useLocation, useParams, Navigate, useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectData, RenovationArea } from "@/hooks/useProjectData";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import PropertyCard from "@/components/project/PropertyCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FileText, PenBox, ShieldAlert, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProjectAccess } from "@/hooks/useProjectAccess";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import our components
import ProjectStagesCard from "@/components/project/ProjectStagesCard";
import ScheduleCardWidget from "@/components/project/ScheduleCardWidget";
import ProjectMilestonesWidget from "@/components/project/ProjectMilestonesWidget";
import FinancialComparisonCard from "@/components/project/FinancialComparisonCard";
import MessagesCard from "@/components/project/MessagesCard";
import ActionItemsWidget from "@/components/project/ActionItemsWidget";

const ProjectDashboard = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  const [showNoDesignDialog, setShowNoDesignDialog] = React.useState(false);
  
  const projectId = params.projectId || "";
  const { hasAccess, isOwner, role, isLoading: isAccessLoading } = useProjectAccess(projectId);
  
  const { projectData, propertyDetails, isLoading: isProjectLoading, error } = useProjectData(
    projectId,
    location.state
  );

  const isLoading = isAccessLoading || isProjectLoading;

  React.useEffect(() => {
    if (error) {
      toast.error(`Error loading project: ${error.message}`);
    }
  }, [error]);

  if (!isAccessLoading && !hasAccess) {
    return <Navigate to="/projects" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10 flex items-center justify-center">
          <div className="text-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading project details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !propertyDetails || !projectData) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10 flex items-center justify-center">
          <div className="text-center py-10 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to load project</h2>
            <p className="text-gray-600 mb-6">
              {error ? error.message : "The project could not be loaded. It may have been deleted or you may not have access."}
            </p>
            <Button onClick={() => navigate('/projects')}>
              Return to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const projectTitle = projectData?.title || "Project Overview";
  const renovationAreas = (projectData?.renovation_areas as unknown as RenovationArea[]) || [];
  const hasSOW = false;
  const hasDesignPlan = false;
  const isCoach = profile?.role === 'coach';

  const handleStartSOW = () => {
    if (!hasDesignPlan) {
      setShowNoDesignDialog(true);
    } else {
      startSOWCreation();
    }
  };

  const startSOWCreation = () => {
    navigate(`/project-sow/${projectId}`);
  };

  const propertyCardData = {
    id: propertyDetails.id,
    property_name: propertyDetails.property_name,
    image_url: propertyDetails.image_url,
    home_photos: propertyDetails.home_photos,
    address_line1: propertyDetails.address_line1,
    city: propertyDetails.city,
    state: propertyDetails.state,
    zip_code: propertyDetails.zip_code
  };

  const userRole = isOwner ? "Owner" : role || "Team Member";

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <DashboardNavbar />
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1 h-[calc(100vh-64px)] w-full">
          <ProjectSidebar 
            projectId={projectId} 
            projectTitle={projectTitle}
            activePage="overview"
          />
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 bg-white overflow-y-auto">
            <div className="mb-3 sm:mb-4 md:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
                  Project Overview
                </h1>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                    {userRole}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-3 sm:mb-4 md:mb-8">
              <div className="text-gray-600 text-sm sm:text-base md:text-lg">
                {propertyDetails.property_name} #{projectId.slice(-6)}
              </div>
            </div>
            
            {/* Main dashboard content with 3-column grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Column 1 - Property Card */}
              <div className="lg:col-span-1">
                <PropertyCard 
                  propertyDetails={propertyCardData}
                  renovationAreas={renovationAreas}
                />
              </div>

              {/* Column 2 - Action Items Widget */}
              <div className="lg:col-span-1">
                <ActionItemsWidget 
                  projectId={projectId}
                  projectData={projectData}
                  isOwner={isOwner}
                  isCoach={isCoach}
                />
              </div>

              {/* Column 3 - Schedule Card Widget with new design */}
              <div className="lg:col-span-1">
                <ScheduleCardWidget projectId={projectId} />
              </div>
              
              {/* Column 3 - Project Milestones Widget (renamed from Progress Card) */}
              <div className="lg:col-span-1">
                <ProjectMilestonesWidget projectId={projectId} />
              </div>
              
              {/* Project Stages Card - spans full width */}
              <div className="lg:col-span-3">
                <ProjectStagesCard projectData={projectData} />
              </div>
              
              {/* Messages Card */}
              <div className="lg:col-span-1">
                <MessagesCard projectId={projectId} />
              </div>
              
              {/* Financial Comparison Card - spans all 3 columns for chart visibility */}
              <div className="lg:col-span-3">
                <FinancialComparisonCard projectId={projectId} />
              </div>
              
              {/* SOW creation block if needed */}
              {!hasSOW && isCoach && (
                <div className="lg:col-span-3">
                  <div className="border border-gray-200 rounded-lg p-8 text-center">
                    <PenBox className="mx-auto h-12 w-12 text-[#0f566c] mb-4" />
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Begin Building the Statement of Work
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Create a comprehensive Statement of Work (SOW) that outlines the project's scope, specific deliverables, timeline, and key milestones.
                    </p>
                    <Button 
                      onClick={handleStartSOW} 
                      className="bg-[#0f566c] hover:bg-[#0d4a5d] px-6 py-3"
                    >
                      Start SOW
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarProvider>

      <AlertDialog open={showNoDesignDialog} onOpenChange={setShowNoDesignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No Design Plans</AlertDialogTitle>
            <AlertDialogDescription>
              There are no design plans for this project. Are you sure you want to proceed with creating the Statement of Work?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={startSOWCreation}>
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDashboard;
