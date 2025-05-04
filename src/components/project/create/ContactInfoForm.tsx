
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactInfoFormProps {
  phoneNumber: string;
  phoneType: string;
  onPhoneNumberChange: (value: string) => void;
  onPhoneTypeChange: (value: string) => void;
}

export const ContactInfoForm: React.FC<ContactInfoFormProps> = ({ 
  phoneNumber, 
  phoneType,
  onPhoneNumberChange,
  onPhoneTypeChange
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">What number should the coach reach you by?</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="phone" className="mb-2 block">Phone</Label>
          <Input 
            id="phone" 
            placeholder="000 000 0000" 
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phoneType" className="mb-2 block">Type</Label>
          <Select 
            value={phoneType} 
            onValueChange={onPhoneTypeChange}
          >
            <SelectTrigger id="phoneType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Cell">Cell</SelectItem>
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
