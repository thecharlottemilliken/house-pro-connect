
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!projectId || !user) return;
      
      try {
        // First, get the project details to get the owner's ID
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('user_id')
          .eq('id', projectId)
          .single();
          
        if (projectError) throw projectError;

        // Then fetch profiles of project participants based on user's role
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email, role')
          .in('role', ['resident', 'coach'])
          .or(`id.eq.${projectData.user_id},role.eq.coach`);

        if (profilesError) throw profilesError;

        // Filter out the current user and format the participants
        const filteredParticipants = profiles
          .filter(profile => profile.id !== user.id)
          .map(profile => ({
            id: profile.id,
            name: profile.name || 'Unknown User',
            email: profile.email || '',
            role: profile.role
          }));

        setParticipants(filteredParticipants);
      } catch (error) {
        console.error('Error fetching participants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [projectId, user]);

  if (loading) {
    return <div className="p-4">Loading participants...</div>;
  }

  return (
    <div className="border-b border-gray-200">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer"
          onClick={() => onSelectParticipant(participant)}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt={participant.name} />
            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{participant.name}</div>
            <div className="text-sm text-gray-500 capitalize">{participant.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectParticipants;
