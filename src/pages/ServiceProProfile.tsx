
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ServiceProNavbar from "@/components/service-pro/ServiceProNavbar";
import { Edit, Users, FileCheck, Shield, Image, MapPin, Building, Star, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ServiceProProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Specialties placeholder
  const specialties = ['Electrical', 'Drywall'];
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('service_pro_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  const handleEditProfile = () => {
    navigate('/service-pro-profile/edit');
  };
  
  // Get the user's initials for avatar fallback
  const getInitials = () => {
    if (!profile?.name) return "SP";
    return profile.name.split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ServiceProNavbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ServiceProNavbar />
      
      <main className="container mx-auto px-4 py-6">
        {/* Profile Header Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 h-32">
            <Button 
              onClick={handleEditProfile} 
              variant="secondary" 
              size="sm" 
              className="absolute top-4 right-4 bg-white hover:bg-gray-100"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Profile
            </Button>
          </div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4">
              <Avatar className="h-24 w-24 border-4 border-white rounded-full shadow-lg">
                <AvatarImage src={profileData?.photo_url || ""} />
                <AvatarFallback className="text-2xl bg-orange-100 text-orange-600">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-4 md:mt-0 md:ml-6 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileData?.company_name || profile?.name || "Your Company Name"}
                </h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {profileData?.location_city ? 
                      `${profileData.location_city}, ${profileData.location_state}` : 
                      "Location not set"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Specialties */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {profileData?.services_offered && profileData.services_offered.length > 0 ? (
                  profileData.services_offered.map((specialty: string, index: number) => (
                    <Badge key={index} variant="room" className="rounded-full py-1 px-3">
                      {specialty}
                    </Badge>
                  ))
                ) : (
                  specialties.map((specialty, index) => (
                    <Badge key={index} variant="room" className="rounded-full py-1 px-3">
                      {specialty}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About Section - 2/3 width on large screens */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Building className="h-5 w-5 mr-2 text-orange-500" />
                About Our Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileData?.service_details ? (
                <p className="text-gray-600">{profileData.service_details}</p>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Tell homeowners about the services you offer and what makes your company unique.
                  </p>
                  <Button onClick={handleEditProfile} variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                    Add Services Information
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Stats Card - 1/3 width */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Star className="h-5 w-5 mr-2 text-orange-500" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Jobs Completed</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Response Time</span>
                  <span className="font-semibold">-</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Licenses Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Award className="h-5 w-5 mr-2 text-orange-500" />
                Licenses & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Add your professional licenses and certifications to build trust with homeowners.
                </p>
                <Button 
                  onClick={() => navigate('/service-pro-profile?section=licenses')} 
                  variant="outline" 
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Add Licenses
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Insurance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Shield className="h-5 w-5 mr-2 text-orange-500" />
                Insurance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Add your business insurance details.
                </p>
                <Button 
                  onClick={() => navigate('/service-pro-profile?section=insurance')} 
                  variant="outline" 
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Add Insurance
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Portfolio Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Image className="h-5 w-5 mr-2 text-orange-500" />
                Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Showcase your best work with photos of completed projects.
                </p>
                <Button 
                  onClick={() => navigate('/service-pro-profile?section=portfolio')} 
                  variant="outline" 
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Add Portfolio Projects
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Team Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2 text-orange-500" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No team members listed.
                </p>
                <Button 
                  onClick={() => navigate('/service-pro-profile?section=team')} 
                  variant="outline" 
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Add Team Members
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
