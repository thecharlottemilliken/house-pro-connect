import React, { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ProjectData } from "@/hooks/useProjectData";
interface ActionItemsWidgetProps {
  projectId: string;
  projectData: ProjectData | null;
  isOwner: boolean;
  isCoach: boolean;
  className?: string;
}
interface SOWData {
  id: string;
  status: string;
  feedback?: string | null;
  created_at?: string;
}
interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  action?: () => void;
  buttonText?: string;
  completed?: boolean;
  date?: string;
}
const ActionItemsWidget = ({
  projectId,
  projectData,
  isOwner,
  isCoach,
  className
}: ActionItemsWidgetProps) => {
  const navigate = useNavigate();
  const {
    profile
  } = useAuth();
  const [sowData, setSowData] = useState<SOWData | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // Fetch SOW data
  useEffect(() => {
    const fetchSOW = async () => {
      setIsLoading(true);
      try {
        const {
          data,
          error
        } = await supabase.from("statement_of_work").select("id, status, feedback, created_at").eq("project_id", projectId).maybeSingle();
        if (error) throw error;
        if (data && typeof data === "object") {
          setSowData(data);
        } else {
          setSowData(null);
        }
      } catch (error) {
        console.error("Error fetching SOW:", error);
        setSowData(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) {
      fetchSOW();
    }
  }, [projectId]);

  // Build action items based on project state and SOW data
  useEffect(() => {
    const items: ActionItem[] = [];

    // Format date helper
    const formatRelativeDate = (dateString?: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "1 day ago";
      return `${diffDays} days ago`;
    };

    // If owner and SOW is pending review
    if (isOwner && sowData?.status === "pending") {
      items.push({
        id: "review-sow",
        title: "Review SOW",
        description: "Your project coach has completed an SOW for you to review",
        priority: "high",
        action: () => navigate(`/project-sow/${projectId}/review`),
        buttonText: "REVIEW",
        date: formatRelativeDate(sowData.created_at)
      });
    }

    // Coach sees revision task if SOW status is "pending revision"
    if (isCoach && sowData?.status === "pending revision") {
      items.push({
        id: "revise-sow",
        title: "Revise SOW",
        description: "The resident has requested revisions on the Statement of Work",
        priority: "high",
        action: () => navigate(`/project-sow/${projectId}`),
        buttonText: "REVIEW",
        date: formatRelativeDate(sowData.created_at)
      });
    }

    // SOW creation for coach
    if (isCoach && !sowData) {
      items.push({
        id: "create-sow",
        title: "Create SOW",
        description: "Draft a Statement of Work for this project",
        priority: "high",
        action: () => navigate(`/project-sow/${projectId}`),
        buttonText: "CREATE",
        date: "New"
      });
    }
    if (projectData) {
      const designPrefs = projectData.design_preferences || {};

      // Type casting to ensure we can access these properties
      const typedDesignPrefs = designPrefs as {
        beforePhotos?: Record<string, string[]>;
        roomMeasurements?: Record<string, any>;
      };

      // If before photos are missing
      const hasBeforePhotos = typedDesignPrefs.beforePhotos && Object.keys(typedDesignPrefs.beforePhotos || {}).length > 0;
      if (isOwner && !hasBeforePhotos) {
        items.push({
          id: "upload-photos",
          title: "Upload Before Photos",
          description: "Add photos of your current space",
          priority: "medium",
          action: () => navigate(`/project-design/${projectId}`),
          buttonText: "ADD",
          date: "Required"
        });
      }
    }

    // Add a sample milestone approval task
    if (items.length === 0 || isOwner && items.length < 2) {
      items.push({
        id: "approve-milestone",
        title: "Approve milestone",
        description: "Joe has marked milestone 1 for the tile job as complete",
        priority: "medium",
        action: () => console.log("View milestone"),
        buttonText: "REVIEW",
        date: "Today"
      });
    }
    setActionItems(items);
  }, [projectData, projectId, sowData, isOwner, isCoach, navigate]);
  const toggleItemCompletion = (itemId: string) => {
    setCompletedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };
  return <Card className={cn("overflow-hidden rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)] border-0", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6 px-6">
        <h2 className="text-lg font-semibold">Action Items</h2>
        <div className="text-orange-500 font-medium text-lg">
          {completedItems.length}/{actionItems.length}
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        {isLoading ? <div className="px-6 text-gray-400">Loading action items...</div> : <div className="divide-y">
            {actionItems.length > 0 ? actionItems.map(item => {
          const isCompleted = completedItems.includes(item.id);
          return <div key={item.id} className={cn("py-4 flex flex-col", isCompleted && "bg-gray-50")}>
                    <div className="flex items-start gap-3 mb-2 px-0">
                      <Checkbox id={`checkbox-${item.id}`} checked={isCompleted} onCheckedChange={() => toggleItemCompletion(item.id)} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <label htmlFor={`checkbox-${item.id}`} className="font-semibold text-md cursor-pointer">
                            {item.title}
                          </label>
                          <div className="text-gray-500 text-sm">
                            {item.date}
                          </div>
                        </div>
                        <p className="text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {item.action && <div className="flex justify-end mt-1 px-0">
                        <Button variant="ghost" className="font-semibold text-[#0f566c] hover:text-[#0f566c]/80 p-0 h-auto" onClick={item.action}>
                          {item.buttonText} <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>}
                  </div>;
        }) : <div className="px-6 py-8 text-center">
                <div className="bg-green-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-gray-600">All caught up! No pending action items.</p>
              </div>}
          </div>}
      </CardContent>
    </Card>;
};
export default ActionItemsWidget;