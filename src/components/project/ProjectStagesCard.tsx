
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ProjectData } from "@/hooks/useProjectData";
import { cn } from "@/lib/utils";

interface ProjectStagesCardProps {
  projectData: ProjectData | null;
  className?: string;
}

interface Stage {
  name: string;
  label: string;
  description: string;
  complete: boolean;
  current: boolean;
}

export const ProjectStagesCard = ({ projectData, className }: ProjectStagesCardProps) => {
  // Logic to determine the current stage based on project data
  const determineCurrentStage = (): { stages: Stage[], currentStage: number, percentComplete: number } => {
    const stages: Stage[] = [
      {
        name: "exploring",
        label: "Exploring",
        description: "Initial project setup",
        complete: false,
        current: false
      },
      {
        name: "designing",
        label: "Designing",
        description: "Working with designer",
        complete: false,
        current: false
      },
      {
        name: "planning",
        label: "Planning",
        description: "Finalizing plans",
        complete: false,
        current: false
      },
      {
        name: "building",
        label: "Building",
        description: "Construction in progress",
        complete: false,
        current: false
      },
      {
        name: "finalization",
        label: "Finalization",
        description: "Final touches",
        complete: false,
        current: false
      }
    ];

    if (!projectData) {
      // Default to first stage if no project data
      stages[0].current = true;
      return { stages, currentStage: 0, percentComplete: 0 };
    }

    // Logic based on project data
    const designPrefs = projectData.design_preferences || {};
    // Type casting to ensure we can access these properties
    const typedDesignPrefs = designPrefs as {
      designers?: Array<{ id: string; businessName: string; }>;
      designAssets?: Array<{ name: string; url: string; }>;
      beforePhotos?: Record<string, string[]>;
      roomMeasurements?: Record<string, any>;
    };
    
    const hasDesigner = typedDesignPrefs.designers && typedDesignPrefs.designers.length > 0;
    const hasDesigns = typedDesignPrefs.designAssets && typedDesignPrefs.designAssets.length > 0;
    const projectPrefs = projectData.project_preferences as any || {};
    const isExploring = projectPrefs.project_status === "still_exploring";
    const isPlanning = projectPrefs.project_status === "is_planning" || projectPrefs.project_status === "ready_to_start";
    const wantsManagement = projectData.management_preferences && (projectData.management_preferences as any).wants_management === true;
    const hasTimeSlots = projectPrefs.selected_time_slots && projectPrefs.selected_time_slots.length > 0;
    const hasScheduledWork = false; // This would come from a work blocks API
    const allWorkComplete = false; // This would come from a work blocks API

    let currentStage = 0;

    // Determine stage based on conditions
    // Stage 1: Exploring (default)
    if (isExploring && !hasDesigner) {
      currentStage = 0;
    }
    // Stage 2: Designing
    else if (hasDesigner) {
      currentStage = 1;
      // Mark previous stages as complete
      stages[0].complete = true;
      
      // Stage 3: Planning
      if (hasDesigns && isPlanning && wantsManagement && hasTimeSlots) {
        currentStage = 2;
        stages[1].complete = true;
        
        // Stage 4: Building
        if (hasScheduledWork) {
          currentStage = 3;
          stages[2].complete = true;
          
          // Stage 5: Finalization
          if (allWorkComplete) {
            currentStage = 4;
            stages[3].complete = true;
          }
        }
      }
    }

    // Mark current stage
    stages[currentStage].current = true;
    
    // Calculate percent complete (20% per stage, plus partial for current stage)
    const percentComplete = Math.min(100, Math.floor((currentStage * 20) + 10));

    return { stages, currentStage, percentComplete };
  };

  const { stages, currentStage, percentComplete } = determineCurrentStage();

  const getNextStepText = () => {
    if (!projectData) return "Complete your project setup";
    
    switch (currentStage) {
      case 0:
        return "Find a designer to work with";
      case 1:
        return "Upload designs and select time slots";
      case 2:
        return "Schedule work blocks with contractors";
      case 3:
        return "Finish construction and review work";
      case 4:
        return "Project completed! Leave reviews for your team";
      default:
        return "Continue with your project";
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-[#f8f9fa] border-b p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Project Progress</h3>
          <span className="text-lg font-bold">{percentComplete}% Complete</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
          
          {/* Stages */}
          <div className="flex justify-between">
            {stages.map((stage, index) => (
              <div 
                key={stage.name} 
                className="flex flex-col items-center"
              >
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors",
                    stage.complete ? "bg-blue-600 text-white" : 
                    stage.current ? "bg-blue-100 border-2 border-blue-600 text-blue-600" : 
                    "bg-gray-100 text-gray-400"
                  )}
                >
                  {stage.complete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-1 font-medium",
                  stage.complete ? "text-blue-600" :
                  stage.current ? "text-blue-600" :
                  "text-gray-400"
                )}>
                  {stage.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* What's next */}
          <div className="bg-[#f0f7ff] p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-1">What's next:</h4>
            <p className="text-blue-700">{getNextStepText()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectStagesCard;
