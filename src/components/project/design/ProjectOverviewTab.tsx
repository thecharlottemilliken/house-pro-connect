
import React from 'react';
import { RenovationArea } from "@/hooks/useProjectData";
import { PropertyDetails } from "@/hooks/useProjectData";

interface ProjectOverviewTabProps {
  projectData: any;
  propertyDetails: PropertyDetails | null;
  isMobile: boolean;
  renovationAreas: RenovationArea[];
}

const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({
  projectData,
  propertyDetails,
  isMobile,
  renovationAreas
}) => {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium text-lg mb-3">Renovation Areas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renovationAreas.map((area) => (
              <div 
                key={area.area} 
                className="bg-gray-50 border border-gray-200 rounded-md p-4"
              >
                <p className="font-medium">{area.area}</p>
                {area.location && (
                  <p className="text-sm text-gray-500">Location: {area.location}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section>
        <h3 className="font-medium text-lg mb-3">Property Details</h3>
        <div className="bg-white rounded-lg shadow p-6">
          {propertyDetails ? (
            <div className="space-y-2">
              <p><span className="font-medium">Address:</span> {propertyDetails.address}</p>
              <p><span className="font-medium">Property Name:</span> {propertyDetails.property_name}</p>
              {propertyDetails.blueprint_url && (
                <div>
                  <p className="font-medium mb-2">Blueprint:</p>
                  <img 
                    src={propertyDetails.blueprint_url} 
                    alt="Property Blueprint" 
                    className="max-w-full h-auto border border-gray-200 rounded-md" 
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Property details not available</p>
          )}
        </div>
      </section>
      
      <section>
        <h3 className="font-medium text-lg mb-3">Design Progress</h3>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <p className="font-medium">Measurements Added:</p>
              <p className="text-gray-600">
                {(projectData?.design_preferences?.roomMeasurements && 
                 Object.keys(projectData.design_preferences.roomMeasurements).length > 0) 
                  ? `${Object.keys(projectData.design_preferences.roomMeasurements).length} areas measured`
                  : 'No measurements added yet'}
              </p>
            </div>
            
            <div>
              <p className="font-medium">Before Photos:</p>
              <p className="text-gray-600">
                {(projectData?.design_preferences?.beforePhotos &&
                 Object.values(projectData.design_preferences.beforePhotos).flat().length > 0)
                  ? `${Object.values(projectData.design_preferences.beforePhotos).flat().length} photos uploaded`
                  : 'No before photos uploaded yet'}
              </p>
            </div>
            
            <div>
              <p className="font-medium">Design Assets:</p>
              <p className="text-gray-600">
                {(projectData?.design_preferences?.designAssets &&
                 projectData.design_preferences.designAssets.length > 0)
                  ? `${projectData.design_preferences.designAssets.length} assets added`
                  : 'No design assets added yet'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectOverviewTab;
