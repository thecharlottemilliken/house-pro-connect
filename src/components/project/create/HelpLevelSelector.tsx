
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface HelpLevelSelectorProps {
  helpLevel: string;
  onHelpLevelChange: (value: string) => void;
}

const HelpLevelSelector: React.FC<HelpLevelSelectorProps> = ({
  helpLevel,
  onHelpLevelChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">How much help do you need?</h3>
      <p className="text-sm text-gray-600 mb-6">
        Let us know your preferred level of involvement in managing your renovation project.
      </p>

      <RadioGroup 
        value={helpLevel} 
        onValueChange={onHelpLevelChange}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="flex flex-col">
          <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Do it for me</div>
              <RadioGroupItem value="high" id="high" />
            </div>
            <Label htmlFor="high" className="text-sm text-gray-600 cursor-pointer">
              I want a fully managed experience with minimal involvement from my side.
            </Label>
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="border border-[#174c65] bg-[#f8fcfd] rounded-lg p-4 cursor-pointer hover:bg-[#f0f9fc] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-[#174c65]">Help me through it</div>
              <RadioGroupItem value="medium" id="medium" />
            </div>
            <Label htmlFor="medium" className="text-sm text-[#205a73] cursor-pointer">
              I want guidance and support while still having input on key decisions.
            </Label>
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">I'll handle it</div>
              <RadioGroupItem value="low" id="low" />
            </div>
            <Label htmlFor="low" className="text-sm text-gray-600 cursor-pointer">
              I'm experienced and just need tools to manage my project independently.
            </Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default HelpLevelSelector;
