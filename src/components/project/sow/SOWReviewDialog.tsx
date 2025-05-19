
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useActionItemsGenerator } from '@/hooks/useActionItemsGenerator';

interface SOWReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sowId: string;
  onActionComplete?: () => void;
}

const SOWReviewDialog: React.FC<SOWReviewDialogProps> = ({ 
  open, 
  onOpenChange, 
  projectId, 
  sowId,
  onActionComplete 
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { generateActionItems } = useActionItemsGenerator();

  const handleReviewNow = () => {
    navigate(`/project-sow/${projectId}/review`);
    onOpenChange(false);
  };

  const handleReviewLater = () => {
    onOpenChange(false);
  };

  const markActionItemAsComplete = async () => {
    setIsLoading(true);
    try {
      // Find the SOW review action item for this project
      const { data: actionItems } = await supabase
        .from('project_action_items')
        .select('id')
        .eq('project_id', projectId)
        .eq('title', 'Review Statement of Work')
        .maybeSingle();

      if (actionItems?.id) {
        // Mark it as completed
        await supabase
          .rpc('update_action_item_completion', { 
            item_id: actionItems.id, 
            is_completed: true 
          });
      }
      
      // Regenerate action items to update status
      await generateActionItems(projectId);
      
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error('Error updating action item:', error);
      toast({
        title: "Error",
        description: "Failed to update action item status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Statement of Work Ready for Review</DialogTitle>
          <DialogDescription>
            Your project's Statement of Work (SOW) is ready for your review. 
            This document outlines the scope of work, materials, and estimated costs for your project.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={handleReviewLater}
            disabled={isLoading}
          >
            Review Later
          </Button>
          <Button 
            onClick={() => {
              handleReviewNow();
              markActionItemAsComplete();
            }}
            disabled={isLoading}
          >
            Review Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SOWReviewDialog;
