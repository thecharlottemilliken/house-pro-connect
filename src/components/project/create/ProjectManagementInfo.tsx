
import React from "react";
import { Check } from "lucide-react";

export const ProjectManagementInfo: React.FC = () => {
  return (
    <div className="w-full md:w-80 bg-gray-50 p-5 rounded-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">How project management works</h3>
        <p className="text-sm text-gray-600">
          Lorem ipsum dolor sit amet consectetur. Pellentesque feugiat augue enim fringilla orci elit tincidunt at. Id fames ut sapien etiam pulvinar. Non posuere vel sit sed morbi sit cursus magna id. Ut blandit cras etiam est amet maecenas.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Things a project coach will help with</h3>
        
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex items-start">
              <div className="mt-1 mr-3 h-5 w-5 flex items-center justify-center rounded-full bg-[#174c65] text-white">
                <Check className="h-3 w-3" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Step one description here</h4>
                <p className="text-xs text-gray-600">
                  Lorem ipsum dolor sit amet consectetur. Pellentesque feugiat augue enim fringilla orci elit tincidunt at.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
