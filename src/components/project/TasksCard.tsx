
import React, { useEffect, useState } from "react";
import { ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useActionItemsGenerator } from "@/hooks/useActionItemsGenerator";

interface TasksCardProps {
  projectId: string;
  isOwner: boolean;
}

interface SOWData {
  id: string;
  status: string;
  feedback?: string | null;
}

const TasksCard = ({ projectId, isOwner }: TasksCardProps) => {
  const [sowData, setSowData] = useState<SOWData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const userRole = profile?.role;
  const navigate = useNavigate();
  const { generateActionItems, isGenerating, hasErrored, resetErrorState } = useActionItemsGenerator();
  const [loadError, setLoadError] = useState<Error | null>(null);

  // Fetch SOW data and set up real-time subscription
  useEffect(() => {
    if (!projectId) return;
    
    const fetchSOW = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        console.log("Fetching SOW data for project:", projectId);
        
        const { data, error } = await supabase
          .from("statement_of_work")
          .select("id, status, feedback")
          .eq("project_id", projectId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data && typeof data === "object") {
          setSowData(data);
          
          // Ensure action items are current when SOW status changes
          if (!hasErrored) {
            await generateActionItems(projectId);
          }
        } else {
          setSowData(null);
        }
      } catch (err) {
        console.error("Error fetching SOW data:", err);
        setSowData(null);
        setLoadError(err instanceof Error ? err : new Error('Unknown error fetching SOW'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSOW();
    
    // Set up real-time subscription for SOW changes
    const channel = supabase
      .channel('sow_changes')
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'statement_of_work',
          filter: `project_id=eq.${projectId}`
        }, 
        (payload) => {
          console.log("SOW change detected:", payload);
          
          const updatedSow = payload.new as SOWData;
          setSowData(updatedSow);
          
          // Regenerate action items when SOW status changes, but only if we haven't had errors
          if (!hasErrored) {
            generateActionItems(projectId);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, generateActionItems, hasErrored]);

  // Callback to refresh SOW after action
  const handleRefresh = async () => {
    if (isLoading || isGenerating) return;
    
    setIsLoading(true);
    setLoadError(null);
    resetErrorState();
    
    try {
      const { data, error } = await supabase
        .from("statement_of_work")
        .select("id, status, feedback")
        .eq("project_id", projectId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data && typeof data === "object") {
        setSowData(data);
        
        // Regenerate action items
        await generateActionItems(projectId);
      } else {
        setSowData(null);
      }
    } catch (err) {
      console.error("Error refreshing SOW data:", err);
      setSowData(null);
      setLoadError(err instanceof Error ? err : new Error('Unknown error refreshing SOW'));
    } finally {
      setIsLoading(false);
    }
  };

  // Conditional task card content
  let taskContent: React.ReactNode = null;

  // Show error state if needed
  if (loadError || hasErrored) {
    taskContent = (
      <div className="bg-red-50 border-l-4 border-red-400 p-5 rounded-md mb-4">
        <div className="flex items-center mb-3">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="font-medium text-lg text-red-700">Error Loading Tasks</h3>
        </div>
        <p className="text-red-600 mb-3">
          {loadError?.message || "Unable to load task information"}
        </p>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isGenerating}
            className="flex items-center"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            {isLoading || isGenerating ? "Refreshing..." : "Try Again"}
          </Button>
        </div>
      </div>
    );
  }
  // Owner sees Review SOW task if status is ready for review
  else if (isOwner && sowData?.status === "ready for review") {
    taskContent = (
      <div className="bg-[#fff8eb] p-5 rounded-md mb-4">
        <h3 className="font-medium text-lg mb-2">Review SOW</h3>
        <p className="text-gray-700 mb-4">
          A Statement of Work needs your review and approval before work can begin.
        </p>
        <div className="flex justify-end">
          <Button
            className="bg-orange-500 hover:bg-orange-600 font-medium flex items-center gap-1"
            size="sm"
            onClick={() =>
              navigate(`/project-sow/${projectId}?review=true`)
            }
          >
            REVIEW SOW <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        {sowData?.feedback && (
          <div className="mt-2 text-red-500 text-sm">
            Coach's notes: {sowData.feedback}
          </div>
        )}
      </div>
    );
  }

  // Coach sees revision task if SOW status is "pending revision"
  else if (
    userRole === "coach" &&
    sowData?.status === "pending revision"
  ) {
    taskContent = (
      <div className="bg-orange-50 border-l-4 border-orange-400 p-5 rounded-md mb-4">
        <h3 className="font-medium text-lg mb-2">Revisions Requested</h3>
        <p className="text-gray-700 mb-3">
          The resident has requested revisions on the Statement of Work. Please review their feedback and update the SOW for further review.
        </p>
        {sowData?.feedback && (
          <div className="mb-3 text-orange-600">
            <strong>Resident's feedback:</strong><br />
            {sowData.feedback}
          </div>
        )}
        <div className="flex justify-end">
          <Button
            className="bg-orange-500 hover:bg-orange-600 font-medium flex items-center gap-1"
            size="sm"
            onClick={() => navigate(`/project-sow/${projectId}`)}
          >
            REVIEW & EDIT SOW <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Coach sees Create SOW task if no SOW exists or it's in draft state
  else if (
    userRole === "coach" &&
    (!sowData || sowData.status === "draft")
  ) {
    taskContent = (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-md mb-4">
        <h3 className="font-medium text-lg mb-2">Create Statement of Work</h3>
        <p className="text-gray-700 mb-3">
          This project needs a Statement of Work (SOW) to outline scope, materials, and costs.
        </p>
        <div className="flex justify-end">
          <Button
            className="bg-blue-600 hover:bg-blue-700 font-medium flex items-center gap-1"
            size="sm"
            onClick={() => navigate(`/project-sow/${projectId}`)}
          >
            CREATE SOW <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // SOW Approved task for owner
  else if (isOwner && sowData?.status === "approved") {
    taskContent = (
      <div className="bg-green-50 border-l-4 border-green-400 p-5 rounded-md mb-4">
        <h3 className="font-medium text-lg mb-2">SOW Approved</h3>
        <p className="text-gray-700 mb-3">
          You've approved the Statement of Work. The project can now proceed to the next phase.
        </p>
        <div className="flex justify-end">
          <Button
            className="bg-green-600 hover:bg-green-700 font-medium flex items-center gap-1"
            size="sm"
            onClick={() => navigate(`/project-sow/${projectId}?view=true`)}
          >
            VIEW SOW <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Default milestone approval placeholder task (can flesh out in future)
  const milestoneTask = (
    <div className="bg-[#e9f2f6] p-5 rounded-md">
      <h3 className="font-medium text-lg mb-2">Approve milestone 1 completion</h3>
      <p className="text-gray-700 mb-4">
        Joe has marked milestone 1 for the tile job as complete. Please confirm for the
        work to continue.
      </p>
      <div className="flex justify-end">
        <Button
          className="bg-[#0f3a4d] hover:bg-[#0f3a4d]/90 font-medium flex items-center gap-1"
          size="sm"
        >
          VIEW MILESTONE <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)] border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6 px-6">
        <h2 className="text-2xl font-semibold">Your Tasks</h2>
        <Button 
          variant="link" 
          className="text-[#0f3a4d] p-0 font-medium"
          onClick={handleRefresh}
          disabled={isLoading || isGenerating}
        >
          {isLoading || isGenerating ? (
            <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isLoading || isGenerating ? (
          <div className="text-center py-6">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-500">{isLoading ? "Loading tasks..." : "Refreshing tasks..."}</p>
          </div>
        ) : (
          <>
            {taskContent}
            {!taskContent && sowData?.status === "approved" ? (
              <div className="bg-green-50 p-5 rounded-md mb-4 text-center">
                <p className="text-gray-700">
                  SOW has been approved. The project is ready for the next phase!
                </p>
              </div>
            ) : null}
            {milestoneTask}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default TasksCard;
