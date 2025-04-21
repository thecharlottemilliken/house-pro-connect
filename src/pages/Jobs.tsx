
import React from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Filter, Home as HomeIcon, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import MapPinsOverlay from "@/components/jobs/MapPinsOverlay";

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
    <div className="w-full min-h-screen bg-[#F5F8FA] flex flex-col">
      <DashboardNavbar />
      <div className="flex-1 flex flex-row h-[calc(100vh-56px)] overflow-hidden">
        {/* Left Sidebar & Filters */}
        <aside className="w-full md:w-[390px] xl:max-w-sm bg-transparent p-0 pt-0 flex flex-col border-r-0">
          {/* Filters */}
          <div className="px-6 pt-6 pb-4 flex flex-col gap-3 bg-[#F5F8FA] sticky top-0 z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-[22px] font-semibold text-[#222]">
                Projects <span className="font-normal text-[#657080] text-lg ml-1">{jobsList.length}</span>
              </div>
              <Select>
                <SelectTrigger className="w-[140px] h-[42px] border-[#ced5e1] rounded-md text-[#222] text-[16px] font-medium shadow">
                  <SelectValue placeholder="Sort By: Recent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              className="flex items-center self-end mt-0 mb-0 mr-1 text-[#213447] text-[15px] font-semibold gap-2 uppercase tracking-wide hover:text-[#1A1F2C]"
              style={{ letterSpacing: 1.6 }}
            >
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar mt-2">
            <ul className="space-y-4">
              {jobsList.map((job) => (
                <li key={job.id}>
                  <Card className="flex flex-row p-2 bg-white rounded-lg shadow-sm border-none overflow-hidden hover:ring-2 hover:ring-[#9b87f5]/50 transition-shadow duration-200">
                    <img
                      src={job.image}
                      alt=""
                      className="h-[78px] w-[106px] object-cover object-center rounded-[8px]"
                    />
                    <div className="flex-1 pl-3 pr-2 flex flex-col justify-between">
                      <div className="flex items-center mb-1 gap-2">
                        <span className="inline-block rounded px-2 py-0.5 bg-[#FEF7CD] text-xs text-[#c8763b] font-semibold">
                          {job.status}
                        </span>
                        <span className="flex items-center gap-1 text-[#a0afbb] text-xs ml-auto">
                          <span>{job.timeLeft}</span>
                        </span>
                      </div>
                      <div className="text-[17px] text-[#1A1F2C] font-semibold leading-tight mb-1">{job.title}</div>
                      <div className="flex gap-6 mt-1 text-sm text-[#1EAEDB] items-center font-semibold">
                        <span className="flex items-center gap-1 text-[#1EAEDB]">
                          <HomeIcon className="w-4 h-4 mr-1 text-[#1EAEDB]" />
                          {job.rooms} Rooms
                        </span>
                        <span className="flex items-center gap-1 text-[#1EAEDB]">
                          <span className="ml-2 underline underline-offset-2">{job.distance}</span>
                        </span>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Map Panel */}
        <div className="flex-1 relative bg-[#F5F8FA] overflow-hidden flex items-stretch min-h-0">
          <div className="absolute inset-0">
            {/* Main map image */}
            <img
              src="/lovable-uploads/599d758f-5824-4a69-aeb6-c5f25567e454.png"
              alt="Map"
              className="w-full h-full object-cover object-center pointer-events-none"
              draggable={false}
              style={{ opacity: 1 }}
            />
            {/* Custom overlay pins + circle */}
            <MapPinsOverlay />
          </div>
          <div className="absolute inset-0 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default Jobs;

