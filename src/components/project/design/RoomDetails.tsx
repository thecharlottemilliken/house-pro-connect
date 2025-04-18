import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import EmptyDesignState from "./EmptyDesignState";
import DesignTabHeader from "./DesignTabHeader";
import BeforePhotosCard from "./BeforePhotosCard";

interface RoomDetailsProps {
  area: string;
  location?: string;
  designers?: Array<{ id: string; businessName: string; }>;
  designAssets?: Array<{ name: string; url: string; }>;
  onAddDesigner?: () => void;
  onUploadAssets?: () => void;
  propertyPhotos?: string[];
  onSelectBeforePhotos?: (photos: string[]) => void;
  onUploadBeforePhotos?: (photos: string[]) => void;
  beforePhotos?: string[];
}

const RoomDetails = ({
  area,
  location,
  designers,
  designAssets,
  onAddDesigner,
  onUploadAssets,
  propertyPhotos = [],
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  beforePhotos = []
}: RoomDetailsProps) => {
  const hasDesigner = designers && designers.length > 0;

  return (
    <div className="space-y-6">
      {/* Room Details Card */}
      <Card className="shadow-lg border-gray-200/50">
        <CardContent className="p-6">
          <DesignTabHeader area={area} location={location} />
          
          {/* Designer Section */}
          {hasDesigner ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Designer</h3>
                <p className="text-sm text-gray-500 mt-1">Assigned project designer</p>
              </div>
              {designers.map((designer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      {designer.businessName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{designer.businessName}</p>
                      <p className="text-sm text-gray-500">Project Designer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyDesignState 
              type="designer" 
              onAction={onAddDesigner}
            />
          )}

          {/* Design Assets Section */}
          {designAssets && designAssets.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Design Assets</h3>
                <p className="text-sm text-gray-500 mt-1">Project documentation and specifications</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {designAssets.map((asset, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{asset.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Before Photos Card */}
      <BeforePhotosCard
        beforePhotos={beforePhotos}
        propertyPhotos={propertyPhotos}
        onSelectBeforePhotos={onSelectBeforePhotos!}
        onUploadBeforePhotos={onUploadBeforePhotos!}
      />
    </div>
  );
};

export default RoomDetails;
