
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useProjectData } from "@/hooks/useProjectData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

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
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create Statement of Work</h2>
        <p className="text-gray-500">Step {currentStep + 1} of {steps.length}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar for project info */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Quick reference details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Property</h3>
                <p className="text-sm text-gray-500">{propertyDetails?.property_name}</p>
              </div>
              <div>
                <h3 className="font-medium">Address</h3>
                <p className="text-sm text-gray-500">{propertyDetails?.address}</p>
              </div>
              {projectData?.renovation_areas && (
                <div>
                  <h3 className="font-medium">Areas</h3>
                  <ul className="text-sm text-gray-500">
                    {projectData.renovation_areas.map((area: any, index: number) => (
                      <li key={index}>{area.area}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main content area */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px]">
              {/* Content will be implemented in subsequent steps */}
              <p>Step content for {steps[currentStep].title} will be implemented here.</p>
            </div>
            
            <div className="flex justify-between mt-6">
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
                    // Handle completion
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
  );
}
