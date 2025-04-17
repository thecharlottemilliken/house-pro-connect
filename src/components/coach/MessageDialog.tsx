
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Project {
  id: string;
  title: string;
  owner: {
    id: string;
    name: string;
  };
}

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

const MessageDialog = ({ open, onOpenChange, project }: MessageDialogProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { user, profile } = useAuth();

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !profile) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('coach_messages')
        .insert({
          coach_id: user.id,
          resident_id: project.owner.id,
          project_id: project.id,
          message: message.trim()
        });
      
      if (error) throw error;
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
      
      setMessage("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Message Resident</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Project</p>
            <p className="text-sm">{project.title}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Resident</p>
            <p className="text-sm">{project.owner.name}</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={!message.trim() || isSending}
          >
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
