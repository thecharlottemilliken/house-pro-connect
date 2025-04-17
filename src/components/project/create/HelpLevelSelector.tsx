
interface HelpLevelSelectorProps {
  helpLevel: string;
  onHelpLevelChange: (level: string) => void;
}

const HelpLevelSelector = ({ helpLevel, onHelpLevelChange }: HelpLevelSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">How much help are you looking for?</h3>
      <p className="text-sm text-gray-600 mb-6">
        This range will help us understand what you are prepared to invest in this renovation. 
        The final quote will be dependent on the final project specs.
      </p>
      
      <div className="relative py-6">
        <div className="h-1 bg-gray-200 rounded-full">
          <div className="absolute h-1 bg-[#E77C2B] rounded-full" style={{ 
            width: helpLevel === "low" ? "33%" : helpLevel === "medium" ? "66%" : "100%" 
          }}></div>
        </div>
        
        <div className="flex justify-between mt-2">
          <div className="w-1/3 text-center">
            <button 
              className={`w-4 h-4 rounded-full -mt-4 mb-2 mx-auto block ${helpLevel === "low" ? "bg-[#E77C2B] ring-4 ring-[#E77C2B]/20" : "bg-gray-300"}`}
              onClick={() => onHelpLevelChange("low")}
            ></button>
            <p className="text-xs font-medium">Do it for me</p>
          </div>
          
          <div className="w-1/3 text-center">
            <button 
              className={`w-4 h-4 rounded-full -mt-4 mb-2 mx-auto block ${helpLevel === "medium" ? "bg-[#E77C2B] ring-4 ring-[#E77C2B]/20" : "bg-gray-300"}`}
              onClick={() => onHelpLevelChange("medium")}
            ></button>
            <p className="text-xs font-medium">I can do some things</p>
          </div>
          
          <div className="w-1/3 text-center">
            <button 
              className={`w-4 h-4 rounded-full -mt-4 mb-2 mx-auto block ${helpLevel === "high" ? "bg-[#E77C2B] ring-4 ring-[#E77C2B]/20" : "bg-gray-300"}`}
              onClick={() => onHelpLevelChange("high")}
            ></button>
            <p className="text-xs font-medium">I can do most of it</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpLevelSelector;
