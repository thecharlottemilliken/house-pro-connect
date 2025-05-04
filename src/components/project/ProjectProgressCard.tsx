
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Pen, Wrench, Circle, CircleCheck } from "lucide-react";
import { useProjectData, RenovationArea, DesignPreferences } from "@/hooks/useProjectData";

interface ProjectProgressCardProps {
  projectId: string;
  className?: string;
}

type ProjectStage = "exploring" | "designing" | "planning" | "building" | "finalization";

interface StageDetails {
  name: string;
  icon: React.ReactNode;
  nextUpText: string;
}

const ProjectProgressCard = ({ projectId, className }: ProjectProgressCardProps) => {
  const { projectData, isLoading } = useProjectData(projectId);
  
  const determineStage = (): { stage: ProjectStage; progress: number } => {
    if (!projectData) return { stage: "exploring", progress: 10 };
    
    const designPrefs = projectData.design_preferences || { hasDesigns: false };
    const projectPrefs = projectData.project_preferences || {};
    const managementPrefs = projectData.management_preferences || {};
    
    // Check if project is in finalization stage (mock logic - would need integration with work blocks data)
    const allWorkBlocksComplete = false; // This would come from actual work block data
    if (allWorkBlocksComplete) return { stage: "finalization", progress: 100 };
    
    // Check if project is in building stage (mock logic - would need integration with work blocks data)
    const hasScheduledWorkBlocks = false; // This would come from actual work block data
    if (hasScheduledWorkBlocks) return { stage: "building", progress: 80 };
    
    // Check if project is in planning stage
    const hasDesigner = designPrefs.hasDesigns && designPrefs.designers && designPrefs.designers.length > 0;
    const hasUploadedDesigns = designPrefs.designAssets && designPrefs.designAssets.length > 0;
    
    // Type cast the JSON objects to access their properties safely
    const projectPrefsObj = projectPrefs as Record<string, any>;
    const managementPrefsObj = managementPrefs as Record<string, any>;
    
    const isReadyToStart = projectPrefsObj.isReadyToStart === true;
    const wantsManagement = managementPrefsObj.needsManagement === true;
    const hasSelectedTimeSlots = projectPrefsObj.selectedTimeSlots && projectPrefsObj.selectedTimeSlots.length > 0;
    
    if (hasDesigner && hasUploadedDesigns && isReadyToStart && wantsManagement) {
      return { stage: "planning", progress: 60 };
    }
    
    // Check if project is in designing stage
    if (hasDesigner) {
      return { stage: "designing", progress: 30 };
    }
    
    // Default to exploring
    return { stage: "exploring", progress: 10 };
  };
  
  const { stage, progress } = determineStage();
  
  const stages: Record<ProjectStage, StageDetails> = {
    exploring: {
      name: "Exploring",
      icon: <CircleCheck className="w-4 h-4" />,
      nextUpText: "A project coach will reach out for an initial consultation."
    },
    designing: {
      name: "Designing",
      icon: <CircleCheck className="w-4 h-4" />,
      nextUpText: "Work with your designer to finalize your renovation plans."
    },
    planning: {
      name: "Planning",
      icon: <Pen className="w-4 h-4" />,
      nextUpText: "Review and approve the Statement of Work (SOW)."
    },
    building: {
      name: "Building",
      icon: <Wrench className="w-4 h-4" />,
      nextUpText: "Monitor progress as contractors complete assigned work blocks."
    },
    finalization: {
      name: "Finalization",
      icon: <Check className="w-4 h-4" />,
      nextUpText: "Complete final walkthrough and sign off on completed work."
    }
  };
  
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="bg-[#f8f9fa] border-b p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Progress</h3>
            <div className="text-orange-500 font-medium animate-pulse">
              Loading...
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between py-4 px-4 bg-white border-b">
        <h3 className="text-lg font-semibold">Project Progress</h3>
        <div className="text-orange-500 font-medium">
          {progress}% Complete
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Progress Stages */}
        <div className="flex items-center justify-between mb-4 flex-wrap">
          {Object.entries(stages).map(([key, value], index, array) => {
            const stageKey = key as ProjectStage;
            const isActive = stageKey === stage;
            const isPast = index < Object.keys(stages).indexOf(stage);
            
            return (
              <React.Fragment key={stageKey}>
                <div className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-full transition-all",
                  isActive ? "bg-[#0e475d] text-white" : 
                  isPast ? "bg-[#0e475d] text-white" : 
                  "bg-white border border-gray-300 text-gray-600"
                )}>
                  <span className="mr-1">{value.icon}</span>
                  <span className="text-sm font-medium">{value.name}</span>
                </div>
                
                {/* Connector line */}
                {index < array.length - 1 && (
                  <div className={cn(
                    "h-[2px] w-3 md:w-6 hidden sm:block",
                    isPast || isActive ? "bg-[#0e475d]" : "bg-gray-300"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Next Up Section */}
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <div className="text-xs uppercase font-semibold text-gray-500 mb-1">NEXT UP:</div>
          <div className="text-sm text-gray-800">
            {stages[stage].nextUpText}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectProgressCard;
