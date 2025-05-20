
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload, FileWithPreview, extractUrls } from "@/components/ui/file-upload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BasicInfoFormProps {
  onComplete?: () => void;
}

interface BasicInfoFormValues {
  company_name: string;
  photo_url: string;
  location_city: string;
  location_state: string;
  location_zip: string;
  service_radius: number;
  about_text: string;
}

const BasicInfoForm = ({ onComplete }: BasicInfoFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const form = useForm<BasicInfoFormValues>({
    defaultValues: {
      company_name: "",
      photo_url: "",
      location_city: "",
      location_state: "",
      location_zip: "",
      service_radius: 25,
      about_text: ""
    }
  });
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("service_pro_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          form.reset({
            company_name: data.company_name || "",
            photo_url: data.photo_url || "",
            location_city: data.location_city || "",
            location_state: data.location_state || "",
            location_zip: data.location_zip || "",
            service_radius: data.service_radius || 25,
            about_text: data.about_text || ""
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user, form]);
  
  const handlePhotoUpload = (files: FileWithPreview[]) => {
    const urls = extractUrls(files);
    if (urls && urls.length > 0) {
      form.setValue("photo_url", urls[0]);
    }
  };
  
  const onSubmit = async (values: BasicInfoFormValues) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from("service_pro_profiles")
        .update({
          company_name: values.company_name,
          photo_url: values.photo_url,
          location_city: values.location_city,
          location_state: values.location_state,
          location_zip: values.location_zip,
          service_radius: values.service_radius,
          about_text: values.about_text,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your basic information has been saved successfully."
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          {...form.register("company_name", { required: true })}
        />
      </div>
      
      <div>
        <Label>Profile Photo</Label>
        <div className="mt-2">
          {form.watch("photo_url") ? (
            <div className="relative mb-4">
              <img
                src={form.watch("photo_url")}
                alt="Profile"
                className="w-32 h-32 object-cover rounded-full"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => form.setValue("photo_url", "")}
              >
                Remove
              </Button>
            </div>
          ) : (
            <FileUpload
              accept="image/*"
              multiple={false}
              onUploadComplete={handlePhotoUpload}
              label="Upload profile photo"
              description="Upload a professional photo for your profile"
            />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="location_city">City</Label>
          <Input
            id="location_city"
            {...form.register("location_city", { required: true })}
          />
        </div>
        <div>
          <Label htmlFor="location_state">State</Label>
          <Input
            id="location_state"
            {...form.register("location_state", { required: true })}
          />
        </div>
        <div>
          <Label htmlFor="location_zip">Zip Code</Label>
          <Input
            id="location_zip"
            {...form.register("location_zip", { required: true })}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="service_radius">Service Radius (miles)</Label>
        <Input
          id="service_radius"
          type="number"
          {...form.register("service_radius", {
            required: true,
            valueAsNumber: true,
            min: 1,
            max: 500
          })}
        />
      </div>
      
      <div>
        <Label htmlFor="about_text">About Your Business</Label>
        <Textarea
          id="about_text"
          rows={5}
          placeholder="Tell potential clients about your business, experience, and approach..."
          {...form.register("about_text")}
        />
      </div>
      
      <div className="pt-4">
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={saving}>
          {saving ? "Saving..." : "Save Basic Information"}
        </Button>
      </div>
    </form>
  );
};

export default BasicInfoForm;
