import { useParams, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOWWizard } from "@/components/project/sow/SOWWizard";
import { useProjectData } from "@/hooks/useProjectData";
import { ProjectReviewForm } from "@/components/project/sow/ProjectReviewForm";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SOWReviewDialog from "@/components/project/sow/SOWReviewDialog";
import { useSOWNotifications } from "@/hooks/useSOWNotifications";

const ProjectSOW = () => {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get("view") === "true";
  const isReviewMode = searchParams.get("review") === "true";
  const navigate = useNavigate();

  // Initialize SOW notifications
  useSOWNotifications();

  const { projectData, propertyDetails, isLoading: projectLoading } = useProjectData(
    params.projectId,
    location.state
  );

  const [sowData, setSOWData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const { profile } = useAuth();

  // Fetch SOW data from statement_of_work table
  useEffect(() => {
    const fetchSOWData = async () => {
      if (!params.projectId) return;

      try {
        const { data, error } = await supabase
          .from('statement_of_work')
          .select('*')
          .eq('project_id', params.projectId)
          .maybeSingle();

        if (error) throw error;
        setSOWData(data);
        
        // If in review mode and status is "ready for review", show review dialog
        if (isReviewMode && data?.status === "ready for review") {
          setShowReviewDialog(true);
        }
      } catch (error) {
        console.error("Error fetching SOW data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSOWData();
  }, [params.projectId, profile, isReviewMode]);

  const projectTitle = projectData?.title || "Unknown Project";
  
  const handleReviewComplete = () => {
    // Refresh SOW data after review
    const fetchUpdatedSOW = async () => {
      if (!params.projectId) return;
      
      try {
        const { data, error } = await supabase
          .from('statement_of_work')
          .select('*')
          .eq('project_id', params.projectId)
          .maybeSingle();

        if (error) throw error;
        setSOWData(data);
      } catch (error) {
        console.error("Error fetching updated SOW data:", error);
      }
    };
    
    fetchUpdatedSOW();
  };

  // Function to render the SOW in view-only mode
  const renderSOWView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Statement of Work...</p>
          </div>
        </div>
      );
    }

    if (!sowData) {
      return (
        <div className="text-center py-10">
          <p>No Statement of Work found for this project.</p>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-6 py-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Statement of Work</h2>

        <ProjectReviewForm
          workAreas={sowData.work_areas || []}
          laborItems={sowData.labor_items || []}
          materialItems={sowData.material_items || []}
          bidConfiguration={sowData.bid_configuration || { bidDuration: '', projectDescription: '' }}
          projectId={params.projectId || ''}
          onSave={() => { }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
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

      <main className="flex-1 overflow-hidden">
        {isViewMode || isReviewMode ? renderSOWView() : <SOWWizard />}
      </main>
      
      {sowData && (
        <SOWReviewDialog 
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          projectId={params.projectId || ""}
          sowId={sowData.id}
          onActionComplete={handleReviewComplete}
        />
      )}
    </div>
  );
};

export default ProjectSOW;
