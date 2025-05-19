import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Star, FileText, Briefcase, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import LicensesForm from "@/components/service-pro/LicensesForm";
import ServiceProRoute from "@/components/auth/ServiceProRoute";

const ServiceProProfile = () => {
  const { profile, user } = useAuth();
  const [activeSpecialty, setActiveSpecialty] = useState("electrical");
  
  const specialties = [
    { id: "electrical", name: "Electrical" },
    { id: "drywall", name: "Drywall" },
    { id: "plumbing", name: "Plumbing" },
    { id: "painting", name: "Painting" },
    { id: "flooring", name: "Flooring" },
    { id: "carpentry", name: "Carpentry" }
  ];
  
  // Placeholder name for company - would come from profile in real app
  const companyName = profile?.company || "Morales Construction LLC";
  const location = profile?.location || "Salt Lake City, UT";
  const displayName = profile?.name || user?.email?.split('@')[0] || "Service Pro";
  
  return (
    <ServiceProRoute>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-grow px-6 py-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column - Profile Information */}
            <div className="md:col-span-4 space-y-6">
              {/* Profile Card */}
              <Card className="border border-gray-200">
                <CardContent className="pt-6 pb-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-32 w-32 mb-4">
                      <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" />
                      <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="relative">
                      <Button variant="outline" size="icon" className="rounded-full absolute -right-3 -top-16 bg-white">
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between w-full">
                      <h2 className="text-3xl font-bold text-center mt-2">{displayName}</h2>
                      <Button variant="ghost" size="icon">
                        <svg 
                          className="h-5 w-5"
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M16 3L21 8L8 21L3 21L3 16L16 3Z"></path>
                        </svg>
                      </Button>
                    </div>
                    
                    <div className="w-full mt-4 space-y-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Location:</p>
                        <p>Pro Resident in {location}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Company:</p>
                        <p>{companyName}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Licenses & Certifications Card */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-orange-600" />
                    Licenses & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <LicensesForm />
                </CardContent>
              </Card>
              
              {/* Insurance Card */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-orange-600" />
                    Insurance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-4">
                    No insurance provided. Add your insurance information to begin bidding on projects.
                  </p>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Insurance
                  </Button>
                </CardContent>
              </Card>
              
              {/* Stats Card */}
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">0</p>
                      <p className="text-sm text-gray-500">Jobs Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">0%</p>
                      <p className="text-sm text-gray-500">Job Success Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Team Card */}
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Javier's Team</h3>
                  </div>
                  <p className="text-gray-500 mb-4">No team members listed.</p>
                  <Button variant="outline" className="w-full">
                    ADD TEAM MEMBERS
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Main Content */}
            <div className="md:col-span-8 space-y-6">
              {/* Specialty Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <div className="flex overflow-x-auto space-x-2 pb-2 specialties-scroll">
                  {specialties.map(specialty => (
                    <Button 
                      key={specialty.id}
                      variant={activeSpecialty === specialty.id ? "default" : "ghost"}
                      className={`${
                        activeSpecialty === specialty.id 
                          ? "border-b-2 border-black rounded-none px-4"
                          : "text-gray-500 rounded-none px-4"
                      } transition-colors`}
                      onClick={() => setActiveSpecialty(specialty.id)}
                    >
                      {specialty.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Primary Specialty */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Primary Specialty</h3>
                <h2 className="text-2xl font-bold mb-4">Electrical</h2>
                
                <div className="bg-gray-50 border border-gray-100 rounded-md p-6">
                  <p className="text-gray-600">
                    Add a description of your service so clients know what to expect.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" className="border-gray-300">
                      ADD DESCRIPTION
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Portfolio */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
                <div className="bg-gray-50 border border-gray-100 rounded-md p-6">
                  <p className="mb-2">To bid on projects you'll need at least <strong>3 portfolio projects</strong> so we can verify your work history.</p>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus size={16} /> ADD PROJECT
                  </Button>
                </div>
              </div>
              
              {/* Reviews */}
              <div>
                <h2 className="text-2xl font-bold mb-4">What People are Saying</h2>
                <p className="text-gray-500">No reviews yet!</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ServiceProRoute>
  );
};

export default ServiceProProfile;
