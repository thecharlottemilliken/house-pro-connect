
import { useAuth } from "@/contexts/AuthContext";
import TeamMemberCard from "./TeamMemberCard";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {teamMembers.map((member) => (
        <TeamMemberCard
          key={member.id}
          id={member.id}
          name={member.name}
          email={member.email}
          role={member.role}
          avatarUrl={member.avatarUrl}
          isCurrentUser={user?.id === (member.user_id || member.id)}
          isOwner={member.role === "owner"}
          projectId={projectId}
        />
      ))}
    </div>
  );
};

export default TeamMemberList;
