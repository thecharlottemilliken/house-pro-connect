
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ServiceProNavbar from "@/components/service-pro/ServiceProNavbar";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Briefcase, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Star, 
  User, 
  Users
} from "lucide-react";

const ServiceProProfile = () => {
  const location = useLocation();
  const [activeSpecialty, setActiveSpecialty] = useState("electrical");
  
  const specialties = [
    { id: "electrical", name: "Electrical" },
    { id: "plumbing", name: "Plumbing" },
    { id: "drywall", name: "Drywall" },
    { id: "painting", name: "Painting" },
    { id: "flooring", name: "Flooring" },
    { id: "carpentry", name: "Carpentry" }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ServiceProNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Pro Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your professional profile and credentials.
          </p>
        </div>
        
        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-orange-600">
                <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="Service Pro" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">John Peterson</h2>
                    <p className="text-gray-500">Renovation Specialist • Chicago, IL</p>
                  </div>
                  
                  <Button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
                    <User size={18} />
                    Edit Profile
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-xl font-bold text-orange-600">82</p>
                    <p className="text-sm text-gray-600">Jobs Completed</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-xl font-bold text-orange-600">98%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-xl font-bold text-orange-600">4.9</p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-xl font-bold text-orange-600">3 yrs</p>
                    <p className="text-sm text-gray-600">Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Specialty Tabs */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex overflow-x-auto pb-2 gap-2 specialties-scroll">
              {specialties.map(specialty => (
                <Badge 
                  key={specialty.id}
                  variant="outline"
                  className={`cursor-pointer px-4 py-2 text-base whitespace-nowrap ${
                    activeSpecialty === specialty.id 
                      ? "bg-orange-600 text-white border-orange-600" 
                      : "bg-white hover:bg-orange-50 hover:text-orange-600"
                  }`}
                  onClick={() => setActiveSpecialty(specialty.id)}
                >
                  {specialty.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service Description Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" /> 
                Primary Specialty
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSpecialty === "electrical" ? (
                <p className="text-gray-700">
                  Specialized in residential and commercial electrical installations, repairs and maintenance.
                  Licensed electrician with extensive experience in both new construction and remodels.
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-gray-500 mb-4">No description added yet</p>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus size={16} /> Add Description
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Licenses Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-orange-600" />
                Licenses & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Master Electrician</p>
                  <p className="text-sm text-gray-500">License #EL-12345 • Expires Dec 2024</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Safety Certification</p>
                  <p className="text-sm text-gray-500">OSHA 30-Hour • Completed Jan 2023</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Insurance Card */}
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Liability Insurance</p>
                  <p className="text-sm text-gray-500">Policy #LI-987654 • $2M Coverage</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Workers' Compensation</p>
                  <p className="text-sm text-gray-500">Policy #WC-456789 • Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Portfolio Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-orange-600" />
                Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSpecialty === "electrical" ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="aspect-square bg-gray-200 rounded-md overflow-hidden">
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Project" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-md overflow-hidden">
                    <img src="https://randomuser.me/api/portraits/men/33.jpg" alt="Project" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square bg-gray-200 rounded-md overflow-hidden">
                    <img src="https://randomuser.me/api/portraits/men/34.jpg" alt="Project" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-md">
                    <Button variant="ghost" className="text-orange-600">
                      <Plus size={24} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-gray-500 mb-4">No projects added yet</p>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus size={16} /> Add Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Reviews Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-600" />
                What People Are Saying
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-1">
                    <p className="font-medium">Sarah Johnson</p>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    "John did an excellent job rewiring our kitchen. Professional, punctual and very knowledgeable."
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between mb-1">
                    <p className="font-medium">Michael Brown</p>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    "Fixed electrical issues that other contractors couldn't figure out. Highly recommended!"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Team Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://randomuser.me/api/portraits/men/42.jpg" alt="Team Member" />
                    <AvatarFallback>RM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Robert Martinez</p>
                    <p className="text-sm text-gray-500">Apprentice Electrician</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://randomuser.me/api/portraits/women/24.jpg" alt="Team Member" />
                    <AvatarFallback>AW</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Amanda Wilson</p>
                    <p className="text-sm text-gray-500">Office Manager</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Plus size={16} /> Add Team Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ServiceProProfile;
