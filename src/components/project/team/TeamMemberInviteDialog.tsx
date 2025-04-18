
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addTeamMember } from "@/utils/team";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface TeamMemberInviteDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TeamMemberInviteDialog = ({ projectId, isOpen, onClose }: TeamMemberInviteDialogProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("team_member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const roleOptions = [
    { value: "team_member", label: "Team Member" },
    { value: "contractor", label: "Contractor" },
    { value: "designer", label: "Designer" },
    { value: "architect", label: "Architect" },
    { value: "consultant", label: "Consultant" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await addTeamMember(projectId, email, role, name || undefined);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Team member invited successfully"
        });
        
        // Invalidate team members query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["teamMembers", projectId] });
        
        // Reset form and close dialog
        setEmail("");
        setName("");
        setRole("team_member");
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to invite team member",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error inviting team member:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Add a new member to your project team. They will receive an email notification.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Team Member Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#0f566c] hover:bg-[#0d4a5d]" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Inviting..." : "Invite Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberInviteDialog;
