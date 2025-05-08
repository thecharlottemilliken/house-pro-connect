
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import DesignTabHeader from "./DesignTabHeader";
import DesignerDisplay from "./room-details/DesignerDisplay";
import RoomPropertyInfo from "./room-details/RoomPropertyInfo";
import DesignAssetsSection from "./room-details/DesignAssetsSection";
import FileSelectionDialog from "./room-details/SelectProjectFilesDialog";

interface RoomDetailsProps {
  area: string;
  location?: string;
  designers?: Array<{ id: string; businessName: string; }>;
  designAssets?: Array<{ name: string; url: string; tags?: string[]; }>;
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  };
  onAddDesigner?: () => void;
  onUploadAssets?: () => void;
  onSaveMeasurements?: (measurements: any) => void;
  propertyPhotos?: string[];
  onSelectBeforePhotos?: (photos: string[]) => void;
  onUploadBeforePhotos?: (photos: string[]) => void;
  beforePhotos?: string[];
  projectId?: string;
  onSelectProjectFiles?: (files: string[]) => void;
  onRemoveDesignAsset?: (index: number) => void;
  onUpdateAssetTags?: (assetIndex: number, tags: string[]) => void;
  roomId?: string; 
}

const RoomDetails = ({
  area,
  location,
  designers = [],
  designAssets = [],
  measurements,
  onAddDesigner,
  onUploadAssets = () => {},
  onSaveMeasurements = () => {},
  propertyPhotos = [],
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  beforePhotos = [],
  projectId,
  onSelectProjectFiles,
  onRemoveDesignAsset,
  onUpdateAssetTags,
  roomId
}: RoomDetailsProps) => {
  const [showProjectFilesDialog, setShowProjectFilesDialog] = useState(false);

  const handleSelectProjectFiles = (files: string[]) => {
    if (onSelectProjectFiles) {
      // Pass the selected files and roomId
      onSelectProjectFiles(files);
    }
  };

  return (
    <Card className="overflow-hidden rounded-lg border shadow-sm h-full">
      <CardContent className="p-6">
        <DesignTabHeader area={area} location={location} />
        
        {/* Property Information Section */}
        <div className="space-y-4 mb-8">
          <DesignerDisplay designers={designers} />
          <RoomPropertyInfo 
            area={area}
            location={location}
            measurements={measurements}
          />
        </div>

        {/* Design Assets Section */}
        <DesignAssetsSection
          designAssets={designAssets}
          onRemoveDesignAsset={onRemoveDesignAsset}
          onUpdateAssetTags={onUpdateAssetTags}
          projectId={projectId}
          onSelectProjectFiles={handleSelectProjectFiles}
        />
      </CardContent>

      {/* Project Files Selection Dialog */}
      {projectId && (
        <FileSelectionDialog
          open={showProjectFilesDialog}
          onOpenChange={setShowProjectFilesDialog}
          projectId={projectId}
          onSelect={handleSelectProjectFiles}
        />
      )}
    </Card>
  );
};

export default RoomDetails;
