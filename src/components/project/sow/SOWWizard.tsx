
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronRight, AlertCircle, ClipboardEdit } from "lucide-react";
import { useProjectData } from "@/hooks/useProjectData";
import { useSOWData } from "@/hooks/useSOWData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PreviewSidebar } from "./PreviewSidebar";
import { WorkAreaForm } from "./WorkAreaForm";
import { LaborRequirementsForm } from "./LaborRequirementsForm";
import { MaterialRequirementsForm } from "./MaterialRequirementsForm";
import { BidConfigurationForm } from "./BidConfigurationForm";
import { ProjectReviewForm } from "./ProjectReviewForm";
import { toast } from "@/hooks/use-toast";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { trackChanges, initializeChangeTracker, ChangeTracker, parseJsonField } from "./utils/revisionUtils";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { id: 'work-areas', title: 'Work Areas', description: 'Define specific areas requiring work' },
  { id: 'labor-needs', title: 'Labor Requirements', description: 'Specify required labor and expertise' },
  { id: 'materials', title: 'Materials', description: 'List required materials and specifications' },
  { id: 'bid-config', title: 'Bid Configuration', description: 'Set bidding parameters and overview' },
  { id: 'project-review', title: 'Project Review', description: 'Review project details and requirements' }
];

interface SOWWizardProps {
  isRevision?: boolean;
}

