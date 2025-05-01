import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, Trash2, FileText } from "lucide-react";
import EmptyDesignState from "./EmptyDesignState";
import DesignTabHeader from "./DesignTabHeader";
import BeforePhotosCard from "./BeforePhotosCard";
import RoomMeasurementsCard from './RoomMeasurementsCard';
import { PropertyFileUpload } from "@/components/property/PropertyFileUpload";
import { FileWithPreview } from "@/components/ui/file-upload";
import SelectProjectFilesDialog from "./SelectProjectFilesDialog";
import { toast } from "@/hooks/use-toast";

interface RoomDetailsProps {
  area: string;
  location?: string;
  designers?: Array<{ id: string; businessName: string; }>;
  designAssets?: Array<{ name: string; url: string; type?: string; }>;
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    unit: 'ft' | 'm';
    additionalNotes?: string;
  };
  onAddDesigner?: () => void;
  onUploadAssets?: (assets: Array<{ name: string; url: string; type?: string; }>) => void;
  onRemoveAsset?: (assetUrl: string) => void;
  onSaveMeasurements?: (measurements: any) => void;
  propertyPhotos?: string[];
  onSelectBeforePhotos?: (photos: string[]) => void;
  onUploadBeforePhotos?: (photos: string[]) => void;
  beforePhotos?: string[];
  projectId?: string;
  onSelectProjectFiles?: (files: string[]) => void;
}

const RoomDetails = ({
  area,
  location,
  designers,
  designAssets = [],
  measurements,
  onAddDesigner,
  onUploadAssets,
  onRemoveAsset,
  onSaveMeasurements = () => {},
  propertyPhotos = [],
  onSelectBeforePhotos,
  onUploadBeforePhotos,
  beforePhotos = [],
  projectId,
  onSelectProjectFiles
}: RoomDetailsProps) => {
  const hasDesigner = designers && designers.length > 0;
  const [roomFiles, setRoomFiles] = useState<FileWithPreview[]>([]);
  const [showProjectFilesDialog, setShowProjectFilesDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Initialize roomFiles with existing designAssets when component mounts or designAssets changes
    if (designAssets && designAssets.length > 0) {
      const updatedRoomFiles = designAssets.map((asset, index) => ({
        id: `asset-${index}`,
        name: asset.name,
        url: asset.url,
        size: 'Unknown',
        type: asset.type || (asset.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        progress: 100,
        status: 'complete' as const,
        tags: []
      }));
      
      setRoomFiles(updatedRoomFiles);
    }
  }, [designAssets]);

  const handleFilesUploaded = (files: FileWithPreview[]) => {
    // Keep track of newly uploaded files
    const newFiles = files.filter(file => file.status === 'complete' && file.url);
    
    // Convert FileWithPreview to design assets format
    const newAssets = newFiles.map(file => ({
      name: file.name,
      url: file.url as string,
      type: file.type
    }));
    
    // Only call onUploadAssets if there are new assets and the function exists
    if (newAssets.length > 0 && onUploadAssets) {
      onUploadAssets(newAssets);
    }
  };

  const handleSelectProjectFiles = (files: string[]) => {
    if (onSelectProjectFiles && files.length > 0) {
      onSelectProjectFiles(files);
    }
  };

  const handleRemoveAsset = (url: string) => {
    if (onRemoveAsset) {
      onRemoveAsset(url);
      toast({
        title: "Asset removed",
        description: "The design asset has been removed from this room."
      });
    }
  };

  const handlePreviewAsset = (url: string) => {
    setPreviewUrl(url);
    window.open(url, '_blank');
  };

  const handleDownloadAsset = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col space-y-6">
      <Card>
        <CardContent className="p-6">
          <DesignTabHeader area={area} location={location} />
          
          {/* Designer Section */}
          <div className="mt-6">
            {hasDesigner ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Designer</h3>
                  <p className="text-sm text-gray-500 mt-1">Assigned project designer</p>
                </div>
                <div className="space-y-3">
                  {designers.map((designer, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                        {designer.businessName[0]}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{designer.businessName}</p>
                        <p className="text-sm text-gray-500">Project Designer</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyDesignState 
                type="designer" 
                onAction={onAddDesigner}
              />
            )}
          </div>

          {/* Design Assets Section */}
          <div className="pt-6 mt-6 border-t border-gray-100">
            <div>
              <h3 className="font-semibold">Design Assets</h3>
              <p className="text-sm text-gray-500 mt-1">Project documentation</p>
            </div>
            
            {/* Always show the upload interface */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm">Upload project documentation</div>
                {projectId && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowProjectFilesDialog(true)}
                  >
                    Select from Project Files
                  </Button>
                )}
              </div>

              {/* Display existing assets */}
              {designAssets && designAssets.length > 0 && (
                <div className="grid gap-3 mb-6">
                  {designAssets.map((asset, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-grow overflow-hidden">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm text-gray-700 truncate flex-grow">{asset.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handlePreviewAsset(asset.url)} title="Preview">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDownloadAsset(asset.url, asset.name)} title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleRemoveAsset(asset.url)} title="Remove">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <PropertyFileUpload
                accept="image/*, .pdf, .dwg, .doc, .docx, .xls"
                multiple={true}
                label={`Upload ${area} Design Plans and Specs`}
                description="Upload project documentation, plans, specifications, or materials"
                onFilesUploaded={handleFilesUploaded}
                roomOptions={[
                  { value: "blueprint", label: "Blueprint" },
                  { value: "floorPlan", label: "Floor Plan" },
                  { value: "elevation", label: "Elevation" },
                  { value: "materials", label: "Materials" },
                  { value: "fixtures", label: "Fixtures" },
                  { value: "finishes", label: "Finishes" },
                  { value: "specifications", label: "Specifications" }
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Measurements Section */}
      <RoomMeasurementsCard 
        area={area}
        measurements={measurements}
        onSaveMeasurements={onSaveMeasurements}
      />

      <BeforePhotosCard
        area={area}
        beforePhotos={beforePhotos}
        propertyPhotos={propertyPhotos}
        onSelectBeforePhotos={onSelectBeforePhotos!}
        onUploadBeforePhotos={onUploadBeforePhotos!}
      />

      {/* Project Files Selection Dialog */}
      {projectId && (
        <SelectProjectFilesDialog
          open={showProjectFilesDialog}
          onOpenChange={setShowProjectFilesDialog}
          projectId={projectId}
          onSelect={handleSelectProjectFiles}
        />
      )}
    </div>
  );
};

export default RoomDetails;
