
import { CalendarIcon } from "lucide-react";

interface WorkDateItemProps {
  title: string;
  date: string;
  timeRange: string;
}

const WorkDateItem = ({ title, date, timeRange }: WorkDateItemProps) => {
  return (
    <div className="bg-blue-50 p-3 rounded-md flex flex-col">
      <div className="font-medium text-gray-800">{title}</div>
      <div className="text-gray-600 text-sm">{date}</div>
      <div className="text-gray-600 text-sm mt-1">{timeRange}</div>
    </div>
  );
};

export default WorkDateItem;
