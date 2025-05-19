
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ServiceProNavbar from "@/components/service-pro/ServiceProNavbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Save } from "lucide-react";

const ServiceProProfileEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: "",
    location_city: "",
    location_state: "",
    location_zip: "",
    service_details: "",
    service_radius: "",
    about_text: ""
  });
  
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
        
        setFormData({
          company_name: data?.company_name || "",
          location_city: data?.location_city || "",
          location_state: data?.location_state || "",
          location_zip: data?.location_zip || "",
          service_details: data?.service_details || "",
          service_radius: data?.service_radius ? String(data.service_radius) : "",
          about_text: data?.about_text || ""
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCancel = () => {
    navigate('/service-pro-profile');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('service_pro_profiles')
        .update({
          company_name: formData.company_name,
          location_city: formData.location_city,
          location_state: formData.location_state,
          location_zip: formData.location_zip,
          service_details: formData.service_details,
          service_radius: formData.service_radius ? parseInt(formData.service_radius) : null,
          about_text: formData.about_text
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      navigate('/service-pro-profile');
    } catch (error: any) {
      toast.error(`Error updating profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
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
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={handleCancel}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </Button>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input 
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Your Company Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="about_text">About</Label>
                  <Textarea 
                    id="about_text"
                    name="about_text"
                    value={formData.about_text}
                    onChange={handleChange}
                    placeholder="Tell clients about your company"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location_city">City</Label>
                  <Input 
                    id="location_city"
                    name="location_city"
                    value={formData.location_city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location_state">State</Label>
                  <Input 
                    id="location_state"
                    name="location_state"
                    value={formData.location_state}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location_zip">Zip Code</Label>
                  <Input 
                    id="location_zip"
                    name="location_zip"
                    value={formData.location_zip}
                    onChange={handleChange}
                    placeholder="Zip Code"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service_radius">Service Radius (miles)</Label>
                  <Input 
                    id="service_radius"
                    name="service_radius"
                    value={formData.service_radius}
                    onChange={handleChange}
                    type="number"
                    placeholder="e.g., 25"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Services Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="service_details">Service Details</Label>
                  <Textarea 
                    id="service_details"
                    name="service_details"
                    value={formData.service_details}
                    onChange={handleChange}
                    placeholder="Describe the services you offer in detail"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              className="mr-2"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ServiceProProfileEdit;
