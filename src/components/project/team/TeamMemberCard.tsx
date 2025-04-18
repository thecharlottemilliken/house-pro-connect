
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Phone, CreditCard, MoreVertical, Trash2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { removeTeamMember } from "@/utils/team";
import { useQueryClient } from "@tanstack/react-query";

interface TeamMemberProps {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  isCurrentUser?: boolean;
  isOwner?: boolean;
  projectId: string;
}

const TeamMemberCard = ({ 
  id, 
  name, 
  email, 
  role, 
  avatarUrl,
  isCurrentUser = false,
  isOwner = false,
  projectId
}: TeamMemberProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleRemove = async () => {
    if (isOwner) {
      toast({
        title: "Cannot Remove Owner",
        description: "The project owner cannot be removed from the team.",
        variant: "destructive"
      });
      return;
    }

    if (isCurrentUser) {
      toast({
        title: "Cannot Remove Yourself",
        description: "You cannot remove yourself from the team.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Are you sure you want to remove ${name} from this project?`)) {
      setIsDeleting(true);
      
      try {
        const result = await removeTeamMember(id);
        
        if (result.success) {
          toast({
            title: "Team Member Removed",
            description: `${name} has been removed from the project.`
          });
          
          // Refresh the team members list
          queryClient.invalidateQueries({ queryKey: ["teamMembers", projectId] });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to remove team member.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error removing team member:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive"
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getRoleBadgeClass = () => {
    switch(role.toLowerCase()) {
      case 'owner':
        return "bg-blue-100 text-blue-800";
      case 'contractor':
        return "bg-green-100 text-green-800";
      case 'designer':
        return "bg-purple-100 text-purple-800";
      case 'architect':
        return "bg-amber-100 text-amber-800";
      case 'consultant':
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');

  return (
    <Card className="border border-gray-200 rounded-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Avatar className="h-12 w-12 mr-3">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg text-gray-900">{name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass()}`}>
                  {roleDisplay}
                </span>
              </div>
            </div>
            {!isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleRemove}
                    disabled={isDeleting || isOwner}
                    className="text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="text-sm text-gray-700">{email}</div>
        </div>

        <div className="flex border-t border-gray-200">
          <button className="flex-1 py-3 flex justify-center items-center text-gray-600 hover:bg-gray-50">
            <MessageSquare className="h-5 w-5" />
          </button>
          <div className="border-r border-gray-200"></div>
          <button className="flex-1 py-3 flex justify-center items-center text-gray-600 hover:bg-gray-50">
            <Phone className="h-5 w-5" />
          </button>
          <div className="border-r border-gray-200"></div>
          <button className="flex-1 py-3 flex justify-center items-center text-gray-600 hover:bg-gray-50">
            <CreditCard className="h-5 w-5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;
