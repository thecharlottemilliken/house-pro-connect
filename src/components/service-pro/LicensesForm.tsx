import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LicensesFormProps {
  onComplete?: () => void;
}

interface LicenseFormValues {
  license_type: string;
  license_number: string;
  issuing_authority?: string;
  issue_date?: string;
  expiry_date?: string;
  document_url?: string;
}

interface License extends LicenseFormValues {
  id: string;
  verification_status: string;
}

const licenseTypes = [
  "General Contractor",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Roofing",
  "Home Improvement",
  "Other",
];

const LicensesForm = ({ onComplete }: LicensesFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [addingNew, setAddingNew] = useState(false);
  
  const form = useForm<LicenseFormValues>({
    defaultValues: {
      license_type: "",
      license_number: "",
      issuing_authority: "",
      issue_date: "",
      expiry_date: "",
      document_url: ""
    }
  });
  
  useEffect(() => {
    const fetchLicenses = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("service_pro_licenses")
          .select("*")
          .eq("pro_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        setLicenses(data || []);
      } catch (error) {
        console.error("Error fetching licenses:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLicenses();
  }, [user]);
  
  const handleFileUpload = (urls: string[]) => {
    if (urls && urls.length > 0) {
      form.setValue("document_url", urls[0]);
    }
  };
  
  const submitLicense = async (values: LicenseFormValues) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { data, error } = await supabase
        .from("service_pro_licenses")
        .insert({
          pro_id: user.id,
          license_type: values.license_type,
          license_number: values.license_number,
          issuing_authority: values.issuing_authority || null,
          issue_date: values.issue_date || null,
          expiry_date: values.expiry_date || null,
          document_url: values.document_url || null,
          verification_status: "pending"
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "License added",
        description: "Your license information has been saved successfully."
      });
      
      // Add the new license to the list
      if (data && data[0]) {
        setLicenses(prev => [data[0], ...prev]);
      }
      
      // Reset form and hide the form
      form.reset();
      setAddingNew(false);
      
      if (onComplete && licenses.length === 0) {
        onComplete();
      }
    } catch (error) {
      console.error("Error adding license:", error);
      toast({
        title: "Error",
        description: "Failed to add your license. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const deleteLicense = async (id: string) => {
    if (confirm("Are you sure you want to delete this license?")) {
      try {
        const { error } = await supabase
          .from("service_pro_licenses")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
        
        setLicenses(prev => prev.filter(license => license.id !== id));
        
        toast({
          title: "License deleted",
          description: "Your license has been removed successfully."
        });
      } catch (error) {
        console.error("Error deleting license:", error);
        toast({
          title: "Error",
          description: "Failed to delete the license. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Verified</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 rounded w-3/4"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Licenses & Certifications</h3>
        {!addingNew && (
          <Button 
            type="button" 
            onClick={() => setAddingNew(true)} 
            variant="outline"
            className="flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add License
          </Button>
        )}
      </div>
      
      {addingNew && (
        <Card>
          <CardHeader>
            <CardTitle>Add New License</CardTitle>
            <CardDescription>
              Enter your professional license or certification details.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(submitLicense)}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="license_type">License Type</Label>
                <Controller
                  name="license_type"
                  control={form.control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a license type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {licenseTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              
              <div>
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  {...form.register("license_number", { required: true })}
                />
              </div>
              
              <div>
                <Label htmlFor="issuing_authority">Issuing Authority</Label>
                <Input
                  id="issuing_authority"
                  {...form.register("issuing_authority")}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    {...form.register("issue_date")}
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    {...form.register("expiry_date")}
                  />
                </div>
              </div>
              
              <div>
                <Label>License Document</Label>
                <div className="mt-2">
                  {form.watch("document_url") ? (
                    <div className="relative mb-4">
                      <a 
                        href={form.watch("document_url")} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline flex items-center"
                      >
                        View Uploaded Document
                      </a>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => form.setValue("document_url", "")}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <FileUpload
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxFiles={1}
                      onUploadComplete={handleFileUpload}
                      label="Upload license document"
                      description="Upload your license or certification document (PDF or image)"
                    />
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setAddingNew(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-700"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save License"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      
      {licenses.length === 0 && !addingNew ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
          <p className="text-gray-500">No licenses or certifications added yet.</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add License" to add your professional credentials.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {licenses.map((license) => (
            <Card key={license.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>{license.license_type}</CardTitle>
                  <CardDescription>#{license.license_number}</CardDescription>
                </div>
                {getVerificationBadge(license.verification_status)}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Issuing Authority:</span>{" "}
                    <span>{license.issuing_authority || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Issue Date:</span>{" "}
                    <span>{formatDate(license.issue_date)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Expiry Date:</span>{" "}
                    <span>{formatDate(license.expiry_date)}</span>
                  </div>
                  <div>
                    {license.document_url && (
                      <a 
                        href={license.document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  onClick={() => deleteLicense(license.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LicensesForm;
