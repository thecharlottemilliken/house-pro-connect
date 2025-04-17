
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Phone, CreditCard, ExternalLink } from "lucide-react";

interface TeamMemberProps {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

const TeamMemberCard = ({ name, email, role, avatarUrl }: TeamMemberProps) => {
  return (
    <Card className="border border-gray-200 rounded-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center mb-2">
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-700">{role}</h3>
              <h2 className="font-medium text-lg text-gray-900">{name}</h2>
            </div>
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
          <div className="border-r border-gray-200"></div>
          <button className="flex-1 py-3 flex justify-center items-center text-gray-600 hover:bg-gray-50">
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamMemberCard;
