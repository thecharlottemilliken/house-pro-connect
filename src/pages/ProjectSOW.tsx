
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOWWizard } from "@/components/project/sow/SOWWizard";
import { useProjectData } from "@/hooks/useProjectData";
import { ProjectReviewForm } from "@/components/project/sow/ProjectReviewForm";

const ProjectSOW = () => {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get("view") === "true";
  
  const { projectData, isLoading } = useProjectData(
    params.projectId,
    location.state
  );
  
  const projectTitle = projectData?.title || "Unknown Project";

  // Function to render the SOW in view-only mode
  const renderSOWView = () => {
    if (!projectData || !projectData.sow_data) {
      return (
        <div className="text-center py-10">
          <p>No Statement of Work data found for this project.</p>
        </div>
      );
    }

    const sowData = projectData.sow_data as any;
    
    console.log("Viewing SOW data:", sowData);
    
    return (
      <div className="max-w-6xl mx-auto px-6 py-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Statement of Work</h2>
        
        <ProjectReviewForm
          workAreas={sowData.workAreas || []}
          laborItems={sowData.laborItems || []}
          materialItems={sowData.materialItems || []}
          bidConfiguration={sowData.bidConfiguration || { bidDuration: '', projectDescription: '' }}
          projectId={params.projectId || ''}
          onSave={() => {}}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="h-14 border-b flex items-center px-0 bg-white">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.history.back()}>
          <ChevronLeft className="h-4 w-4" />
          Back to Project
        </Button>
        <div className="flex-1 flex justify-center">
          <h1 className="text-sm font-medium">{projectTitle} - Statement of Work</h1>
        </div>
        <div className="w-[72px]" />
      </header>
      
      <main className="px-0 py-0">
        {isViewMode ? renderSOWView() : <SOWWizard />}
      </main>
    </div>
  );
};

export default ProjectSOW;