export function SOWWizard({ isRevision = false }: SOWWizardProps) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projectData, propertyDetails, isLoading: projectLoading } = useProjectData(projectId);
  const { sowData, isLoading: sowLoading, saveSOWField } = useSOWData(projectId);
  const [currentStep, setCurrentStep] = useState(0);
  const [originalSowData, setOriginalSowData] = useState<any>(null);
  const [changes, setChanges] = useState<ChangeTracker>(initializeChangeTracker());
  
  const isLoading = projectLoading || sowLoading;
  const isPendingRevision = sowData?.status === 'pending revision';

  // Fetch the original version for comparison if this is a revision
  useEffect(() => {
    const fetchOriginalSOW = async () => {
      if (!projectId || !isPendingRevision) return;

      try {
        // We're assuming you're storing historical SOW versions
        // If you don't have this feature yet, this would just use the current data
        // and highlight based on feedback instead
        const { data, error } = await supabase
          .from('statement_of_work')
          .select('*')
          .eq('project_id', projectId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Parse JSON fields
          const parsedData = {
            ...data,
            work_areas: parseJsonField(data.work_areas, []),
            labor_items: parseJsonField(data.labor_items, []),
            material_items: parseJsonField(data.material_items, []),
            bid_configuration: parseJsonField(data.bid_configuration, { bidDuration: '', projectDescription: '' }),
          };
          
          setOriginalSowData(parsedData);
          
          // Track changes between versions
          if (sowData) {
            const changesDetected = trackChanges(parsedData, sowData);
            setChanges(changesDetected);
          }
        }
      } catch (error) {
        console.error("Error fetching original SOW data:", error);
      }
    };
    
    fetchOriginalSOW();
  }, [projectId, isPendingRevision, sowData]);

  // Save work areas
  const handleWorkAreasSubmit = async (areas: any[]) => {
    console.log("Saving work areas:", areas);
    const success = await saveSOWField('work_areas', areas);
    
    if (success) {
      toast({
        title: "Saved",
        description: "Work Areas saved successfully."
      });
      setCurrentStep(current => current + 1);
    }
  };

  // Save labor items
  const handleLaborItemsSubmit = async (items: any[]) => {
    console.log("Saving labor items:", items);
    const success = await saveSOWField('labor_items', items);
    
    if (success) {
      toast({
        title: "Saved",
        description: "Labor Requirements saved successfully."
      });
      setCurrentStep(current => current + 1);
    }
  };
  
  // Save material items
  const handleMaterialItemsSubmit = async (items: any[]) => {
    console.log("Saving material items:", items);
    const success = await saveSOWField('material_items', items);
    
    if (success) {
      toast({
        title: "Saved",
        description: "Material Requirements saved successfully."
      });
      setCurrentStep(current => current + 1);
    }
  };
  
  // Save bid configuration
  const handleBidConfigSubmit = async (config: any) => {
    console.log("Saving bid configuration:", config);
    const success = await saveSOWField('bid_configuration', config);
    
    if (success) {
      toast({
        title: "Saved",
        description: "Bid Configuration saved successfully."
      });
      setCurrentStep(current => current + 1);
    }
  };

  // Submit the revised SOW
  const handleSubmitRevisions = async () => {
    if (!projectId || !sowData) return;
    
    try {
      const { error } = await supabase
        .from('statement_of_work')
        .update({
          status: 'ready for review',
        })
        .eq('id', sowData.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Revised SOW submitted for review."
      });
      
      // Navigate back to project dashboard
      navigate(`/project-dashboard/${projectId}`);
    } catch (error) {
      console.error("Error submitting revised SOW:", error);
      toast({
        title: "Error",
        description: "Failed to submit revised SOW.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderRevisionFeedbackAlert = () => {
    if (isPendingRevision && sowData?.feedback) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Revision Requested</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="font-medium mb-1">The resident has requested the following changes:</p>
            <p className="text-sm">{sowData.feedback}</p>
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  const renderStepContent = () => {
    if (!sowData) return null;
    
    // Ensure all form components receive properly typed props
    switch (currentStep) {
      case 0:
        return (
          <WorkAreaForm 
            onSave={handleWorkAreasSubmit}
            workAreas={sowData.work_areas || []}
            projectData={projectData}
            propertyDetails={propertyDetails}
            isRevision={isPendingRevision}
            changedWorkAreas={changes.workAreas}
          />
        );
      case 1:
        return (
          <LaborRequirementsForm 
            workAreas={sowData.work_areas || []} 
            onSave={handleLaborItemsSubmit}
            laborItems={sowData.labor_items || []}
            isRevision={isPendingRevision}
            changedLaborItems={changes.laborItems}
          />
        );
      case 2:
        return (
          <MaterialRequirementsForm
            workAreas={sowData.work_areas || []}
            onSave={handleMaterialItemsSubmit}
            materialItems={sowData.material_items || []}
            isRevision={isPendingRevision}
            changedMaterialItems={changes.materialItems}
          />
        );
      case 3:
        return (
          <BidConfigurationForm
            onSave={handleBidConfigSubmit}
            bidConfiguration={sowData.bid_configuration}
            isRevision={isPendingRevision}
            hasChanges={changes.bidConfiguration}
          />
        );
      case 4:
        return (
          <ProjectReviewForm
            workAreas={sowData.work_areas || []}
            laborItems={sowData.labor_items || []}
            materialItems={sowData.material_items || []}
            bidConfiguration={sowData.bid_configuration}
            projectId={projectId || ''}
            isRevision={isPendingRevision}
            onSave={(confirmed) => {
              if (confirmed) {
                if (isPendingRevision) {
                  handleSubmitRevisions();
                } else {
                  navigate(`/project-dashboard/${projectId}`);
                }
              }
            }}
            changes={changes}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-56px)]">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
        <PreviewSidebar projectData={projectData} propertyDetails={propertyDetails} />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={75} minSize={60}>
        <div className="overflow-auto h-full">
          <div className="px-6 py-6">
            <div className="max-w-6xl mx-auto">
              {renderRevisionFeedbackAlert()}
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {isPendingRevision ? 'Update Statement of Work' : 'Create Statement of Work'}
                      </h2>
                      {isPendingRevision && (
                        <Badge variant="outline" className="border-orange-500 text-orange-600 flex gap-1 items-center">
                          <ClipboardEdit className="h-3 w-3" /> Revision
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-500 mt-1">Step {currentStep + 1} of {steps.length}</p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {Math.round(progress)}% Complete
                  </Badge>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Card className="w-full">
                <CardHeader>
                  <CardTitle>{steps[currentStep].title}</CardTitle>
                  <CardDescription>{steps[currentStep].description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[400px]">
                    {renderStepContent()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
