
import React, { useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, FileText, Camera, Ruler, ListTodo, PenBox, FilePen, FilePlus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectData } from "@/hooks/useProjectData";
import { useNavigate } from "react-router-dom";
import { useProjectActionItems, ActionItem } from "@/hooks/useProjectActionItems";
import { useActionItemsGenerator } from "@/hooks/useActionItemsGenerator";
import { useAuth } from "@/contexts/AuthContext";

interface ActionItemsWidgetProps {
  projectId: string;
  projectData: ProjectData | null;
  isOwner: boolean;
  isCoach: boolean;
  className?: string;
}

const ActionItemsWidget = ({ 
  projectId, 
  projectData, 
  isOwner, 
  isCoach,
  className 
}: ActionItemsWidgetProps) => {
  const navigate = useNavigate();
  const { actionItems, isLoading, markActionItemComplete } = useProjectActionItems(projectId);
  const { generateActionItems, isGenerating } = useActionItemsGenerator();
  const { profile } = useAuth();
  const userRole = profile?.role || '';

  // Generate action items when the component mounts, but only once
  useEffect(() => {
    if (projectId) {
      console.log("Checking if action items need to be generated for project:", projectId);
      // Only generate if there are no existing action items
      if (actionItems.length === 0 && !isLoading) {
        console.log("Generating action items for project:", projectId);
        generateActionItems(projectId).catch(err => 
          console.error("Failed to generate action items:", err)
        );
      }
    }
  }, [projectId, actionItems.length, isLoading, generateActionItems]);

  // Handle action click
  const handleActionClick = (item: ActionItem) => {
    // If the action is a navigation
    if (item.action_type === 'navigate' && item.action_data?.route) {
      navigate(item.action_data.route);
      return;
    }
    
    // If the action is SOW related
    if (item.action_type === 'sow' && item.action_data?.route) {
      navigate(item.action_data.route);
      return;
    }
    
    // For any other action types we might add in the future
    switch (item.action_type) {
      case 'modal':
        // Handle modal actions
        break;
      case 'function':
        // Handle function calls
        break;
      default:
        // Default action is to navigate to project dashboard
        navigate(`/project-dashboard/${projectId}`);
    }
  };
  
  // Function to get the appropriate icon component based on icon_name
  const getIconComponent = (iconName: string | null) => {
    switch (iconName) {
      case 'file-plus':
        return <FilePlus className="h-5 w-5" />;
      case 'file-pen':
        return <FilePen className="h-5 w-5" />;
      case 'camera':
        return <Camera className="h-5 w-5" />;
      case 'ruler':
        return <Ruler className="h-5 w-5" />;
      case 'pen-box':
        return <PenBox className="h-5 w-5" />;
      case 'file-text':
        return <FileText className="h-5 w-5" />;
      case 'clipboard-check':
        return <FileText className="h-5 w-5" />;
      default:
        return <ListTodo className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "high": return "bg-orange-100 text-orange-700";
      case "medium": return "bg-blue-100 text-blue-700";
      case "low": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Get button text based on action item title
  const getButtonText = (item: ActionItem) => {
    if (item.title === "Create Statement of Work (SOW)") {
      return "Create SOW";
    }
    if (item.title === "Update SOW with Revisions") {
      return "Update SOW";
    }
    if (item.title === "Review Statement of Work") {
      return "Review SOW";
    }
    return "Take Action";
  };

  // Filter action items based on user role and deduplicate by title
  const filteredActionItems = actionItems
    .filter(item => !item.for_role || item.for_role === userRole)
    .reduce((acc, current) => {
      const isDuplicate = acc.some(item => item.title === current.title);
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, [] as ActionItem[]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-[#f8f9fa] border-b p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Action Items</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">
              {filteredActionItems.filter(item => item.completed).length}/{filteredActionItems.length} Complete
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
          {(isLoading || isGenerating) ? (
            <div className="p-4 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading action items...</p>
            </div>
          ) : (
            <>
              {filteredActionItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex gap-3">
                    <div className={cn("p-2 rounded-lg flex-shrink-0", getPriorityColor(item.priority))}>
                      {getIconComponent(item.icon_name)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-sm"
                        onClick={() => handleActionClick(item)}
                      >
                        {getButtonText(item)}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredActionItems.length === 0 && !isLoading && !isGenerating && (
                <div className="p-8 text-center">
                  <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-gray-600">All caught up! No pending action items.</p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionItemsWidget;
