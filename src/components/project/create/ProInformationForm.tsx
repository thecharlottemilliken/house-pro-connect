
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const ProInformationForm = ({ pros, onProUpdate, onAddPro }: ProInformationFormProps) => {
  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold">Pro Information</h3>
      
      {pros.map((pro, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <Input
              type="text"
              placeholder="Name"
              value={pro.businessName}
              onChange={(e) => onProUpdate(index, "businessName", e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <Input
              type="text"
              placeholder="Name"
              value={pro.contactName}
              onChange={(e) => onProUpdate(index, "contactName", e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              placeholder="email@gmail.com"
              value={pro.email}
              onChange={(e) => onProUpdate(index, "email", e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <Input
              type="tel"
              placeholder="000 000 0000"
              value={pro.phone}
              onChange={(e) => onProUpdate(index, "phone", e.target.value)}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Speciality
            </label>
            <Select 
              value={pro.speciality} 
              onValueChange={(value) => onProUpdate(index, "speciality", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a speciality" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="tiling">Tiling</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="carpentry">Carpentry</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="general">General Contractor</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
      
      <Button 
        variant="outline" 
        className="flex items-center text-[#174c65] border-[#174c65]"
        onClick={onAddPro}
      >
        <Plus className="w-4 h-4 mr-2" /> ADD ANOTHER PRO
      </Button>
    </div>
  );
};

export default ProInformationForm;
