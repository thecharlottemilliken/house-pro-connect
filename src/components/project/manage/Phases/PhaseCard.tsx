
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhaseTask from "./PhaseTask";

export interface PhaseTask {
  id: number;
  name: string;
  status: "Completed" | "In Progress" | "Not Started";
  assignee?: string;
  date?: string;
}

export interface Phase {
  id: number;
  name: string;
  status: "Completed" | "In Progress" | "Upcoming";
  tasks: PhaseTask[];
  startDate?: string;
  endDate?: string;
}

interface PhaseCardProps {
  phase: Phase;
}

const PhaseCard = ({ phase }: PhaseCardProps) => {
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'Completed':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: <Check className="h-4 w-4 text-green-600" /> };
      case 'In Progress':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: null };
      case 'Not Started':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: null };
      case 'Upcoming':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: null };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: null };
    }
  };
  
  const { color, bgColor, icon } = getStatusStyles(phase.status);

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Phase Header */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-800">{phase.name}</h3>
          <div className={`${bgColor} ${color} text-xs font-medium px-2.5 py-1 rounded-full flex items-center`}>
            {icon && <span className="mr-1">{icon}</span>}
            {phase.status}
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          {phase.startDate} - {phase.endDate}
        </div>
      </div>
      
      {/* Phase Tasks */}
      <div className="divide-y divide-gray-200">
        {phase.tasks.map((task) => (
          <PhaseTask
            key={task.id}
            id={task.id}
            name={task.name}
            status={task.status}
            date={task.date}
            assignee={task.assignee}
          />
        ))}
      </div>
      
      {/* Add Task Button */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <Button variant="outline" size="sm" className="text-[#0f566c] border-[#0f566c]">
          + Add Task
        </Button>
      </div>
    </div>
  );
};

export default PhaseCard;
