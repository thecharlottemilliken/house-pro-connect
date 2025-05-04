
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SOWReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sowId: string;
  onActionComplete: () => void;
}

const SOWReviewDialog: React.FC<SOWReviewDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  sowId,
  onActionComplete,
}) => {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleApprove = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("statement_of_work")
      .update({ status: "approved", feedback: null })
      .eq("id", sowId);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve SOW.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "SOW Approved",
        description: "Statement of Work successfully approved.",
      });
      
      // Create a notification record (if you have a notifications table)
      // In a real implementation, you would create this table
      try {
        // Get project details
        const { data: projectData } = await supabase
          .from("projects")
          .select("title, user_id")
          .eq("id", projectId)
          .single();
          
        if (projectData) {
          // Get the coach(es) assigned to this project
          const { data: coachData } = await supabase
            .from("project_team_members")
            .select("user_id")
            .eq("project_id", projectId)
            .eq("role", "coach");
            
          if (coachData && coachData.length > 0) {
            // In a real implementation, create notifications for each coach
            /*
            for (const coach of coachData) {
              await supabase
                .from("notifications")
                .insert({
                  recipient_id: coach.user_id,
                  type: "sow_approved",
                  title: `${user?.email} has approved the ${projectData.title} SOW.`,
                  content: "Next, publish the project for bidding.",
                  related_id: sowId,
                  project_id: projectId,
                  sender_id: user?.id,
                  read: false,
                  created_at: new Date().toISOString()
                });
            }
            */
          }
        }
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
      
      onOpenChange(false);
      onActionComplete();
    }
  };

  const handleReject = async () => {
    if (!feedback) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback for the coach.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("statement_of_work")
      .update({ status: "pending revision", feedback })
      .eq("id", sowId);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to request SOW revisions.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Revision Requested",
        description: "Coach will be notified to address feedback.",
      });
      
      // Create a notification record (if you have a notifications table)
      try {
        // Get project details
        const { data: projectData } = await supabase
          .from("projects")
          .select("title, user_id")
          .eq("id", projectId)
          .single();
          
        if (projectData) {
          // Get the coach(es) assigned to this project
          const { data: coachData } = await supabase
            .from("project_team_members")
            .select("user_id")
            .eq("project_id", projectId)
            .eq("role", "coach");
            
          if (coachData && coachData.length > 0) {
            // In a real implementation, create notifications for each coach
            /*
            for (const coach of coachData) {
              await supabase
                .from("notifications")
                .insert({
                  recipient_id: coach.user_id,
                  type: "sow_revision",
                  title: `${user?.email} has requested changes to the ${projectData.title} SOW.`,
                  content: feedback,
                  related_id: sowId,
                  project_id: projectId,
                  sender_id: user?.id,
                  read: false,
                  created_at: new Date().toISOString()
                });
            }
            */
          }
        }
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
      
      onOpenChange(false);
      setFeedback("");
      onActionComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Statement of Work</DialogTitle>
          <DialogDescription>
            Review the SOW below. Approve if everything looks good or reject and provide feedback if revisions are needed.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <Textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="If requesting changes, provide your feedback to the coach here."
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReject} disabled={loading}>
            Request Changes
          </Button>
          <Button onClick={handleApprove} disabled={loading}>
            Approve SOW
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SOWReviewDialog;
