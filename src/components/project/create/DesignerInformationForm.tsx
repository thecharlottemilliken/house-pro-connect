
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DesignerInformationFormProps {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  assignedArea: string;
  renovationAreas: Array<{area: string; location?: string}>;
  onUpdate: (field: string, value: string) => void;
}

const DesignerInformationForm = ({ 
  businessName, 
  contactName, 
  email, 
  phone, 
  assignedArea,
  renovationAreas,
  onUpdate 
}: DesignerInformationFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Name
        </label>
        <Input
          type="text"
          placeholder="Design Studio Name"
          value={businessName}
          onChange={(e) => onUpdate("businessName", e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Name
        </label>
        <Input
          type="text"
          placeholder="Designer's Name"
          value={contactName}
          onChange={(e) => onUpdate("contactName", e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <Input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => onUpdate("email", e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <Input
          type="tel"
          placeholder="000 000 0000"
          value={phone}
          onChange={(e) => onUpdate("phone", e.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assigned Room
        </label>
        <Select 
          value={assignedArea} 
          onValueChange={(value) => onUpdate("assignedArea", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a room to assign" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all_rooms">All Rooms</SelectItem>
              {renovationAreas.map((area) => (
                <SelectItem key={area.area} value={area.area}>{area.area}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DesignerInformationForm;
