
import React, { useState } from 'react';
import { Info, Building, MapPin, Settings, ChevronDown, ChevronUp } from "lucide-react";

interface ProjectInfoHeaderProps {
  projectData: any;
  propertyDetails: any;
}

export function ProjectInfoHeader({ projectData, propertyDetails }: ProjectInfoHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const renovationAreas = projectData?.renovation_areas || [];
  
  const description = projectData?.description || 'No description provided';
  const isLongDescription = description.length > 100;
  
  const toggleDescription = () => {
    setShowFullDescription(prev => !prev);
  };
  
  const displayDescription = isLongDescription && !showFullDescription
    ? `${description.substring(0, 100)}...`
    : description;

  return (
    <div className="border-b">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-semibold">Project Information</h2>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="px-4 py-3 space-y-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Project Description</h3>
              <p className="text-sm text-gray-500">
                {displayDescription}
                {isLongDescription && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDescription();
                    }} 
                    className="ml-1 text-blue-500 hover:text-blue-700 font-medium"
                  >
                    {showFullDescription ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Property</h3>
              <p className="text-sm text-gray-500">{propertyDetails?.property_name || 'No property name'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Location</h3>
              <p className="text-sm text-gray-500">{propertyDetails?.address || 'No address'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Renovation Areas</h3>
              <div className="text-sm text-gray-500">
                {renovationAreas.length > 0 ? (
                  renovationAreas.map((area: any, index: number) => (
                    <span key={index} className="inline-block mr-2 mb-1">
                      {area.area}{index < (renovationAreas.length - 1) ? ',' : ''}
                    </span>
                  ))
                ) : (
                  <span>No renovation areas defined</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
