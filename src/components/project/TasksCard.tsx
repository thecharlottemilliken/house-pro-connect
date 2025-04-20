import React, { useEffect, useState } from "react";
import { ArrowRight, FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface TasksCardProps {
  projectId: string;
  isOwner: boolean;
}

const TasksCard = ({ projectId, isOwner }: TasksCardProps) => {
  const [sowStatus, setSowStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSOW = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('statement_of_work')
          .select('status')
          .eq('project_id', projectId)
          .maybeSingle();
        if (error) throw error;
        setSowStatus(data?.status || null);
      } catch {
        setSowStatus(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) {
      fetchSOW();
    }
  }, [projectId]);

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
            {(isOwner && sowStatus === "pending") ? (
              <div className="bg-[#fff8eb] p-5 rounded-md mb-4">
                <h3 className="font-medium text-lg mb-2">Review SOW</h3>
                <p className="text-gray-700 mb-4">
                  A Statement of Work needs your review and approval before work can begin.
                </p>
                <div className="flex justify-end">
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 font-medium flex items-center gap-1"
                    size="sm"
                    onClick={() => window.location.href = `/project-sow/${projectId}?view=true`}
                  >
                    REVIEW SOW <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}

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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TasksCard;
