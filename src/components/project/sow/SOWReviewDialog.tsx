
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectData } from "@/hooks/useProjectData";
import { useActionItemsGenerator } from "@/hooks/useActionItemsGenerator";

interface SOWReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sowId: string;
  onActionComplete?: () => void;
}

const SOWReviewDialog = ({ 
  open, 
  onOpenChange,
  projectId,
  sowId,
  onActionComplete
}: SOWReviewDialogProps) => {
  const [activeTab, setActiveTab] = useState("review");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { generateActionItems } = useActionItemsGenerator();
  const { projectData } = useProjectData(projectId);
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('statement_of_work')
        .update({ 
          status: 'approved',
          feedback: null
        })
        .eq('id', sowId);
        
      if (error) throw error;
      
      toast.success("SOW has been approved successfully");
      
      // Generate action items to update the project state
      await generateActionItems(projectId);
      
      if (onActionComplete) {
        onActionComplete();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error approving SOW:", error);
      toast.error("Failed to approve SOW");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRequestRevisions = async () => {
    if (!feedback.trim()) {
      toast.error("Please provide feedback for the revision request");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('statement_of_work')
        .update({ 
          status: 'pending revision',
          feedback: feedback
        })
        .eq('id', sowId);
        
      if (error) throw error;
      
      toast.success("Revision request has been sent successfully");
      
      // Generate action items to update the project state
      await generateActionItems(projectId);
      
      if (onActionComplete) {
        onActionComplete();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error requesting revisions:", error);
      toast.error("Failed to request revisions");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Review Statement of Work
          </DialogTitle>
          <DialogDescription>
            Review the Statement of Work and either approve it or request revisions.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="review">Review & Approve</TabsTrigger>
            <TabsTrigger value="revisions">Request Revisions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="review" className="space-y-4">
            <div className="text-sm">
              <p>By approving this Statement of Work, you confirm that:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>The scope of work accurately reflects your project needs</li>
                <li>The materials and labor specifications are acceptable</li>
                <li>You're ready to move forward with this project scope</li>
              </ul>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Approving..." : "Approve SOW"}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="revisions" className="space-y-4">
            <div className="space-y-4">
              <Label htmlFor="feedback">
                Please provide detailed feedback on what changes are needed:
              </Label>
              <Textarea
                id="feedback"
                placeholder="Example: Please adjust the bathroom tile specifications and add details about electrical work in the kitchen..."
                rows={5}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Your feedback will be sent to the project coach who will update the SOW accordingly.
              </p>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRequestRevisions}
                disabled={isSubmitting || !feedback.trim()}
                variant="secondary"
              >
                {isSubmitting ? "Requesting..." : "Request Revisions"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SOWReviewDialog;
