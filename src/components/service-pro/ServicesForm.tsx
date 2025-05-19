
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckboxProps } from "@radix-ui/react-checkbox";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ServicesFormProps {
  onComplete?: () => void;
}

interface ServiceCategory {
  id: string;
  name: string;
}

const ServicesForm = ({ onComplete }: ServicesFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceDetails, setServiceDetails] = useState("");
  
  // Mock service categories - in a real app, these might come from the database
  const serviceCategories: ServiceCategory[] = [
    { id: "general-contracting", name: "General Contracting" },
    { id: "kitchen-remodel", name: "Kitchen Remodeling" },
    { id: "bathroom-remodel", name: "Bathroom Remodeling" },
    { id: "electrical", name: "Electrical" },
    { id: "plumbing", name: "Plumbing" },
    { id: "hvac", name: "HVAC" },
    { id: "roofing", name: "Roofing" },
    { id: "flooring", name: "Flooring" },
    { id: "painting", name: "Painting" },
    { id: "landscaping", name: "Landscaping" },
    { id: "carpentry", name: "Carpentry" },
    { id: "masonry", name: "Masonry" },
    { id: "drywall", name: "Drywall" },
    { id: "tile", name: "Tile Installation" },
    { id: "windows-doors", name: "Windows & Doors" },
    { id: "interior-design", name: "Interior Design" },
    { id: "architectural-design", name: "Architectural Design" },
    { id: "demolition", name: "Demolition" },
  ];
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("service_pro_profiles")
          .select("services_offered, service_details")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setSelectedServices(data.services_offered || []);
          setServiceDetails(data.service_details || "");
        }
      } catch (error) {
        console.error("Error fetching service data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  const toggleService = (service: string) => {
    setSelectedServices(prev => {
      if (prev.includes(service)) {
        return prev.filter(s => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("service_pro_profiles")
        .update({
          services_offered: selectedServices,
          service_details: serviceDetails,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Services updated",
        description: "Your service information has been saved successfully."
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error updating services:", error);
      toast({
        title: "Error",
        description: "Failed to update your services. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 rounded w-3/4"></div>
      <div className="h-40 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Services Offered</h3>
        <p className="text-gray-500 mb-4">Select all services that your business provides.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {serviceCategories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedServices.includes(category.name)}
                onCheckedChange={() => toggleService(category.name)}
              />
              <Label htmlFor={category.id} className="text-sm font-normal">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <Label htmlFor="service_details">Additional Service Details</Label>
        <Textarea
          id="service_details"
          rows={5}
          placeholder="Describe any specialized services, unique approaches, or other details about the services you offer..."
          value={serviceDetails}
          onChange={(e) => setServiceDetails(e.target.value)}
        />
      </div>
      
      <div className="pt-4">
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={saving}>
          {saving ? "Saving..." : "Save Services Information"}
        </Button>
      </div>
    </form>
  );
};

export default ServicesForm;
