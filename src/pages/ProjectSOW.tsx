
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
import { useActionItemsGenerator } from "@/hooks/useActionItemsGenerator";
import { trackChanges, initializeChangeTracker, parseJsonField } from "@/components/project/sow/utils/revisionUtils";
import { toast } from "sonner";

const ProjectSOW = () => {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get("view") === "true";
  const isReviewMode = searchParams.get("review") === "true";
  const isRevised = searchParams.get("revised") === "true";
  const navigate = useNavigate();

  // Initialize SOW notifications
  useSOWNotifications();

  const { projectData, propertyDetails, isLoading: projectLoading } = useProjectData(
    params.projectId,
    location.state
  );

  const [sowData, setSOWData] = useState<any>(null);
  const [originalSowData, setOriginalSowData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [isRevision, setIsRevision] = useState(false);
  const [changes, setChanges] = useState(initializeChangeTracker());
  const [userRole, setUserRole] = useState<'owner' | 'coach' | 'pro' | ''>('');

  const { profile } = useAuth();
  const { generateActionItems, isGenerating } = useActionItemsGenerator();

  // Determine user role
  useEffect(() => {
    if (profile && projectData) {
      // Check if the current user is the property owner
      if (projectData.user_id === profile.id) {
        setUserRole('owner');
      } else if (profile.user_metadata?.role === 'coach') {
        setUserRole('coach');
      } else if (profile.user_metadata?.role === 'service_provider') {
        setUserRole('pro');
      } else {
        setUserRole('');
      }
      console.log('User role in SOW view:', userRole);
    }
  }, [profile, projectData]);

  // Fetch SOW data from statement_of_work table
  useEffect(() => {
    const fetchSOWData = async () => {
      if (!params.projectId) return;

      try {
        setIsLoading(true);
        
        const { data: currentVersion, error } = await supabase
          .from('statement_of_work')
          .select('*')
          .eq('project_id', params.projectId)
          .maybeSingle();

        if (error) throw error;
        
        if (currentVersion) {
          // Parse JSON fields for current version
          const parsedCurrentData = {
            ...currentVersion,
            work_areas: parseJsonField(currentVersion.work_areas, []),
            labor_items: parseJsonField(currentVersion.labor_items, []),
            material_items: parseJsonField(currentVersion.material_items, []),
            bid_configuration: parseJsonField(currentVersion.bid_configuration, { bidDuration: '', projectDescription: '' }),
          };
          
          setSOWData(parsedCurrentData);
          
          // Check if this is a revision based on the status and URL param
          const isRevisionCondition = (currentVersion.status === "ready for review" && isRevised) || 
                                      currentVersion.status === "pending revision";
          
          if (isRevisionCondition) {
            console.log("This is a revision. Fetching original version for comparison.");
            setIsRevision(true);
            
            try {
              // For revisions, fetch revision history to get the original version
              const { data: historyData, error: historyError } = await supabase
                .from('statement_of_work')
                .select('*')
                .eq('project_id', params.projectId)
                .order('updated_at', { ascending: false })
                .limit(10); // Get more records to increase chance of finding the right one
              
              if (historyError) throw historyError;
              
              if (historyData && historyData.length > 1) {
                console.log("SOW history data:", historyData.map(v => ({ 
                  id: v.id,
                  status: v.status,
                  updated_at: v.updated_at
                })));
                
                // Find the last version that was not "pending revision" or the current version
                const originalVersionIndex = historyData.findIndex((item, idx) => 
                  idx > 0 && // Not the current version (which is at index 0)
                  item.status !== 'pending revision' && // Not pending revision 
                  item.status !== currentVersion.status // Different status from current
                );
                
                if (originalVersionIndex !== -1) {
                  const originalData = historyData[originalVersionIndex];
                  
                  // Parse JSON fields for original version
                  const parsedOriginalData = {
                    ...originalData,
                    work_areas: parseJsonField(originalData.work_areas, []),
                    labor_items: parseJsonField(originalData.labor_items, []),
                    material_items: parseJsonField(originalData.material_items, []),
                    bid_configuration: parseJsonField(originalData.bid_configuration, { bidDuration: '', projectDescription: '' }),
                  };
                  
                  console.log("Found original version for comparison:", originalData.id);
                  setOriginalSowData(parsedOriginalData);
                  
                  // Track changes between the original and current version
                  const changesDetected = trackChanges(parsedOriginalData, parsedCurrentData);
                  setChanges(changesDetected);
                } else {
                  console.log("No suitable original version found for comparison");
                }
              } else {
                console.log("Insufficient history data for comparison");
              }
            } catch (error) {
              console.error("Failed to fetch revision history:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching SOW data:", error);
        toast.error("Failed to fetch Statement of Work data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSOWData();
  }, [params.projectId, profile, isRevised]);

  const projectTitle = projectData?.title || "Unknown Project";
  
  const handleReviewComplete = async () => {
    // Refresh SOW data after review
    if (!params.projectId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('statement_of_work')
        .select('*')
        .eq('project_id', params.projectId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const parsedData = {
          ...data,
          work_areas: parseJsonField(data.work_areas, []),
          labor_items: parseJsonField(data.labor_items, []),
          material_items: parseJsonField(data.material_items, []),
          bid_configuration: parseJsonField(data.bid_configuration, { bidDuration: '', projectDescription: '' }),
        };
        
        setSOWData(parsedData);
      }
      
      // Regenerate action items after review
      if (params.projectId) {
        console.log("Generating action items after SOW review");
        try {
          await generateActionItems(params.projectId);
        } catch (error) {
          console.error("Error generating action items:", error);
          // Continue even if action item generation fails
        }
      }
      
      setIsLoading(false);
      navigate(`/project-dashboard/${params.projectId}`);
      
    } catch (error) {
      console.error("Error fetching updated SOW data:", error);
      toast.error("Failed to refresh Statement of Work data");
      setIsLoading(false);
    }
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

    // Ensure SOW data is properly structured before rendering
    const safeWorkAreas = Array.isArray(sowData.work_areas) ? sowData.work_areas : [];
    const safeLaborItems = Array.isArray(sowData.labor_items) ? sowData.labor_items : [];
    const safeMaterialItems = Array.isArray(sowData.material_items) ? sowData.material_items : [];
    const safeBidConfig = typeof sowData.bid_configuration === 'object' && sowData.bid_configuration !== null
      ? sowData.bid_configuration
      : { bidDuration: '', projectDescription: '' };

    return (
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {isRevision ? "Revised Statement of Work" : "Statement of Work"}
          </h2>
          
          {isReviewMode && sowData?.status === 'ready for review' && userRole === 'owner' && (
            <Button onClick={() => setShowReviewDialog(true)}>
              Review & Approve
            </Button>
          )}
        </div>

        <ProjectReviewForm
          workAreas={safeWorkAreas}
          laborItems={safeLaborItems}
          materialItems={safeMaterialItems}
          bidConfiguration={safeBidConfig}
          projectId={params.projectId || ''}
          onSave={() => {}}
          isRevision={isRevision}
          changes={changes}
          userRole={userRole}
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
          <h1 className="text-sm font-medium">
            {projectTitle} - {isRevision ? "Revised Statement of Work" : "Statement of Work"}
          </h1>
        </div>
        <div className="w-[72px]" />
      </header>

      <main className="flex-1 overflow-hidden">
        {isViewMode || isReviewMode ? renderSOWView() : <SOWWizard isRevision={sowData?.status === 'pending revision'} />}
      </main>
      
      {sowData && (
        <SOWReviewDialog 
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          projectId={params.projectId || ""}
          sowId={sowData.id}
          onActionComplete={handleReviewComplete}
          isRevision={isRevision}
        />
      )}
    </div>
  );
};

export default ProjectSOW;
