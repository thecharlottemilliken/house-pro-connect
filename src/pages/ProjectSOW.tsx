
import { useParams, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOWWizard } from "@/components/project/sow/SOWWizard";
import { useProjectData } from "@/hooks/useProjectData";

const ProjectSOW = () => {
  const location = useLocation();
  const params = useParams();
  
  const { projectData } = useProjectData(
    params.projectId,
    location.state
  );
  
  const projectTitle = projectData?.title || "Unknown Project";

  return (
    <div className="min-h-screen bg-white">
      <header className="h-14 border-b flex items-center px-4 bg-white">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.history.back()}>
          <ChevronLeft className="h-4 w-4" />
          Back to Project
        </Button>
        <div className="flex-1 flex justify-center">
          <h1 className="text-sm font-medium">{projectTitle} - Statement of Work</h1>
        </div>
        <div className="w-[72px]" /> {/* Spacer to center the title */}
      </header>
      
      <main className="px-4 py-6">
        <SOWWizard />
      </main>
    </div>
  );
};

export default ProjectSOW;
