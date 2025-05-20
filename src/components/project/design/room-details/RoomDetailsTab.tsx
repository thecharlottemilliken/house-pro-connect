
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import DesignAssetsSection from "./DesignAssetsSection";

interface RoomDetailsTabProps {
  roomName: string;
  roomId?: string;
  designPreferences: any;
  roomPreferences: any;
  projectId: string;
  propertyId?: string; // Add propertyId prop
  onAddProjectFiles: (files: string[]) => void;
  onRemoveDesignAsset: (index: number) => void;
  onUpdateAssetTags: (assetIndex: number, tags: string[]) => void;
  onAddInspirationImages: (images: any[], roomId?: string) => Promise<any>;
  onAddPinterestBoards: (boards: any[], roomName?: string, roomId?: string) => Promise<any>;
}

const RoomDetailsTab: React.FC<RoomDetailsTabProps> = ({
  roomName,
  roomId,
  designPreferences,
  roomPreferences,
  projectId,
  propertyId,
  onAddProjectFiles,
  onRemoveDesignAsset,
  onUpdateAssetTags,
  onAddInspirationImages,
  onAddPinterestBoards
}) => {
  // Get design assets for this room (filter by room tag)
  const roomDesignAssets = Array.isArray(designPreferences?.designAssets) 
    ? designPreferences.designAssets.filter((asset: any) => 
        Array.isArray(asset?.tags) && asset.tags.includes(roomName)
      )
    : [];
  
  return (
    <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white text-black h-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-2xl">Room Details</h3>
        </div>
        
        <DesignAssetsSection 
          designAssets={roomDesignAssets}
          onRemoveDesignAsset={onRemoveDesignAsset}
          onUpdateAssetTags={onUpdateAssetTags}
          projectId={projectId}
          propertyId={propertyId}
          onSelectProjectFiles={onAddProjectFiles}
        />
      </CardContent>
    </Card>
  );
};

export default RoomDetailsTab;
