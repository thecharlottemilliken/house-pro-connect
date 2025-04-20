
import React, { useEffect, useState } from "react";
import JobFilters from "@/components/jobs/JobFilters";
import JobCard, { JobData } from "@/components/jobs/JobCard";
import { supabase } from "@/integrations/supabase/client";
import { Hammer, Home } from "lucide-react";

const Jobs = () => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch projects with SOW status "active"
    const fetchJobs = async () => {
      setLoading(true);
      // Get all SOWs that are active, join project & property for info
      const { data, error } = await supabase
        .from("statement_of_work")
        .select(`
          id,
          status,
          project_id,
          work_areas,
          projects (
            id,
            title,
            property_id,
            renovation_areas
          ),
          properties:projects.property_id (
            id,
            property_name,
            address_line1,
            city,
            state,
            zip_code,
            image_url,
            home_photos
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const parsed: JobData[] = data.map((item: any) => {
          const project = item.projects || {};
          const property = item.properties || {};
          return {
            id: project.id || "",
            title: project.title || "Untitled Project",
            rooms: Array.isArray(project.renovation_areas) ? project.renovation_areas.length : 0,
            address: property.address_line1 ? `${property.address_line1}, ${property.city}` : "",
            city: property.city || "",
            state: property.state || "",
            image: Array.isArray(property.home_photos) && property.home_photos.length > 0 ? property.home_photos[0] : property.image_url || "",
            milestoType: "Partial Remodel",
            distance: "1 mile from base", // Placeholder, would require geolocation
            timeRemaining: "2 days 4:00:12", // Placeholder, should be calculated
          };
        });
        setJobs(parsed);
      } else {
        setJobs([]);
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f5f8fa]">
      {/* Sidebar Filters & Jobs List */}
      <aside className="w-full max-w-xs bg-[#f5f8fa] p-6 border-r hidden md:flex flex-col">
        <JobFilters />
        <h2 className="font-semibold text-2xl mt-6 mb-4">Projects <span className="text-lg font-normal text-gray-600">{jobs.length}</span></h2>
        <div className="space-y-5 overflow-y-auto max-h-[75vh] pr-2">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            jobs.map((job, idx) => <JobCard key={job.id + idx} job={job} />)
          )}
        </div>
      </aside>
      {/* Mobile List */}
      <aside className="w-full p-4 flex md:hidden flex-col">
        <JobFilters />
        <h2 className="font-semibold text-xl mt-3 mb-2">Projects <span className="text-md font-normal text-gray-600">{jobs.length}</span></h2>
        <div className="space-y-3">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            jobs.map((job, idx) => <JobCard key={job.id + idx} job={job} />)
          )}
        </div>
      </aside>

      {/* Map (placeholder) */}
      <section className="flex-1 hidden md:block relative">
        <img 
          src="/public/lovable-uploads/f1240b63-d819-4983-90c3-4ba3e977aae2.png" 
          alt="Jobs Map" 
          className="object-cover w-full h-full min-h-screen"
          style={{ maxHeight: "100vh" }}
        />
        {/* Overlayed icons are not functional, for mockup only */}
        {/* For a real map, integrate Mapbox or similar here */}
      </section>
    </div>
  );
};

export default Jobs;
