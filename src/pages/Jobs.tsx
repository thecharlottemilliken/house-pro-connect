
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Home as HomeIcon, Hammer, MapPin, Smile, Search, ChevronDown } from "lucide-react";
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
import JobsFilterBar from "@/components/jobs/JobsFilterBar";
import { differenceInSeconds, addDays, formatDuration, intervalToDuration } from "date-fns";

// Define the job interface to match the structure returned from the API
interface Job {
  id: string;
  status: string;
  work_areas: any[];
  labor_items: any[];
  material_items: any[];
  bid_configuration: {
    bidDuration: string;
    projectDescription?: string;
    type?: string;
  };
  approved_at: string;
  project: {
    id: string;
    title: string;
  };
  property: {
    id: string;
    image: string | null;
  };
}

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [fetchError, setFetchError] = useState<string | null>(null);

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
    async function fetchJobs() {
      setIsLoading(true);
      setFetchError(null);
      
      try {
        console.log("Fetching approved jobs...");
        const { data, error } = await supabase.functions.invoke('get-approved-jobs');
        
        if (error) {
          console.error("Error from get-approved-jobs function:", error);
          setFetchError("Could not fetch approved jobs");
          toast({
            title: "Error loading jobs",
            description: "Could not fetch approved jobs: " + error.message,
            variant: "destructive",
          });
          setJobs([]);
        } else if (!data || !data.jobs) {
          console.error("Invalid response format from get-approved-jobs:", data);
          setFetchError("Invalid response from server");
          toast({
            title: "Error loading jobs",
            description: "Received invalid data format from the server",
            variant: "destructive",
          });
          setJobs([]);
        } else {
          console.log("Received jobs data:", data.jobs);
          setJobs(data.jobs);
        }
      } catch (e) {
        console.error("Exception when fetching jobs:", e);
        setFetchError("Network error");
        toast({
          title: "Network Error",
          description: "Failed to fetch jobs: " + (e.message || "Unknown error"),
          variant: "destructive"
        });
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, []);

  // Apply filters to the jobs
  const filteredJobs = jobs.filter(job => {
    if (searchQuery && !job.project.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedType && (!job.bid_configuration?.type || job.bid_configuration.type !== selectedType)) return false;
    return true;
  });

  const getBidCountdown = (job: Job) => {
    if (!job.approved_at || !job.bid_configuration?.bidDuration) return null;
    const approved = new Date(job.approved_at);
    const durationDays = parseInt(job.bid_configuration.bidDuration, 10) || 0;
    const deadline = addDays(approved, durationDays);
    const diffSec = differenceInSeconds(deadline, new Date());
    if (diffSec <= 0) return 'Expired';
    const parts = intervalToDuration({ start: new Date(), end: deadline });
    return formatDuration(parts, { format: ['days', 'hours', 'minutes', 'seconds'] });
  };

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
  
  const handleCardClick = (jobId: string) => {
    navigate(`/job-details/${jobId}`);
  };

  // For map display, we need to transform the jobs to include lat/lng
  const mapJobs = filteredJobs.map(job => ({
    id: job.id,
    lat: 40.7608, // Using default coordinates since we don't have real ones
    lng: -111.8910
  }));

  return (
    <div className="relative w-full min-h-screen bg-[#F5F8FA] flex flex-col">
      <DashboardNavbar />

      {/* Full-width filter bar */}
      <div className="sticky top-0 z-30 w-screen left-0 bg-white/90 border-b border-gray-200" style={{width:"100vw", marginLeft:"calc(-50vw + 50%)"}}>
        <JobsFilterBar
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          selectedDistance={selectedDistance}
          setSelectedDistance={setSelectedDistance}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>
      
      <div className="relative flex-1 min-h-0 flex max-w-screen">
        {/* Map */}
        <div className="relative flex-1 h-[calc(100vh-126px)] min-h-0">
          <div className="absolute inset-0 z-0">
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-full bg-gray-100">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-3"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            ) : (
              <MapboxMap
                jobs={mapJobs}
                activeJobId={activeJobId}
                onPinClick={handlePinClick}
                mapboxToken={mapboxToken}
              />
            )}
          </div>
        </div>
        {/* Side rail */}
        <aside
          className="
            relative h-auto w-full md:w-[400px] xl:w-[430px] z-20
            bg-gradient-to-l from-white/98 via-white/80 to-white/10
            shadow-2xl border-l border-gray-200
            flex flex-col transition-all duration-300
            pointer-events-auto
          "
          style={{ backdropFilter: "blur(8px)" }}
        >
          <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar mt-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : fetchError ? (
              <div className="p-4 text-center">
                <p className="text-red-500 font-medium">{fetchError}</p>
                <p className="text-sm text-gray-600 mt-2">Please try again later or contact support</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-4 text-center">
                <p className="font-medium text-gray-700">No approved jobs found</p>
                <p className="text-sm text-gray-600 mt-2">There are no SOWs with approved status</p>
              </div>
            ) : (
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
                      onClick={() => handleCardClick(job.id)}
                    >
                      <img
                        src={job.property.image || "/placeholder.svg"}
                        alt=""
                        className="h-[78px] w-[106px] object-cover object-center rounded-[8px] shadow"
                      />
                      <div className="flex-1 pl-3 pr-2 flex flex-col justify-between">
                        <div className="flex items-center mb-1 gap-2">
                          <span className="inline-block rounded px-2 py-0.5 bg-[#FEF7CD] text-xs text-[#c8763b] font-semibold">
                            {job.status}
                          </span>
                          <span className="flex items-center gap-1 text-[#a0afbb] text-xs ml-auto">
                            <span>{getBidCountdown(job)}</span>
                          </span>
                        </div>
                        <div className="text-[17px] text-[#1A1F2C] font-semibold leading-tight mb-1">
                          {job.project.title}
                        </div>
                        <div className="flex gap-6 mt-1 text-sm text-[#1EAEDB] items-center font-semibold">
                          <span className="flex items-center gap-1 text-[#1EAEDB]">
                            <HomeIcon className="w-4 h-4 mr-1 text-[#1EAEDB]" />
                            {(job.work_areas?.length || 0)} Rooms
                          </span>
                        </div>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Jobs;
