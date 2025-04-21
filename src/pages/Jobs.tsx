
import React from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Filter, Home, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const jobsList = [
  {
    id: 1,
    title: "Kitchen Renovation in Sugarhouse",
    status: "Partial Remodel",
    rooms: 5,
    timeLeft: "2 days 4:00:12",
    distance: "1 mile from base",
    image: "/lovable-uploads/2ec4131e-e56c-4581-855e-2e1c9ec52254.png",
  },
  {
    id: 2,
    title: "Revamping the Bathroom in Maplewood",
    status: "Partial Remodel",
    rooms: 5,
    timeLeft: "5 days 5:15:30",
    distance: "2 miles from base",
    image: "/lovable-uploads/8c4d6248-faa6-4667-85d0-58814934baa3.png",
  },
  {
    id: 3,
    title: "Living Room Makeover in Oakridge",
    status: "Partial Remodel",
    rooms: 6,
    timeLeft: "6 days 6:45:45",
    distance: "2 miles from base",
    image: "/lovable-uploads/2069326c-e836-4307-bba2-93ef8b361ae6.png",
  },
  {
    id: 4,
    title: "Home Office Renovation in Pine Valley",
    status: "Partial Remodel",
    rooms: 5,
    timeLeft: "7 days 3:30:10",
    distance: "2 miles from base",
    image: "/lovable-uploads/b1b634cc-fc1b-43cb-86e5-d9576db2461c.png",
  },
  {
    id: 5,
    title: "Updating the Dining Room in Cedar Grove",
    status: "Partial Remodel",
    rooms: 5,
    timeLeft: "8 days 7:20:55",
    distance: "2 miles from base",
    image: "/lovable-uploads/51078945-7086-4860-bd68-bc61f9eb8ae6.png",
  },
];

const Jobs: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#f5f7fb] flex flex-col">
      <DashboardNavbar />
      <div className="flex-1 flex flex-row h-[calc(100vh-56px)]">
        {/* Left panel - Filters and job list */}
        <aside className="w-full md:w-[410px] xl:max-w-sm bg-[#ECF5FB]/60 border-r border-[#e1e5ec] p-6 pt-4 flex flex-col">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Select>
              <option>Project Underway Est.</option>
            </Select>
            <Select>
              <option>Project Type</option>
            </Select>
            <Select>
              <option>Speciality</option>
            </Select>
            <Select>
              <option>Project Size</option>
            </Select>
          </div>
          <div className="flex items-center justify-between mb-2 mt-1">
            <div className="text-xl font-semibold text-[#222]">
              Projects <span className="font-normal text-[#657080]">{jobsList.length}</span>
            </div>
            <div>
              <Button variant="outline" className="rounded-md text-[#393f49] gap-2 px-2 py-1 text-sm font-normal border-[#ced5e1]">
                Sort By <span className="ml-1 text-[#0f3a4d]/70">Recent</span>
              </Button>
            </div>
          </div>
          <button className="flex items-center self-end mt-0 mb-4 mr-1 text-[#213447] text-sm font-semibold gap-2 uppercase tracking-wide">
            <Filter className="w-4 h-4" /> Advanced Filters
          </button>
          <div className="flex-1 overflow-y-auto pr-2 mt-2 custom-scrollbar">
            <ul className="space-y-4">
              {jobsList.map((job) => (
                <li key={job.id}>
                  <Card className="flex flex-row p-0 bg-white rounded-xl shadow-md border-[1.5px] border-[#DBE8EF] overflow-hidden hover:ring-2 hover:ring-[#9b87f5]/70 transition-shadow duration-200">
                    <img
                      src={job.image}
                      alt=""
                      className="h-[85px] w-[110px] object-cover object-center rounded-l-lg"
                    />
                    <div className="flex-1 py-3 pl-4 pr-2 flex flex-col justify-between">
                      <div className="flex items-center mb-1 gap-2">
                        <span className="inline-block rounded px-2 py-0.5 bg-[#fff5e6] text-xs text-[#c8763b] font-medium">
                          {job.status}
                        </span>
                        <span className="flex items-center gap-1 text-[#a0afbb] text-xs ml-auto">
                          <span>{job.timeLeft}</span>
                        </span>
                      </div>
                      <div className="text-[16px] text-[#1A1F2C] font-semibold">{job.title}</div>
                      <div className="flex gap-4 mt-2 text-xs text-[#5a6d7d] items-center font-medium">
                        <span className="flex items-center gap-1">
                          <Home className="w-4 h-4 mr-0.5 text-[#5a6d7d]" /> 
                          {job.rooms} Rooms
                        </span>
                        <span className="flex items-center gap-1 text-[#1b8fb8]">
                          <MapPin className="w-4 h-4 mr-0.5 text-[#1b8fb8]" />
                          {job.distance}
                        </span>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Right panel - Map area */}
        <div className="w-[calc(100%-410px)] overflow-hidden relative flex-1 flex items-stretch">
          <div className="absolute inset-0">
            <img 
              src="/lovable-uploads/51078945-7086-4860-bd68-bc61f9eb8ae6.png"
              alt="Map"
              className="w-full h-full object-cover object-center"
              draggable={false}
              style={{ opacity: 0.97 }}
            />
            {/* Map pins could be drawn absolutely in future */}
            {/* For now, just render as in mockup for static image */}
          </div>
          {/* Overlay to soften the edges */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-[#dee4ed]/80 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default Jobs;
