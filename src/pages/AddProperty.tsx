import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/ui/file-upload";
import { PropertyImageCarousel } from "@/components/property/PropertyImageCarousel";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { HomeAttributesSelect } from "@/components/property/HomeAttributesSelect";
import { PropertyLinkInput } from "@/components/property/PropertyLinkInput";

const AddProperty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [propertyName, setPropertyName] = useState("");
  const [isWorkingOnBehalf, setIsWorkingOnBehalf] = useState(false);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [sqft, setSqft] = useState("");
  const [homeType, setHomeType] = useState("");
  const [homePurpose, setHomePurpose] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  
  // Combined attributes
  const [attributes, setAttributes] = useState<string[]>([]);
  
  const [blueprintUrl, setBlueprintUrl] = useState<string | null>(null);
  const [homePhotos, setHomePhotos] = useState<string[]>([]);

  const handleAddressSelect = (address: {
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
  }) => {
    setAddressLine1(address.addressLine1);
    setCity(address.city);
    setState(address.state);
    setZipCode(address.zipCode);
  };

  const handlePropertyDataFetched = (data: any) => {
    if (data.address) {
      data.address.street && setAddressLine1(data.address.street);
      data.address.city && setCity(data.address.city);
      data.address.state && setState(data.address.state);
      data.address.zipCode && setZipCode(data.address.zipCode);
    }
    
    data.sqft && setSqft(data.sqft);
    data.bedrooms && setBedrooms(data.bedrooms);
    data.bathrooms && setBathrooms(data.bathrooms);
    data.propertyType && setHomeType(data.propertyType.toLowerCase());
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a property.",
        variant: "destructive"
      });
      return;
    }

    if (!propertyName || !addressLine1 || !city || !state || !zipCode) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          property_name: propertyName,
          working_on_behalf: isWorkingOnBehalf,
          address_line1: addressLine1,
          address_line2: addressLine2 || null,
          city,
          state,
          zip_code: zipCode,
          sqft: sqft || null,
          home_type: homeType || null,
          home_purpose: homePurpose || null,
          bedrooms: bedrooms || null,
          bathrooms: bathrooms || null,
          exterior_attributes: attributes,
          interior_attributes: attributes,
          blueprint_url: blueprintUrl,
          home_photos: homePhotos
        })
        .select();

      if (error) throw error;

      toast({
        title: "Property added",
        description: "Your property has been added successfully."
      });
      
      navigate("/create-project");
    } catch (error: any) {
      console.error("Error saving property:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add property. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Select a Property", current: true },
    { number: 2, title: "Select Renovation Areas", current: false },
    { number: 3, title: "Project Preferences", current: false },
    { number: 4, title: "Construction Preferences", current: false },
    { number: 5, title: "Design Preferences", current: false },
    { number: 6, title: "Management Preferences", current: false },
    { number: 7, title: "Prior Experience", current: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      
      <div className="flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <div className="w-full md:w-80 bg-[#EFF3F7] p-4 md:p-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Create a Project</h1>
          <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
            Lorem ipsum dolor sit amet consectetur.
          </p>
          
          <div className="space-y-4 md:space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start">
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center mr-2 md:mr-3 ${
                  step.current ? "bg-[#174c65] text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {step.number}
                </div>
                <div>
                  <h3 className={`text-sm md:text-base font-medium ${
                    step.current ? "text-[#174c65]" : "text-gray-500"
                  }`}>
                    Step {step.number}
                  </h3>
                  <p className={`text-xs md:text-sm ${
                    step.current ? "text-black" : "text-gray-500"
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-4 md:p-10 overflow-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Select a Property</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8 max-w-3xl">
            To get started, fill out a high-level summary of the project so specialists can get an idea of the type of project underway. Next, select when you want your bids due by.
          </p>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add a Property</h3>
            
            {/* Property Form */}
            <div className="space-y-6 md:space-y-8">
              {/* Property Link Input - Added at the top of the form */}
              <PropertyLinkInput onPropertyDataFetched={handlePropertyDataFetched} />
              
              {/* Property Name */}
              <div>
                <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter a Property Nick Name
                </label>
                <Input 
                  id="propertyName" 
                  placeholder="Family Home" 
                  value={propertyName} 
                  onChange={(e) => setPropertyName(e.target.value)} 
                  className="w-full"
                />
              </div>
              
              {/* Working on behalf checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="workingOnBehalf" 
                  checked={isWorkingOnBehalf} 
                  onCheckedChange={(checked) => setIsWorkingOnBehalf(checked as boolean)} 
                />
                <label htmlFor="workingOnBehalf" className="text-sm font-medium text-gray-700">
                  I am working on behalf of the home owner
                </label>
              </div>
              
              {/* Home Address Section */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Home Address</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <AddressAutocomplete onAddressSelect={handleAddressSelect} />
                  </div>
                  
                  <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <Input 
                      id="addressLine2" 
                      placeholder="Apt, Suite, etc." 
                      value={addressLine2} 
                      onChange={(e) => setAddressLine2(e.target.value)} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <Input 
                        id="city" 
                        placeholder="City" 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <Select value={state} onValueChange={setState}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AL">Alabama</SelectItem>
                          <SelectItem value="AK">Alaska</SelectItem>
                          <SelectItem value="AZ">Arizona</SelectItem>
                          <SelectItem value="AR">Arkansas</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="CO">Colorado</SelectItem>
                          <SelectItem value="CT">Connecticut</SelectItem>
                          <SelectItem value="DE">Delaware</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="GA">Georgia</SelectItem>
                          <SelectItem value="HI">Hawaii</SelectItem>
                          <SelectItem value="ID">Idaho</SelectItem>
                          <SelectItem value="IL">Illinois</SelectItem>
                          <SelectItem value="IN">Indiana</SelectItem>
                          <SelectItem value="IA">Iowa</SelectItem>
                          <SelectItem value="KS">Kansas</SelectItem>
                          <SelectItem value="KY">Kentucky</SelectItem>
                          <SelectItem value="LA">Louisiana</SelectItem>
                          <SelectItem value="ME">Maine</SelectItem>
                          <SelectItem value="MD">Maryland</SelectItem>
                          <SelectItem value="MA">Massachusetts</SelectItem>
                          <SelectItem value="MI">Michigan</SelectItem>
                          <SelectItem value="MN">Minnesota</SelectItem>
                          <SelectItem value="MS">Mississippi</SelectItem>
                          <SelectItem value="MO">Missouri</SelectItem>
                          <SelectItem value="MT">Montana</SelectItem>
                          <SelectItem value="NE">Nebraska</SelectItem>
                          <SelectItem value="NV">Nevada</SelectItem>
                          <SelectItem value="NH">New Hampshire</SelectItem>
                          <SelectItem value="NJ">New Jersey</SelectItem>
                          <SelectItem value="NM">New Mexico</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="NC">North Carolina</SelectItem>
                          <SelectItem value="ND">North Dakota</SelectItem>
                          <SelectItem value="OH">Ohio</SelectItem>
                          <SelectItem value="OK">Oklahoma</SelectItem>
                          <SelectItem value="OR">Oregon</SelectItem>
                          <SelectItem value="PA">Pennsylvania</SelectItem>
                          <SelectItem value="RI">Rhode Island</SelectItem>
                          <SelectItem value="SC">South Carolina</SelectItem>
                          <SelectItem value="SD">South Dakota</SelectItem>
                          <SelectItem value="TN">Tennessee</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="UT">Utah</SelectItem>
                          <SelectItem value="VT">Vermont</SelectItem>
                          <SelectItem value="VA">Virginia</SelectItem>
                          <SelectItem value="WA">Washington</SelectItem>
                          <SelectItem value="WV">West Virginia</SelectItem>
                          <SelectItem value="WI">Wisconsin</SelectItem>
                          <SelectItem value="WY">Wyoming</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-3">
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code
                      </label>
                      <Input 
                        id="zipCode" 
                        placeholder="00000" 
                        value={zipCode} 
                        onChange={(e) => setZipCode(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Home Specs Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Home Specs</h3>
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6">
                      <label htmlFor="homeType" className="block text-sm font-medium text-gray-700 mb-1">
                        Home Type
                      </label>
                      <Select value={homeType} onValueChange={setHomeType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single-family">Single Family</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="condo">Condo</SelectItem>
                          <SelectItem value="multi-family">Multi-Family</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-12 md:col-span-6">
                      <label htmlFor="homePurpose" className="block text-sm font-medium text-gray-700 mb-1">
                        Home Purpose
                      </label>
                      <Select value={homePurpose} onValueChange={setHomePurpose}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary Residence</SelectItem>
                          <SelectItem value="vacation">Vacation Home</SelectItem>
                          <SelectItem value="rental">Rental Property</SelectItem>
                          <SelectItem value="investment">Investment Property</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-12">
                      <label htmlFor="sqft" className="block text-sm font-medium text-gray-700 mb-1">
                        SQFT
                      </label>
                      <Input 
                        id="sqft" 
                        placeholder="SQFT" 
                        value={sqft} 
                        onChange={(e) => setSqft(e.target.value)} 
                      />
                      <p className="text-xs text-gray-500 mt-1">Estimate if you don't know.</p>
                    </div>
                    
                    <div className="col-span-6">
                      <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                        Bedrooms
                      </label>
                      <Select value={bedrooms} onValueChange={setBedrooms}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5+">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-6">
                      <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                        Bathrooms
                      </label>
                      <Select value={bathrooms} onValueChange={setBathrooms}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="1.5">1.5</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="2.5">2.5</SelectItem>
                          <SelectItem value="3+">3+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              
                {/* Home Attributes Section - Using our new component */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Home Attributes</h3>
                  <HomeAttributesSelect 
                    selectedAttributes={attributes}
                    onAttributesChange={setAttributes}
                  />
                </div>
              </div>
              
              {/* Upload Files */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Upload Files</h3>
                <div className="space-y-4">
                  <FileUpload
                    accept=".pdf,.dwg"
                    onUploadComplete={(urls) => setBlueprintUrl(urls[0])}
                    label="Upload specs and/or blueprints"
                    description="PDF or DWG"
                  />
                  <FileUpload
                    accept="image/*,.pdf"
                    multiple
                    onUploadComplete={(urls) => setHomePhotos(urls)}
                    label="Upload home photos"
                    description="PNG, JPG, or PDF"
                  />
                </div>
              </div>
              
              {homePhotos.length > 0 && (
                <div className="my-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Property Photos</h3>
                  <PropertyImageCarousel images={homePhotos} />
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-gray-200 gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center text-[#174c65]"
                  onClick={() => navigate("/create-project")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> BACK
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="text-[#174c65] border-[#174c65]"
                    onClick={() => navigate("/create-project")}
                  >
                    CANCEL
                  </Button>
                  <Button
                    className="bg-[#174c65]"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'SAVING...' : 'ADD PROPERTY'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AttributeToggleButtonProps {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

const AttributeToggleButton = ({ children, selected, onClick }: AttributeToggleButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-full border ${
        selected 
          ? 'bg-[#174c65] text-white border-[#174c65]' 
          : 'bg-white text-gray-700 border-gray-300'
      } transition-colors`}
    >
      {selected && <span className="mr-1">✓</span>}
      {children}
    </button>
  );
};

export default AddProperty;
