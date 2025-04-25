
import { useAuth } from "@/contexts/AuthContext";
import TeamMemberCard from "./TeamMemberCard";
import { Card } from "@/components/ui/card";
import { UserRound, Shield } from "lucide-react";

interface TeamMember {
  id: string;
  role: string;
  name: string;
  email: string;
  avatarUrl: string;
  user_id?: string;
}

interface TeamMemberListProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
  projectId: string;
}

const TeamMemberList = ({ teamMembers, isLoading, projectId }: TeamMemberListProps) => {
  const { user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center mb-2">
                <div className="h-12 w-12 rounded-full bg-gray-200 mr-3"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="flex border-t border-gray-200">
              <div className="flex-1 p-3 flex justify-center">
                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              </div>
              <div className="border-r border-gray-200"></div>
              <div className="flex-1 p-3 flex justify-center">
                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              </div>
              <div className="border-r border-gray-200"></div>
              <div className="flex-1 p-3 flex justify-center">
                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 mb-4">No team members found for this project.</p>
      </div>
    );
  }

  // Filter and sort team members
  const owner = teamMembers.find(member => member.role === 'owner');
  const coaches = teamMembers.filter(member => member.role === 'coach')
    .sort((a, b) => a.name.localeCompare(b.name));
  
  const otherMembers = teamMembers.filter(member => member.role !== 'owner' && member.role !== 'coach')
    .sort((a, b) => a.role === b.role ? a.name.localeCompare(b.name) : a.role.localeCompare(b.role));

  return (
    <div className="space-y-8">
      {owner && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-600" />
            Project Owner
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <TeamMemberCard
              key={owner.id}
              id={owner.id}
              name={owner.name}
              email={owner.email}
              role={owner.role}
              avatarUrl={owner.avatarUrl}
              isCurrentUser={user?.id === (owner.user_id || owner.id)}
              isOwner={true}
              projectId={projectId}
            />
          </div>
        </div>
      )}

      {coaches.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <UserRound className="mr-2 h-5 w-5 text-green-600" />
            Coaches ({coaches.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {coaches.map((coach) => (
              <TeamMemberCard
                key={coach.id}
                id={coach.id}
                name={coach.name}
                email={coach.email}
                role={coach.role}
                avatarUrl={coach.avatarUrl}
                isCurrentUser={user?.id === (coach.user_id || coach.id)}
                isOwner={false}
                projectId={projectId}
              />
            ))}
          </div>
        </div>
      )}

      {otherMembers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <UserRound className="mr-2 h-5 w-5 text-gray-600" />
            Team Members ({otherMembers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {otherMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                id={member.id}
                name={member.name}
                email={member.email}
                role={member.role}
                avatarUrl={member.avatarUrl}
                isCurrentUser={user?.id === (member.user_id || member.id)}
                isOwner={false}
                projectId={projectId}
              />
            ))}
          </div>
        </div>
      )}

      {coaches.length === 0 && otherMembers.length === 0 && (
        <Card className="p-6 text-center bg-gray-50">
          <p className="text-gray-600">
            This project currently has no additional team members or coaches.
            Use the "INVITE A TEAM MEMBER" button to add more people to this project.
          </p>
        </Card>
      )}
    </div>
  );
};

export default TeamMemberList;
