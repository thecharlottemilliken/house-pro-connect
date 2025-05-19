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
import { useSOWData } from "@/hooks/useSOWData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PreviewSidebar } from "./PreviewSidebar";
import { WorkAreaForm } from "./WorkAreaForm";
import { LaborRequirementsForm } from "./LaborRequirementsForm";
import { MaterialRequirementsForm } from "./MaterialRequirementsForm";
import { BidConfigurationForm } from "./BidConfigurationForm";
import { ProjectReviewForm } from "./ProjectReviewForm";
import { toast } from "@/hooks/use-toast";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const steps = [
  { id: 'work-areas', title: 'Work Areas', description: 'Define specific areas requiring work' },
  { id: 'labor-needs', title: 'Labor Requirements', description: 'Specify required labor and expertise' },
  { id: 'materials', title: 'Materials', description: 'List required materials and specifications' },
  { id: 'bid-config', title: 'Bid Configuration', description: 'Set bidding parameters and overview' },
  { id: 'project-review', title: 'Project Review', description: 'Review project details and requirements' }
];

export function SOWWizard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projectData, propertyDetails, isLoading: projectLoading } = useProjectData(projectId);
  const { sowData, isLoading: sowLoading, saveSOWField } = useSOWData(projectId);
  const [currentStep, setCurrentStep] = React.useState(0);
  
  const isLoading = projectLoading || sowLoading;

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

  const renderStepContent = () => {
    if (!sowData) return null;
    
    switch (currentStep) {
      case 0:
        return (
          <WorkAreaForm 
            onSave={handleWorkAreasSubmit}
            workAreas={sowData.work_areas || []}
            projectData={projectData}
            propertyDetails={propertyDetails}
          />
        );
      case 1:
        return (
          <LaborRequirementsForm 
            workAreas={sowData.work_areas || []} 
            onSave={handleLaborItemsSubmit}
            laborItems={sowData.labor_items || []}
          />
        );
      case 2:
        return (
          <MaterialRequirementsForm
            workAreas={sowData.work_areas || []}
            onSave={handleMaterialItemsSubmit}
            materialItems={sowData.material_items || []}
          />
        );
      case 3:
        return (
          <BidConfigurationForm
            onSave={handleBidConfigSubmit}
            bidConfiguration={sowData.bid_configuration}
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
    <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-56px)]">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
        <PreviewSidebar projectData={projectData} propertyDetails={propertyDetails} />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={75} minSize={60}>
        <div className="overflow-auto h-full">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
