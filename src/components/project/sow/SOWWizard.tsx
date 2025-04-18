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

const steps = [
  { id: 'project-review', title: 'Project Review', description: 'Review project details and requirements' },
  { id: 'work-areas', title: 'Work Areas', description: 'Define specific areas requiring work' },
  { id: 'labor-needs', title: 'Labor Requirements', description: 'Specify required labor and expertise' },
  { id: 'materials', title: 'Materials', description: 'List required materials and specifications' },
  { id: 'review', title: 'Final Review', description: 'Review and finalize SOW details' }
];

export function SOWWizard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projectData, propertyDetails, isLoading } = useProjectData(projectId);
  const [currentStep, setCurrentStep] = React.useState(0);

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

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <PreviewSidebar projectData={projectData} propertyDetails={propertyDetails} />
      
      <div className="flex-1 overflow-auto">
        <div className="px-0 py-0">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-0">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                    <CardDescription>Quick reference details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">Property</h3>
                      <p className="text-sm text-gray-500">{propertyDetails?.property_name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Address</h3>
                      <p className="text-sm text-gray-500">{propertyDetails?.address}</p>
                    </div>
                    {projectData?.renovation_areas && (
                      <div>
                        <h3 className="font-medium mb-1">Areas</h3>
                        <ul className="text-sm text-gray-500 space-y-1">
                          {projectData.renovation_areas.map((area: any, index: number) => (
                            <li key={index}>{area.area}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{steps[currentStep].title}</CardTitle>
                  <CardDescription>{steps[currentStep].description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[400px]">
                    <p className="text-gray-600">Step content for {steps[currentStep].title} will be implemented here.</p>
                  </div>
                  
                  <div className="flex justify-between mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(current => Math.max(0, current - 1))}
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (currentStep === steps.length - 1) {
                          navigate(`/project-dashboard/${projectId}`);
                        } else {
                          setCurrentStep(current => current + 1);
                        }
                      }}
                    >
                      {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                      {currentStep !== steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
