
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, FileText, Camera, Ruler, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectData } from "@/hooks/useProjectData";
import { useNavigate } from "react-router-dom";

interface ActionItemsCardProps {
  projectId: string;
  projectData: ProjectData | null;
  isOwner: boolean;
  isCoach: boolean;
  className?: string;
}

type ActionItem = {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: React.ReactNode;
  action?: () => void;
  buttonText?: string;
  completed?: boolean;
};

const ActionItemsCard = ({ 
  projectId, 
  projectData, 
  isOwner, 
  isCoach,
  className 
}: ActionItemsCardProps) => {
  const navigate = useNavigate();
  const [actionItems, setActionItems] = React.useState<ActionItem[]>([]);

  // Determine action items based on project state
  React.useEffect(() => {
    const items: ActionItem[] = [];

    // If we have project data, determine needed actions
    if (projectData) {
      const designPrefs = projectData.design_preferences || {};
      
      // SOW related actions
      if (isCoach) {
        items.push({
          id: "create-sow",
          title: "Create Statement of Work",
          description: "Draft a Statement of Work for this project",
          priority: "high",
          icon: <FileText className="h-5 w-5" />,
          action: () => navigate(`/project-sow/${projectId}`),
          buttonText: "Create SOW"
        });
      }
      
      // For project owner
      if (isOwner) {
        // If SOW is pending review (this would come from SOW data)
        const sowPendingReview = false; // This should come from API
        if (sowPendingReview) {
          items.push({
            id: "review-sow",
            title: "Review Statement of Work",
            description: "Your SOW needs review before work can begin",
            priority: "high",
            icon: <FileText className="h-5 w-5" />,
            action: () => navigate(`/project-sow/${projectId}/review`),
            buttonText: "Review SOW"
          });
        }
        
        // If before photos are missing
        const hasBeforePhotos = designPrefs.beforePhotos && 
          Object.keys(designPrefs.beforePhotos || {}).length > 0;
          
        if (!hasBeforePhotos) {
          items.push({
            id: "upload-photos",
            title: "Upload Before Photos",
            description: "Add photos of your current space",
            priority: "medium",
            icon: <Camera className="h-5 w-5" />,
            action: () => navigate(`/project-design/${projectId}`),
            buttonText: "Add Photos"
          });
        }
        
        // If room measurements are missing
        const hasRoomMeasurements = designPrefs.roomMeasurements && 
          Object.keys(designPrefs.roomMeasurements || {}).length > 0;
          
        if (!hasRoomMeasurements) {
          items.push({
            id: "add-measurements",
            title: "Add Room Measurements",
            description: "Provide accurate measurements for design planning",
            priority: "medium",
            icon: <Ruler className="h-5 w-5" />,
            action: () => navigate(`/project-design/${projectId}`),
            buttonText: "Add Measurements"
          });
        }
      }
      
      // General action item example
      if (items.length === 0) {
        items.push({
          id: "default-action",
          title: "Complete Your Project Setup",
          description: "Finish setting up your project details",
          priority: "medium",
          icon: <ListTodo className="h-5 w-5" />,
          action: () => navigate(`/project-design/${projectId}`),
          buttonText: "Continue Setup"
        });
      }
    }

    setActionItems(items);
  }, [projectData, projectId, isOwner, isCoach, navigate]);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "high": return "bg-orange-100 text-orange-700";
      case "medium": return "bg-blue-100 text-blue-700";
      case "low": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-[#f8f9fa] border-b p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Action Items</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">
              {actionItems.filter(item => item.completed).length}/{actionItems.length} Complete
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-blue-600 hover:text-blue-800 p-0"
              onClick={() => navigate(`/project-dashboard/${projectId}`)}
            >
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {actionItems.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50">
              <div className="flex gap-3">
                <div className={cn("p-2 rounded-lg flex-shrink-0", getPriorityColor(item.priority))}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  {item.action && (
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-sm"
                      onClick={item.action}
                    >
                      {item.buttonText || "Take Action"} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {actionItems.length === 0 && (
            <div className="p-8 text-center">
              <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-gray-600">All caught up! No pending action items.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionItemsCard;
