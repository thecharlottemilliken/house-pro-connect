
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface TeamPageHeaderProps {
  onInviteClick: () => void;
}

const TeamPageHeader = ({ onInviteClick }: TeamPageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-0">Project Team</h1>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
        <Button 
          className="bg-[#0f566c] hover:bg-[#0d4a5d]"
          onClick={onInviteClick}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          INVITE A TEAM MEMBER
        </Button>
      </div>
    </div>
  );
};

export default TeamPageHeader;
