
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectParticipant {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ProjectParticipantsProps {
  projectId: string;
  onSelectParticipant: (participant: ProjectParticipant) => void;
}

const ProjectParticipants = ({ projectId, onSelectParticipant }: ProjectParticipantsProps) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<ProjectParticipant[]>([]);
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!projectId || !user) return;
      
      try {
        // Use the edge function to avoid recursion issues with RLS
        const { data: teamMembers, error } = await supabase.functions.invoke(
          'get-project-team-members',
          {
            body: { projectId }
          }
        );
          
        if (error) {
          console.error("Error fetching team members:", error);
          throw error;
        }

        if (teamMembers && Array.isArray(teamMembers)) {
          // Format the participants data and exclude current user
          const formattedParticipants = teamMembers
            .filter(member => member.user_id !== user.id) // Exclude current user
            .map(member => ({
              id: member.user_id,
              name: member.name || 'Unknown User',
              email: member.email || '',
              role: member.role
            }));

          setParticipants(formattedParticipants);
          console.log('Participants found:', formattedParticipants);
        } else {
          setParticipants([]);
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
        
        // Fallback to direct query as last resort
        try {
          const { data: directMembers, error: directError } = await supabase
            .from('project_team_members')
            .select('id, user_id, name, email, role')
            .eq('project_id', projectId)
            .neq('user_id', user.id);
            
          if (directError) throw directError;
          
          if (directMembers) {
            const formattedParticipants = directMembers.map(member => ({
              id: member.user_id,
              name: member.name || 'Unknown User',
              email: member.email || '',
              role: member.role
            }));
            
            setParticipants(formattedParticipants);
          }
        } catch (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
          setParticipants([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [projectId, user]);

  if (loading) {
    return <div className="p-4">Loading participants...</div>;
  }

  if (participants.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No other team members found in this project.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-1">
        {participants.map((participant) => (
          <button
            key={participant.id}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-100 transition-colors rounded-lg cursor-pointer"
            onClick={() => onSelectParticipant(participant)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${participant.name}`} alt={participant.name} />
              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="font-medium">{participant.name}</div>
              <div className="text-sm text-gray-500 capitalize">{participant.role}</div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ProjectParticipants;
