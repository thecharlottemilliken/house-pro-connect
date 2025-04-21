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
import MapboxMap from "@/components/jobs/MapboxMap";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
    type: "Kitchen",
    lat: 40.7259,
    lng: -111.8563
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
    type: "Bathroom",
    lat: 40.7538,
    lng: -111.8717
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
    type: "Living Room",
    lat: 40.7678,
    lng: -111.8315
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
    type: "Office",
    lat: 40.7384,
    lng: -111.8017
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
    type: "Dining Room",
    lat: 40.7425,
    lng: -111.8832
  },
];

const Jobs: React.FC = () => {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<string | null>(null);
  const [filteredJobs, setFilteredJobs] = useState(jobsList);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMapboxToken() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("get-mapbox-token");
        
        if (error) {
          console.error("Failed to load the Mapbox token:", error);
          toast({
            title: "Error loading map",
            description: "Could not load the map configuration. Please try again later.",
            variant: "destructive",
          });
        } else if (data?.token) {
          setMapboxToken(data.token);
        } else {
          console.warn("No token received from get-mapbox-token");
          toast({
            title: "Map configuration error",
            description: "Map token is missing. Please contact support.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error invoking get-mapbox-token function:", err);
        toast({
          title: "Connection error",
          description: "Could not connect to the map service. Please check your internet connection.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadMapboxToken();
  }, []);

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
      results = results;
    }

    if (selectedDistance) {
      results = results;
    }

    setFilteredJobs(results);
  }, [searchQuery, selectedType, selectedPrice, selectedDistance]);

  const handlePinClick = (jobId: string) => {
    setActiveJobId(jobId);

    const jobCard = document.getElementById(`job-card-${jobId}`);
    if (jobCard) {
      jobCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCardHover = (jobId: string) => {
    setActiveJobId(jobId);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#F5F8FA] flex flex-col">
      <DashboardNavbar />

      <div className="relative flex-1 h-[calc(100vh-126px)] min-h-0">
        <div className="absolute inset-0 z-0">
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-full bg-gray-100">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-3"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : mapboxToken ? (
            <MapboxMap
              jobs={jobsList.map(j => ({ id: j.id, lat: j.lat, lng: j.lng }))}
              activeJobId={activeJobId}
              onPinClick={handlePinClick}
              mapboxToken={mapboxToken}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100">
              <div className="bg-white p-8 rounded-xl shadow-lg space-y-4 border text-center max-w-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Could Not Load Map</h2>
                <p className="mb-2 text-gray-500">
                  We encountered an error loading the map. Please try refreshing the page or contact support.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside
          className="
          absolute top-0 right-0 h-full w-full md:w-[400px] xl:w-[430px] z-20
          bg-gradient-to-l from-white/98 via-white/80 to-white/10
          shadow-2xl border-l border-gray-200
          flex flex-col transition-all duration-300
          pointer-events-auto
          "
          style={{ backdropFilter: "blur(8px)" }}
        >
          <div className="px-6 pt-5 pb-3 flex flex-col gap-3 bg-white/95 sticky top-0 z-10 border-b border-gray-200 rounded-tl-xl">
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
                  className="relative"
                >
                  <Card
                    className={`flex flex-row p-2 bg-white rounded-lg ${
                      activeJobId === job.id
                        ? "ring-2 ring-[#9b87f5] shadow-lg"
                        : "shadow-sm border-none hover:ring-2 hover:ring-[#9b87f5]/50"
                    } overflow-hidden transition-all duration-200 cursor-pointer`}
                    onClick={() => handlePinClick(job.id)}
                  >
                    <img
                      src={job.image}
                      alt=""
                      className="h-[78px] w-[106px] object-cover object-center rounded-[8px] shadow"
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
      </div>
    </div>
  );
};

export default Jobs;
