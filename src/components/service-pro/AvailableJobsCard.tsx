
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface JobItem {
  id: string;
  title: string;
  location: string;
  created_at: string;
  bidding_deadline?: string;
  status: string;
  categories: string[];
}

const AvailableJobsCard = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // For now, we'll just fetch projects as a placeholder for jobs
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, state, updated_at')
          .eq('state', 'active')
          .order('updated_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        // Transform projects into job-like items for display purposes
        const jobItems = data.map(project => ({
          id: project.id,
          title: project.title,
          location: "Various locations",
          created_at: project.updated_at,
          status: "Open for bids",
          categories: ["Renovation", "Home Improvement"]
        }));
        
        setJobs(jobItems);
      } catch (error) {
        console.error("Error fetching available jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    }).format(date);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Available Jobs</h3>
        <Button
          variant="ghost"
          className="text-orange-600 hover:text-orange-800 hover:bg-orange-100"
          onClick={() => navigate('/service-pro-jobs')}
        >
          View All
        </Button>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No available jobs at the moment.</p>
          <p className="text-gray-400 text-sm mt-1">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 cursor-pointer flex items-center"
              onClick={() => navigate(`/service-pro-jobs/${job.id}`)}
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{job.title}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {job.categories.map((category) => (
                    <Badge key={category} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Posted on {formatDate(job.created_at)}</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AvailableJobsCard;
