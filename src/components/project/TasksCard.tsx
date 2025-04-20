
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import SOWReviewDialog from "@/components/project/sow/SOWReviewDialog";
import { useAuth } from "@/contexts/AuthContext";

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
  const [showSOWDialog, setShowSOWDialog] = useState(false);

  const { profile } = useAuth();
  const userRole = profile?.role;

  // Fetch SOW data
  useEffect(() => {
    const fetchSOW = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("statement_of_work")
          .select("id, status, feedback")
          .eq("project_id", projectId)
          .maybeSingle();
        if (error) throw error;
        // Confirm data shape before setting state
        if (data && typeof data === "object") {
          setSowData(data);
        } else {
          setSowData(null);
        }
      } catch {
        setSowData(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) {
      fetchSOW();
    }
  }, [projectId]);

  // Callback to refresh SOW after action
  const refreshSOW = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("statement_of_work")
        .select("id, status, feedback")
        .eq("project_id", projectId)
        .maybeSingle();
      if (error) throw error;
      if (data && typeof data === "object") {
        setSowData(data);
      } else {
        setSowData(null);
      }
    } catch {
      setSowData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Conditional task card content
  let taskContent: React.ReactNode = null;

  // Owner sees Review SOW task if status is pending
  if (isOwner && sowData?.status === "pending") {
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
            onClick={() => setShowSOWDialog(true)}
          >
            REVIEW SOW <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        {sowData?.feedback && (
          <div className="mt-2 text-red-500 text-sm">
            Coach's notes: {sowData.feedback}
          </div>
        )}
        {/* SOW Review modal/dialog */}
        {sowData?.id && (
          <SOWReviewDialog
            open={showSOWDialog}
            onOpenChange={setShowSOWDialog}
            projectId={projectId}
            sowId={sowData.id}
            onActionComplete={refreshSOW}
          />
        )}
      </div>
    );
  }

  // Coach sees revision task if SOW status is "pending revision"
  if (
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
            onClick={() => window.location.href = `/project-sow/${projectId}`}
          >
            REVIEW & EDIT SOW <ArrowRight className="ml-1 h-4 w-4" />
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
        <Button variant="link" className="text-[#0f3a4d] p-0 font-medium">See All</Button>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isLoading ? (
          <div className="text-gray-400">Loading tasks...</div>
        ) : (
          <>
            {taskContent}
            {milestoneTask}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksCard;
