
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpFromLine } from "lucide-react";

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
  
  // Exterior and Interior Attributes
  const [exteriorAttributes, setExteriorAttributes] = useState<string[]>([]);
  const [interiorAttributes, setInteriorAttributes] = useState<string[]>([]);

  const toggleExteriorAttribute = (attribute: string) => {
    setExteriorAttributes(prev => 
      prev.includes(attribute) 
        ? prev.filter(attr => attr !== attribute) 
        : [...prev, attribute]
    );
  };

  const toggleInteriorAttribute = (attribute: string) => {
    setInteriorAttributes(prev => 
      prev.includes(attribute) 
        ? prev.filter(attr => attr !== attribute) 
        : [...prev, attribute]
    );
  };
  
  const handleSubmit = () => {
    const newProperty = {
      id: Date.now(),
      type: propertyName,
      image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      address: `${addressLine1}, ${city}, ${state} ${zipCode}`,
      details: {
        sqft,
        homeType,
        homePurpose,
        bedrooms,
        bathrooms,
        exteriorAttributes,
        interiorAttributes
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
                    Address Line 1
                  </label>
                  <Input 
                    id="addressLine1" 
                    placeholder="Street Dr." 
                    value={addressLine1} 
                    onChange={(e) => setAddressLine1(e.target.value)} 
                  />
                </div>
                
                <div>
                  <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <Input 
                    id="addressLine2" 
                    placeholder="1263" 
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
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="CO">Colorado</SelectItem>
                        <SelectItem value="CT">Connecticut</SelectItem>
                        <SelectItem value="UT">Utah</SelectItem>
                        {/* Add more states as needed */}
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
            
            {/* Optional Home Information */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Optional Home Information</h3>
              
              {/* Exterior Attributes */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Exterior Attributes</h4>
                <div className="flex flex-wrap gap-2">
                  <AttributeToggleButton 
                    selected={exteriorAttributes.includes("Front Yard")}
                    onClick={() => toggleExteriorAttribute("Front Yard")}
                  >
                    Front Yard
                  </AttributeToggleButton>
                  
                  <AttributeToggleButton 
                    selected={exteriorAttributes.includes("Back Yard")}
                    onClick={() => toggleExteriorAttribute("Back Yard")}
                  >
                    Back Yard
                  </AttributeToggleButton>
                  
                  <AttributeToggleButton 
                    selected={exteriorAttributes.includes("Historic Home")}
                    onClick={() => toggleExteriorAttribute("Historic Home")}
                  >
                    Historic Home
                  </AttributeToggleButton>
                  
                  <AttributeToggleButton 
                    selected={exteriorAttributes.includes("Waterfront")}
                    onClick={() => toggleExteriorAttribute("Waterfront")}
                  >
                    Waterfront
                  </AttributeToggleButton>
                  
                  <AttributeToggleButton 
                    selected={exteriorAttributes.includes("Multi-Level")}
                    onClick={() => toggleExteriorAttribute("Multi-Level")}
                  >
                    Multi-Level
                  </AttributeToggleButton>
                </div>
              </div>
              
              {/* Interior Attributes */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Interior Attributes</h4>
                <div className="flex flex-wrap gap-2">
                  <AttributeToggleButton 
                    selected={interiorAttributes.includes("Front Yard")}
                    onClick={() => toggleInteriorAttribute("Front Yard")}
                  >
                    Front Yard
                  </AttributeToggleButton>
                  
                  <AttributeToggleButton 
                    selected={interiorAttributes.includes("Back Yard")}
                    onClick={() => toggleInteriorAttribute("Back Yard")}
                  >
                    Back Yard
                  </AttributeToggleButton>
                  
                  <AttributeToggleButton 
                    selected={interiorAttributes.includes("Historic Home")}
                    onClick={() => toggleInteriorAttribute("Historic Home")}
                  >
                    Historic Home
                  </AttributeToggleButton>
                </div>
              </div>
              
              {/* Upload Files */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Upload Files</h4>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Upload specs and/or blueprints</p>
                        <p className="text-gray-500 text-sm">PNG, JPG, PDF, or DWG</p>
                      </div>
                      <Button className="bg-[#174c65]">
                        <ArrowUpFromLine className="mr-2 h-4 w-4" /> UPLOAD
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Upload home photos</p>
                        <p className="text-gray-500 text-sm">PNG, JPG, or PDF</p>
                      </div>
                      <Button className="bg-[#174c65]">
                        <ArrowUpFromLine className="mr-2 h-4 w-4" /> UPLOAD
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
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

export default AddPropertyDialog;
