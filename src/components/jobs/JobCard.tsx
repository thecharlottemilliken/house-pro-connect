
import React from "react";
import { Home, Hammer } from "lucide-react";

export interface JobData {
  id: string;
  title: string;
  rooms: number;
  address: string;
  city: string;
  state: string;
  image: string;
  milestoType: string;
  distance: string;
  timeRemaining: string;
}

const JobCard: React.FC<{ job: JobData }> = ({ job }) => {
  return (
    <div className="flex bg-white shadow-[0_2px_8px_rgba(0,0,0,0.07)] rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <img 
        src={job.image || "/placeholder.svg"} 
        alt={job.title}
        className="h-24 w-32 object-cover"
        onError={e => { (e.target as HTMLImageElement).src="/placeholder.svg"; }}
      />
      {/* Info */}
      <div className="flex-1 flex flex-col p-3">
        <div className="flex items-center gap-2">
          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-semibold">{job.milestoType}</span>
          <span className="text-xs text-gray-500 ml-auto">{job.timeRemaining}</span>
        </div>
        <div className="font-semibold text-lg mt-1 leading-tight">{job.title}</div>
        <div className="flex items-center text-sm text-gray-600 mt-2 gap-x-2">
          <Home className="w-4 h-4" />
          <span>{job.rooms} Rooms</span>
          <span className="mx-2 text-gray-300">•</span>
          <span>{job.distance}</span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
