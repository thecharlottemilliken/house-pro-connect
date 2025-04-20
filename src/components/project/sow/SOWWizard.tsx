
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useProjectData } from "@/hooks/useProjectData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PreviewSidebar } from "./PreviewSidebar";
import { WorkAreaForm } from "./WorkAreaForm";
import { LaborRequirementsForm } from "./LaborRequirementsForm";
import { MaterialRequirementsForm } from "./MaterialRequirementsForm";
import { BidConfigurationForm } from "./BidConfigurationForm";
import { ProjectReviewForm } from "./ProjectReviewForm";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { id: 'work-areas', title: 'Work Areas', description: 'Define specific areas requiring work' },
  { id: 'labor-needs', title: 'Labor Requirements', description: 'Specify required labor and expertise' },
  { id: 'materials', title: 'Materials', description: 'List required materials and specifications' },
  { id: 'bid-config', title: 'Bid Configuration', description: 'Set bidding parameters and overview' },
  { id: 'project-review', title: 'Project Review', description: 'Review project details and requirements' }
];

// Helper to update sow_data after each step (partial patch)
async function saveSOWField(projectId: string, patch: Partial<any>) {
  const { error } = await supabase
    .from('projects')
    .update({ sow_data: patch })
    .eq('id', projectId);
  if (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to save SOW field:", error);
    toast({
      title: "Error",
      description: "Unable to save your changes to the database.",
      variant: "destructive"
    });
    return false;
  }
  return true;
}

export function SOWWizard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projectData, propertyDetails, isLoading } = useProjectData(projectId);
  const [currentStep, setCurrentStep] = React.useState(0);
  
  const [workAreas, setWorkAreas] = React.useState([]);
  const [laborItems, setLaborItems] = React.useState([]);
  const [materialItems, setMaterialItems] = React.useState([]);
  const [bidConfig, setBidConfig] = React.useState({
    bidDuration: '7',
    projectDescription: ''
  });

  React.useEffect(() => {
    if (projectData?.sow_data) {
      const sowData = projectData.sow_data as any;
      if (sowData.workAreas) setWorkAreas(sowData.workAreas);
      if (sowData.laborItems) setLaborItems(sowData.laborItems);
      if (sowData.materialItems) setMaterialItems(sowData.materialItems);
      if (sowData.bidConfiguration) setBidConfig(sowData.bidConfiguration);
    }
  }, [projectData]);

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

  const handleWorkAreasSubmit = async (areas: any[]) => {
    setWorkAreas(areas);
    setCurrentStep(current => current + 1);
    // (optional) consider patching workAreas after this step as well
    // await saveSOWField(projectId!, { ...projectData?.sow_data, workAreas: areas });
  };

  const handleLaborItemsSubmit = async (items: any[]) => {
    setLaborItems(items);
    // Persist laborItems to sow_data in the projects table
    if (projectId) {
      await saveSOWField(projectId, { ...projectData?.sow_data, laborItems: items, workAreas });
      toast({
        title: "Saved",
        description: "Labor Requirements saved successfully."
      });
    }
    setCurrentStep(current => current + 1);
  };
  const handleMaterialItemsSubmit = async (items: any[]) => {
    setMaterialItems(items);
    // Persist materialItems to sow_data in the projects table
    if (projectId) {
      await saveSOWField(projectId, { ...projectData?.sow_data, materialItems: items, laborItems, workAreas });
      toast({
        title: "Saved",
        description: "Material Requirements saved successfully."
      });
    }
    setCurrentStep(current => current + 1);
  };
  const handleBidConfigSubmit = async (config: any) => {
    setBidConfig(config);
    // It's optional to patch bidConfiguration here since final submit will always patch it
    setCurrentStep(current => current + 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <WorkAreaForm 
            onSave={handleWorkAreasSubmit}
            workAreas={workAreas}
          />
        );
      case 1:
        return (
          <LaborRequirementsForm 
            workAreas={workAreas} 
            onSave={handleLaborItemsSubmit}
            laborItems={laborItems}
          />
        );
      case 2:
        return (
          <MaterialRequirementsForm
            workAreas={workAreas}
            onSave={handleMaterialItemsSubmit}
            materialItems={materialItems}
          />
        );
      case 3:
        return (
          <BidConfigurationForm
            onSave={handleBidConfigSubmit}
            bidConfiguration={bidConfig}
          />
        );
      case 4:
        return (
          <ProjectReviewForm
            workAreas={workAreas}
            laborItems={laborItems}
            materialItems={materialItems}
            bidConfiguration={bidConfig}
            projectId={projectId || ''}
            onSave={(confirmed) => {
              if (confirmed) {
                navigate(`/project-dashboard/${projectId}`);
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <PreviewSidebar projectData={projectData} propertyDetails={propertyDetails} />
      
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Create Statement of Work</h2>
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
                
                {currentStep !== 0 && currentStep !== 4 && (
                  <div className="flex justify-between mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(current => Math.max(0, current - 1))}
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>
                    
                    <Button
                      onClick={() => setCurrentStep(current => current + 1)}
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
