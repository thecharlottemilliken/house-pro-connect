
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface PropertyDetails {
  id: string;
  property_name: string;
  image_url: string;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
}

interface RenovationArea {
  area: string;
  location: string;
}

const ProjectDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const [projectData, setProjectData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the project data from the location state
    if (location.state?.propertyId && location.state?.completed) {
      setProjectData(location.state);
      fetchPropertyDetails(location.state.propertyId);
    } else {
      // If no project data is available, redirect to dashboard
      navigate("/dashboard");
    }
  }, [location.state, navigate]);

  const fetchPropertyDetails = async (propertyId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      
      if (error) {
        throw error;
      }
      
      setPropertyDetails(data);
    } catch (error) {
      console.error('Error fetching property details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !propertyDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <div className="flex-1 p-4 md:p-10">
          <div className="text-center py-10">Loading project details...</div>
        </div>
      </div>
    );
  }

  // Generate a fake project ID for display purposes
  const projectId = `#${Math.floor(100000 + Math.random() * 900000)}`;

  // Extract renovation areas if available and ensure proper formatting
  const renovationAreas = projectData?.renovationAreas || [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Sidebar */}
        <div className="w-64 bg-[#EFF3F7] border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <Button 
              variant="ghost" 
              className="flex items-center text-gray-700 mb-4 pl-0 hover:bg-transparent hover:text-[#174c65]"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> All Projects
            </Button>
            
            <div className="flex items-center gap-2 text-[#174c65] font-medium mb-3 pl-1">
              <span className="w-5 h-5 text-xs flex items-center justify-center border border-[#174c65] rounded-full">✓</span>
              Kitchen Project
            </div>
          </div>
          
          <nav className="p-3">
            <ul className="space-y-1">
              <NavItem icon="home" label="Manage" active={false} />
              <NavItem icon="design" label="Design" active={false} />
              <NavItem icon="team" label="Team" active={false} />
              <NavItem icon="message" label="Messages" active={false} />
              <NavItem icon="document" label="Bids & Proposals" active={false} />
              <NavItem icon="file" label="Documents" active={false} />
              <NavItem icon="material" label="Materials" active={false} />
              <NavItem icon="accounting" label="Accounting" active={false} />
              <NavItem icon="activity" label="Activity History" active={false} />
            </ul>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {projectData?.projectTitle || "Kitchen Remodel"}
            </h1>
            <p className="text-gray-600">
              {propertyDetails.property_name || "Family Home"} {projectId}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Property Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Family Home</CardTitle>
                <p className="text-sm text-gray-600">
                  {propertyDetails.address_line1}, {propertyDetails.city}, {propertyDetails.state} {propertyDetails.zip_code}
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <img 
                    src={propertyDetails.image_url} 
                    alt={propertyDetails.property_name} 
                    className="w-full h-48 object-cover rounded-md" 
                  />
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">RENOVATION AREAS</h3>
                  <div className="space-y-2">
                    {renovationAreas.map((area: RenovationArea, index: number) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="text-orange-500 mr-2">★</span> {area.area} ({area.location})
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between text-[#174c65] border-[#174c65]"
                  >
                    PROPERTY DETAILS <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Tasks Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Your Tasks</CardTitle>
                  <Button variant="link" className="text-[#174c65] p-0">See All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Add your design inspiration</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    While you're waiting on your project coach to reach out, you can get a head
                    start by adding your renovation inspiration to the 'Design' section.
                  </p>
                  <Button className="w-full md:w-auto bg-[#174c65] hover:bg-[#174c65]/90 justify-between">
                    ADD DESIGN INSPO <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Messages */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Recent Messages</CardTitle>
                  <Button variant="link" className="text-[#174c65] p-0">See All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">No recent conversations</p>
              </CardContent>
            </Card>
            
            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Upcoming Events</CardTitle>
                  <Button variant="link" className="text-[#174c65] p-0">See All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">No upcoming events</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation Item Component
interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
}

const NavItem = ({ icon, label, active }: NavItemProps) => {
  // Map icon names to JSX icons
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
      case 'design':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
      case 'team':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>;
      case 'message':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
      case 'document':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
      case 'file':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
      case 'material':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.9 20 6.5-18h1.6l6.5 18"/><path d="M3.5 20h17"/><path d="M7 13h8"/></svg>;
      case 'accounting':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><line x1="3" x2="6" y1="3" y2="6"/><line x1="21" x2="18" y1="3" y2="6"/><line x1="3" x2="6" y1="21" y2="18"/><line x1="21" x2="18" y1="21" y2="18"/></svg>;
      case 'activity':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
      default:
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  return (
    <li>
      <button
        className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm ${
          active 
            ? 'bg-[#174c65]/10 text-[#174c65] font-medium' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span className="text-gray-500">{getIcon(icon)}</span>
        {label}
      </button>
    </li>
  );
};

export default ProjectDashboard;
