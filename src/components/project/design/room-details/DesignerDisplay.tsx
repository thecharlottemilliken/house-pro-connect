
import React from 'react';

interface DesignerDisplayProps {
  designers?: Array<{ id: string; businessName: string; }>;
}

const DesignerDisplay: React.FC<DesignerDisplayProps> = ({ designers }) => {
  const hasDesigner = designers && designers.length > 0;

  return (
    <div className="flex items-center gap-3 text-gray-700 mb-4">
      <span className="text-base font-medium">Designer:</span>
      {hasDesigner ? (
        <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-2">
            {designers![0].businessName[0]}
          </div>
          <span className="text-sm text-gray-600">Don Smith</span>
        </div>
      ) : (
        <span className="text-sm text-gray-500">Not assigned</span>
      )}
    </div>
  );
};

export default DesignerDisplay;
