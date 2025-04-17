
import TeamMemberCard from "./TeamMemberCard";

interface TeamMember {
  id: string;
  role: string;
  name: string;
  email: string;
  avatarUrl: string;
}

interface TeamMemberListProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
}

const TeamMemberList = ({ teamMembers, isLoading }: TeamMemberListProps) => {
  if (isLoading) {
    return <div className="text-center p-8">Loading team members...</div>;
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
          name={member.name}
          email={member.email}
          role={member.role}
          avatarUrl={member.avatarUrl}
        />
      ))}
    </div>
  );
};

export default TeamMemberList;
