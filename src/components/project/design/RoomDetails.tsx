
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Eye, Download, X, Upload, MapPin, Ruler, SquareDot } from "lucide-react";
import EmptyDesignState from "./EmptyDesignState";
import DesignTabHeader from "./DesignTabHeader";
import BeforePhotosCard from "./BeforePhotosCard";
import RoomMeasurementsCard from './RoomMeasurementsCard';
import { PropertyFileUpload } from "@/components/property/PropertyFileUpload";
import { FileWithPreview } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import SelectProjectFilesDialog from "./SelectProjectFilesDialog";
import { FileListItem } from "./FileListItem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RoomDetailsProps {
  area: string;
  location?: string;
  designers?: Array<{ id: string; businessName: string; }>;
  designAssets?: Array<{ name: string; url: string; }>;
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
}

const RoomDetails = ({
  area,
  location,
  designers,
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
  onRemoveDesignAsset
}: RoomDetailsProps) => {
  const hasDesigner = designers && designers.length > 0;
  const [roomFiles, setRoomFiles] = useState<FileWithPreview[]>(() => {
    // Convert design assets to FileWithPreview format if available
    if (designAssets && designAssets.length > 0) {
      return designAssets.map((asset, index) => ({
        id: `asset-${index}`,
        name: asset.name,
        url: asset.url,
        size: 'Unknown',
        type: asset.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
        progress: 100,
        status: 'complete' as const,
        tags: []
      }));
    }
    return [];
  });
  const [showProjectFilesDialog, setShowProjectFilesDialog] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<{name: string; url: string; type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesUploaded = (files: FileWithPreview[]) => {
    setRoomFiles(files);
    
    // Convert FileWithPreview to design assets format
    const assets = files
      .filter(file => file.status === 'complete' && file.url)
      .map(file => ({
        name: file.name,
        url: file.url as string
      }));
    
    // Call onUploadAssets with the new assets if needed
    onUploadAssets();
  };

  const handleSelectProjectFiles = (files: string[]) => {
    if (onSelectProjectFiles) {
      onSelectProjectFiles(files);
    }
  };

  const handlePreviewAsset = (asset: {name: string; url: string}) => {
    const fileExtension = asset.name.split('.').pop()?.toLowerCase() || '';
    let fileType = 'unknown';
    
    if (['pdf'].includes(fileExtension)) {
      fileType = 'pdf';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      fileType = 'image';
    } else if (['doc', 'docx'].includes(fileExtension)) {
      fileType = 'document';
    }
    
    setPreviewAsset({ ...asset, type: fileType });
  };

  const handleDownloadAsset = (asset: {name: string; url: string}) => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: `Downloading ${asset.name}`
    });
  };

  const handleRemoveAsset = (index: number) => {
    if (onRemoveDesignAsset) {
      onRemoveDesignAsset(index);
    }
  };

  const handleQuickUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    // Check authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to upload files.",
        variant: "destructive"
      });
      return;
    }

    const uploadedUrls: {name: string; url: string}[] = [];
    
    try {
      toast({
        title: "Uploading files",
        description: "Please wait while your files are being uploaded."
      });

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${Math.random()}-${Date.now()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('properties')
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('properties')
            .getPublicUrl(filePath);
          
          uploadedUrls.push({
            name: file.name,
            url: publicUrl
          });
        }
      }

      if (uploadedUrls.length > 0 && onSelectProjectFiles) {
        onSelectProjectFiles(uploadedUrls.map(item => item.url));
      }

      toast({
        title: "Files uploaded successfully",
        description: `${uploadedUrls.length} file(s) have been uploaded.`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files.",
        variant: "destructive"
      });
    } finally {
      // Reset the input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Calculate square footage based on measurements
  const calculateSquareFootage = (): string => {
    if (measurements?.length && measurements?.width) {
      return `${measurements.length * measurements.width} SQFT`;
    }
    return ""; // Return blank when no measurements
  };

  // Format measurements based on the available data
  const formatMeasurements = (): string => {
    if (measurements?.length && measurements?.width && measurements?.height) {
      return `${measurements.length}x${measurements.width}x${measurements.height}"`;
    }
    return ""; // Return blank when no measurements
  };

  return (
    <div className="flex flex-col space-y-6">
      <Card className="overflow-hidden rounded-2xl border shadow-sm">
        <CardContent className="p-6">
          <DesignTabHeader area={area} location={location} />
          
          {/* Property Information Section */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-xl font-medium">Designer:</span>
              {hasDesigner ? (
                <div className="flex items-center px-4 py-2 bg-gray-100 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-2">
                    {designers![0].businessName[0]}
                  </div>
                  <span className="text-xl text-gray-600">Don Smith</span>
                </div>
              ) : (
                <span className="text-xl text-gray-500">Not assigned</span>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-xl font-medium">Square Feet:</span>
              <div className="flex items-center">
                <SquareDot className="h-5 w-5 mr-2 text-gray-500" />
                <span className="text-xl">
                  {calculateSquareFootage() ? (
                    <>
                      <span className="text-gray-500">est</span> {calculateSquareFootage()}
                    </>
                  ) : (
                    <span className="text-gray-400">Not available</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-xl font-medium">Measurements:</span>
              <div className="flex items-center">
                <Ruler className="h-5 w-5 mr-2 text-gray-500" />
                <span className="text-xl">
                  {formatMeasurements() || <span className="text-gray-400">Not available</span>}
                </span>
              </div>
            </div>

            {location && (
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-xl font-medium">Location:</span>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-xl">{location}</span>
                </div>
              </div>
            )}
          </div>

          {/* Design Assets Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-4xl font-bold text-black">Design Assets</h3>
              <Button variant="link" className="text-lg font-semibold text-black hover:underline p-0 h-auto">
                Edit
              </Button>
            </div>
            
            {designAssets && designAssets.length > 0 ? (
              <div className="space-y-3">
                {designAssets.map((asset, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-gray-500" />
                      <span className="font-medium">{asset.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center px-2 py-1 rounded-md">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="ml-1">1</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveAsset(idx)} 
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Remove"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No design assets added yet</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button 
                variant="outline" 
                className="w-full py-6 text-[#174c65] border-[#174c65] hover:bg-[#174c65]/5"
                onClick={() => setShowProjectFilesDialog(true)}
              >
                SELECT FROM FILES
              </Button>
              <Button 
                variant="outline" 
                className="w-full py-6 text-[#174c65] border-[#174c65] hover:bg-[#174c65]/5"
                onClick={() => fileInputRef.current?.click()}
              >
                UPLOAD
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*, .pdf, .dwg, .doc, .docx, .xls"
                multiple
                onChange={handleQuickUpload}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Files Selection Dialog */}
      {projectId && (
        <SelectProjectFilesDialog
          open={showProjectFilesDialog}
          onOpenChange={setShowProjectFilesDialog}
          projectId={projectId}
          onSelect={handleSelectProjectFiles}
        />
      )}

      {/* Asset Preview Dialog */}
      <Dialog open={!!previewAsset} onOpenChange={(open) => !open && setPreviewAsset(null)}>
        <DialogContent className="max-w-3xl h-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewAsset?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 flex items-center justify-center">
            {previewAsset?.type === 'image' ? (
              <img 
                src={previewAsset.url} 
                alt={previewAsset.name} 
                className="max-w-full max-h-[70vh] object-contain" 
              />
            ) : previewAsset?.type === 'pdf' ? (
              <iframe 
                src={`https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(previewAsset.url)}`}
                className="w-full h-[70vh]" 
                title={previewAsset.name}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-10">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500">Preview not available</p>
                <Button className="mt-4" onClick={() => handleDownloadAsset(previewAsset)}>
                  Download
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomDetails;
