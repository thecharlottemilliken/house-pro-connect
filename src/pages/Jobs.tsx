
import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Filter, Home as HomeIcon, Hammer, MapPin, Smile, Search, ChevronDown } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import MapPinsOverlay from "@/components/jobs/MapPinsOverlay";

const jobsList = [
  {
    id: "1",
    title: "Kitchen Renovation in Sugarhouse",
    status: "Partial Remodel",
    rooms: 5,
    timeLeft: "2 days 4:00:12",
    distance: "1 mile from base",
    image: "/lovable-uploads/2ec4131e-e56c-4581-855e-2e1c9ec52254.png",
    price: "$15,000 - $25,000",
    type: "Kitchen"
  },
  {
    id: "2",
    title: "Revamping the Bathroom in Maplewood",
    status: "Partial Remodel",
    rooms: 5,
    timeLeft: "5 days 5:15:30",
    distance: "2 miles from base",
    image: "/lovable-uploads/8c4d6248-faa6-4667-85d0-58814934baa3.png",
    price: "$8,000 - $12,000",
    type: "Bathroom"
  },
  {
    id: "3",
    title: "Living Room Makeover in Oakridge",
    status: "Partial Remodel",
    rooms: 6,
    timeLeft: "6 days 6:45:45",
    distance: "2 miles from base",
    image: "/lovable-uploads/2069326c-e836-4307-bba2-93ef8b361ae6.png",
    price: "$10,000 - $18,000",
    type: "Living Room"
  },
  {
    id: "4",
    title: "Home Office Renovation in Pine Valley",
    status: "Partial Remodel",
    rooms: 5,
    timeLeft: "7 days 3:30:10",
    distance: "2 miles from base",
    image: "/lovable-uploads/b1b634cc-fc1b-43cb-86e5-d9576db2461c.png",
    price: "$7,500 - $12,000",
    type: "Office"
  },
  {
    id: "5",
    title: "Updating the Dining Room in Cedar Grove",
    status: "Partial Remodel",
    rooms: 5,
    timeLeft: "8 days 7:20:55",
    distance: "2 miles from base",
    image: "/lovable-uploads/51078945-7086-4860-bd68-bc61f9eb8ae6.png",
    price: "$9,000 - $15,000",
    type: "Dining Room"
  },
];

const Jobs: React.FC = () => {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<string | null>(null);
  const [filteredJobs, setFilteredJobs] = useState(jobsList);

  // Apply filters when criteria changes
  useEffect(() => {
    let results = jobsList;
    
    if (searchQuery) {
      results = results.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedType) {
      results = results.filter(job => job.type === selectedType);
    }
    
    if (selectedPrice) {
      // This would be expanded in a real implementation
      results = results;
    }
    
    if (selectedDistance) {
      // This would be expanded in a real implementation
      results = results;
    }
    
    setFilteredJobs(results);
  }, [searchQuery, selectedType, selectedPrice, selectedDistance]);

  const handlePinClick = (jobId: string) => {
    setActiveJobId(jobId);
    
    // Scroll the job card into view
    const jobCard = document.getElementById(`job-card-${jobId}`);
    if (jobCard) {
      jobCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCardHover = (jobId: string) => {
    setActiveJobId(jobId);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F8FA] flex flex-col">
      <DashboardNavbar />
      
      {/* Filter Bar - Zillow/Airbnb Style */}
      <div className="bg-white border-b border-gray-200 py-4 px-6 sticky top-14 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search projects by location or type..."
              className="pl-10 pr-4 py-2 border-gray-300 rounded-lg w-full h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 border-gray-300 text-gray-700 bg-white">
                <span>{selectedType || "Type"}</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem onClick={() => setSelectedType(null)}>
                Any Type
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedType("Kitchen")}>
                Kitchen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType("Bathroom")}>
                Bathroom
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType("Living Room")}>
                Living Room
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType("Office")}>
                Home Office
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType("Dining Room")}>
                Dining Room
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Price Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 border-gray-300 text-gray-700 bg-white">
                <span>{selectedPrice || "Price"}</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem onClick={() => setSelectedPrice(null)}>
                Any Price
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedPrice("Under $10K")}>
                Under $10,000
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPrice("$10K-$15K")}>
                $10,000 - $15,000
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPrice("$15K-$25K")}>
                $15,000 - $25,000
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPrice("$25K+")}>
                $25,000+
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Distance Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 border-gray-300 text-gray-700 bg-white">
                <span>{selectedDistance || "Distance"}</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem onClick={() => setSelectedDistance(null)}>
                Any Distance
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedDistance("1 Mile")}>
                Within 1 mile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedDistance("5 Miles")}>
                Within 5 miles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedDistance("10 Miles")}>
                Within 10 miles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedDistance("25 Miles")}>
                Within 25 miles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* More Filters Button */}
          <Button
            variant="outline"
            className="h-11 border-gray-300 text-gray-700 bg-white flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-row h-[calc(100vh-126px)] overflow-hidden">
        {/* Left Sidebar & Filters */}
        <aside className="w-full md:w-[390px] xl:max-w-sm bg-transparent p-0 pt-0 flex flex-col border-r-0">
          {/* Filters */}
          <div className="px-6 pt-6 pb-4 flex flex-col gap-3 bg-[#F5F8FA] sticky top-[126px] z-10">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[22px] font-semibold text-[#222]">
                Projects <span className="font-normal text-[#657080] text-lg ml-1">{filteredJobs.length}</span>
              </div>
              <Select defaultValue="recent">
                <SelectTrigger className="w-[140px] h-[42px] border-[#ced5e1] rounded-md text-[#222] text-[16px] font-medium shadow">
                  <SelectValue placeholder="Sort By: Recent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="price-low">Price (Low-High)</SelectItem>
                  <SelectItem value="price-high">Price (High-Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar mt-2">
            <ul className="space-y-4">
              {filteredJobs.map((job) => (
                <li 
                  key={job.id} 
                  id={`job-card-${job.id}`}
                  onMouseEnter={() => handleCardHover(job.id)}
                  onMouseLeave={() => setActiveJobId(null)}
                >
                  <Card 
                    className={`flex flex-row p-2 bg-white rounded-lg ${
                      activeJobId === job.id 
                        ? "ring-2 ring-[#9b87f5] shadow-md" 
                        : "shadow-sm border-none hover:ring-2 hover:ring-[#9b87f5]/50"
                    } overflow-hidden transition-all duration-200`}
                  >
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
              className="w-full h-full object-cover object-center"
              draggable={false}
              style={{ opacity: 1 }}
            />
            {/* Custom overlay pins + circle */}
            <MapPinsOverlay 
              jobs={jobsList} 
              activeJobId={activeJobId} 
              onPinClick={handlePinClick} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
