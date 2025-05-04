
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Pro {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  speciality: string;
}

interface ProInformationFormProps {
  pros: Pro[];
  onProUpdate: (index: number, field: string, value: string) => void;
  onAddPro: () => void;
}

const ProInformationForm: React.FC<ProInformationFormProps> = ({
  pros,
  onProUpdate,
  onAddPro,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">Pro Information</h3>
      
      {pros.map((pro, index) => (
        <div key={index} className="p-6 border border-gray-200 rounded-lg space-y-4">
          <h4 className="font-medium text-base mb-4">{`Pro ${index + 1}`}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <Input
                type="text"
                value={pro.businessName}
                onChange={(e) => onProUpdate(index, 'businessName', e.target.value)}
                placeholder="Business name"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <Input
                type="text"
                value={pro.contactName}
                onChange={(e) => onProUpdate(index, 'contactName', e.target.value)}
                placeholder="Contact name"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={pro.email}
                onChange={(e) => onProUpdate(index, 'email', e.target.value)}
                placeholder="Email address"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                type="tel"
                value={pro.phone}
                onChange={(e) => onProUpdate(index, 'phone', e.target.value)}
                placeholder="Phone number"
                className="w-full"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <Select 
                value={pro.speciality} 
                onValueChange={(value) => onProUpdate(index, 'speciality', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Contractor</SelectItem>
                  <SelectItem value="plumber">Plumber</SelectItem>
                  <SelectItem value="electrician">Electrician</SelectItem>
                  <SelectItem value="carpenter">Carpenter</SelectItem>
                  <SelectItem value="painter">Painter</SelectItem>
                  <SelectItem value="hvac">HVAC Specialist</SelectItem>
                  <SelectItem value="interior-designer">Interior Designer</SelectItem>
                  <SelectItem value="architect">Architect</SelectItem>
                  <SelectItem value="landscaper">Landscaper</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={onAddPro}
        className="mt-4 text-[#174c65] border-[#174c65]"
      >
        + Add Another Pro
      </Button>
    </div>
  );
};

export default ProInformationForm;
