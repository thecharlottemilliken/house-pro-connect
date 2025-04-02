
interface TeamMemberItemProps {
  name: string;
  avatar?: string;
}

const TeamMemberItem = ({ name, avatar }: TeamMemberItemProps) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('');

  return (
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-medium mr-2">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full rounded-full" />
        ) : (
          initials
        )}
      </div>
      <span className="text-sm">{name}</span>
    </div>
  );
};

export default TeamMemberItem;
