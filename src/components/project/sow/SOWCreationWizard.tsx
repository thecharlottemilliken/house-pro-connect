
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectData, PropertyDetails } from "@/hooks/useProjectData";
import DefineWorkAreas from "./steps/DefineWorkAreas";
import SpecifyLabor from "./steps/SpecifyLabor";
import SpecifyMaterials from "./steps/SpecifyMaterials";
import ReviewSOW from "./steps/ReviewSOW";
import { SOWProvider } from "@/components/project/sow/SOWContext";
import ResourcesSidebar from "./ResourcesSidebar";

interface SOWCreationWizardProps {
  projectId: string;
  projectData: ProjectData | null;
  propertyDetails: PropertyDetails;
}

const steps = [
  { id: "work-areas", label: "Work Areas" },
  { id: "labor", label: "Labor" },
  { id: "materials", label: "Materials" },
  { id: "review", label: "Review" }
];

const SOWCreationWizard: React.FC<SOWCreationWizardProps> = ({
  projectId,
  projectData,
  propertyDetails
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<string>("work-areas");
  const [isResourcesSidebarOpen, setIsResourcesSidebarOpen] = useState(true);

  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const handleFinish = () => {
    // Save SOW and navigate back to project dashboard
    navigate(`/project-dashboard/${projectId}`);
  };

  return (
    <SOWProvider projectId={projectId}>
      <div className="flex flex-col lg:flex-row">
        <div className={`flex-1 ${isResourcesSidebarOpen ? 'lg:mr-4' : ''}`}>
          <div className="border-b border-gray-200 bg-white p-4 sticky top-0 z-10">
            <div className="hidden sm:flex items-center justify-between">
              <ol className="flex items-center w-full">
                {steps.map((step, index) => (
                  <li 
                    key={step.id} 
                    className={`flex items-center ${
                      index < steps.length - 1 ? 'w-full' : ''
                    }`}
                  >
                    <div
                      className={`flex flex-col items-center ${
                        currentStep === step.id ? 'text-blue-600' : 
                        steps.findIndex(s => s.id === currentStep) > index ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      <div 
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          currentStep === step.id ? 'border-blue-600 bg-blue-100' : 
                          steps.findIndex(s => s.id === currentStep) > index ? 'border-green-600 bg-green-100' : 'border-gray-300 bg-white'
                        }`}
                      >
                        {steps.findIndex(s => s.id === currentStep) > index ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className="text-xs mt-1">{step.label}</span>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div 
                        className={`flex-1 h-0.5 mx-2 ${
                          steps.findIndex(s => s.id === currentStep) > index ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      ></div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          
            <div className="sm:hidden">
              <Tabs value={currentStep} onValueChange={setCurrentStep}>
                <TabsList className="grid grid-cols-4">
                  {steps.map((step) => (
                    <TabsTrigger key={step.id} value={step.id}>
                      {step.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <CardContent className="p-4 md:p-6">
            <TabsContent value="work-areas" className={currentStep === "work-areas" ? "block" : "hidden"}>
              <DefineWorkAreas 
                projectData={projectData}
                propertyDetails={propertyDetails}
              />
            </TabsContent>

            <TabsContent value="labor" className={currentStep === "labor" ? "block" : "hidden"}>
              <SpecifyLabor />
            </TabsContent>

            <TabsContent value="materials" className={currentStep === "materials" ? "block" : "hidden"}>
              <SpecifyMaterials />
            </TabsContent>

            <TabsContent value="review" className={currentStep === "review" ? "block" : "hidden"}>
              <ReviewSOW
                projectData={projectData}
                propertyDetails={propertyDetails}
              />
            </TabsContent>

            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === "work-areas"}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              {currentStep === "review" ? (
                <Button onClick={handleFinish} className="flex items-center gap-2 bg-[#0f566c]">
                  Finalize SOW <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex items-center gap-2 bg-[#0f566c]">
                  Next Step <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </div>

        <ResourcesSidebar 
          isOpen={isResourcesSidebarOpen}
          onToggle={() => setIsResourcesSidebarOpen(!isResourcesSidebarOpen)}
          propertyDetails={propertyDetails}
          projectData={projectData}
        />
      </div>
    </SOWProvider>
  );
};

export default SOWCreationWizard;
