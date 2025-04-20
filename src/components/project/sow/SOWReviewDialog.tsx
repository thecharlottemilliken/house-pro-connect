
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

