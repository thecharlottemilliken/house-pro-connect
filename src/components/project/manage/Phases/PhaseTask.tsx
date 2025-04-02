
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PhaseTaskProps {
  id: number;
  name: string;
  status: "Completed" | "In Progress" | "Not Started";
  date?: string;
  assignee?: string;
}

const PhaseTask = ({ id, name, status, date, assignee }: PhaseTaskProps) => {
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'Completed':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: <Check className="h-4 w-4 text-green-600" /> };
      case 'In Progress':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: null };
      case 'Not Started':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: null };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: null };
    }
  };
  
  const taskStyles = getStatusStyles(status);

  return (
    <div className="px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        {status === 'Completed' ? (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        ) : status === 'In Progress' ? (
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
        )}
        <span className="font-medium">{name}</span>
        <div className={`${taskStyles.bgColor} ${taskStyles.color} text-xs px-2 py-0.5 rounded-full`}>
          {status}
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="text-sm text-gray-500">
          {date || 'Not scheduled'}
        </div>
        <div className="text-sm text-gray-500">
          {assignee || 'Unassigned'}
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          Edit
        </Button>
      </div>
    </div>
  );
};

export default PhaseTask;
