
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface CoachPreferenceSelectorProps {
  wantProjectCoach: string;
  setWantProjectCoach: (value: string) => void;
}

export const CoachPreferenceSelector: React.FC<CoachPreferenceSelectorProps> = ({
  wantProjectCoach,
  setWantProjectCoach,
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Do you want to work with a project coach?</h3>
      <RadioGroup 
        value={wantProjectCoach} 
        onValueChange={setWantProjectCoach}
        className="flex flex-col space-y-3"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="yes" />
          <Label htmlFor="yes">Yes, manage it for me</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="no" />
          <Label htmlFor="no">No, I'll manage it myself</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="not-sure" id="not-sure" />
          <Label htmlFor="not-sure">I'm not sure</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
