
import React, { useState, useRef } from "react";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { HomeAttributesSelect } from "@/components/property/HomeAttributesSelect";
import { PropertyLinkInput } from "@/components/property/PropertyLinkInput";
import { PropertyFileUpload } from "@/components/property/PropertyFileUpload";
import { FileWithPreview } from "@/components/ui/file-upload";

interface AddPropertyDialogProps {
  open: boolean;
  onClose: () => void;
  onAddProperty: (property: any) => void;
}

const AddPropertyDialog = ({ open, onClose, onAddProperty }: AddPropertyDialogProps) => {
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
  
  const [attributes, setAttributes] = useState<string[]>([]);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [propertyFiles, setPropertyFiles] = useState<FileWithPreview[]>([]);
  
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
      // Set address data if available
      if (data.address.street) {
        console.log("Setting address line 1 from street:", data.address.street);
        setAddressLine1(data.address.street);
        
        // Focus and update the visual state of the input if needed
        if (addressInputRef.current) {
          addressInputRef.current.value = data.address.street;
        }
      }
      
      data.address.city && setCity(data.address.city);
      data.address.state && setState(data.address.state);
      data.address.zipCode && setZipCode(data.address.zipCode);
      
      // Handle secondary address if available
      if (data.secondaryAddress) {
        setAddressLine2(data.secondaryAddress);
        console.log('Setting address line 2:', data.secondaryAddress);
      }
    }
    
    data.sqft && setSqft(data.sqft);
    data.bedrooms && setBedrooms(data.bedrooms);
    data.bathrooms && setBathrooms(data.bathrooms);
    data.propertyType && setHomeType(data.propertyType.toLowerCase());
    
    // Handle home attributes if available
    if (data.attributes && Array.isArray(data.attributes) && data.attributes.length > 0) {
      console.log(`Setting ${data.attributes.length} home attributes:`, data.attributes);
      setAttributes(data.attributes);
    }
    
    // Handle images if available
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      // Convert to our FileWithPreview format
      const newFiles: FileWithPreview[] = data.images.map((url: string, index: number) => ({
        id: `scraped-${Date.now()}-${index}`,
        name: `Image ${index + 1}`,
        size: "Unknown",
        type: "image/jpeg",
        url: url,
        progress: 100,
        tags: [],
        status: 'complete'
      }));
      
      setPropertyFiles(newFiles);
    }
  };
  
  // Handle files uploaded via the new component
  const handleFilesUploaded = (files: FileWithPreview[]) => {
    console.log("Files uploaded:", files);
  };

  const handleSubmit = async () => {
    // Extract image URLs from files
    const imageUrls = propertyFiles
      .filter(f => f.status === 'complete' && f.url && !f.type.includes('pdf'))
      .map(f => f.url as string);
    
    // Find blueprint URL if any
    const blueprintUrl = propertyFiles.find(
      f => f.status === 'complete' && f.url && 
      (f.type.includes('pdf') || f.tags.includes('blueprint'))
    )?.url;
    
    // Format file metadata for storage
    const fileMetadata = propertyFiles.map(f => ({
      name: f.name,
      url: f.url,
      type: f.type,
      tags: f.tags
    }));
    
    const newProperty = {
      id: Date.now(),
      type: propertyName,
      image: imageUrls.length > 0 ? imageUrls[0] : "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      address: `${addressLine1}, ${city}, ${state} ${zipCode}`,
      details: {
        sqft,
        homeType,
        homePurpose,
        bedrooms,
        bathrooms,
        exteriorAttributes: attributes,
        interiorAttributes: attributes,
        blueprintUrl,
        images: imageUrls,
        fileMetadata: fileMetadata
      }
    };
    
    onAddProperty(newProperty);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-auto max-h-[90vh]">
        <div className="p-6">
          <DialogTitle className="text-2xl font-bold mb-4">Add a Property</DialogTitle>
          
          <div className="space-y-6">
            <PropertyLinkInput onPropertyDataFetched={handlePropertyDataFetched} />
            
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
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Home Address</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <Input 
                      id="addressLine1" 
                      placeholder="Street address" 
                      value={addressLine1} 
                      onChange={(e) => setAddressLine1(e.target.value)} 
                      ref={addressInputRef}
                    />
                    <AddressAutocomplete onAddressSelect={handleAddressSelect} />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2 (Optional)
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
                  <div className="col-span-6 md:col-span-4">
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
                  
                  <div className="col-span-6 md:col-span-4">
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
                  
                  <div className="col-span-12 md:col-span-4">
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
              
              {/* Home Attributes using our fixed component */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Home Attributes</h3>
                <HomeAttributesSelect
                  selectedAttributes={attributes}
                  onAttributesChange={setAttributes}
                />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Upload Files</h3>
              <PropertyFileUpload 
                onFilesUploaded={handleFilesUploaded}
                initialFiles={propertyFiles}
                roomOptions={[
                  { value: "livingRoom", label: "Living Room" },
                  { value: "kitchen", label: "Kitchen" },
                  { value: "bathroom", label: "Bathroom" },
                  { value: "bedroom", label: "Bedroom" },
                  { value: "office", label: "Office" },
                  { value: "exterior", label: "Exterior" },
                  { value: "blueprint", label: "Blueprint" }
                ]}
              />
            </div>
            
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-gray-300"
              >
                CANCEL
              </Button>
              
              <Button 
                onClick={handleSubmit}
                className="bg-[#174c65]"
              >
                ADD PROPERTY
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPropertyDialog;
