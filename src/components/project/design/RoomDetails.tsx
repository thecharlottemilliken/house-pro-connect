
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Eye, Download, X, Upload, MapPin, Ruler, SquareDot, Tag } from "lucide-react";
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
  designAssets?: Array<{ name: string; url: string; tags?: string[] }>;
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
  onUpdateAssetTags?: (index: number, tags: string[]) => void;
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
  onRemoveDesignAsset,
  onUpdateAssetTags
}: RoomDetailsProps) => {
  const hasDesigner = designers && designers.length > 0;
  const [showProjectFilesDialog, setShowProjectFilesDialog] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<{name: string; url: string; type: string} | null>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [currentAssetIndex, setCurrentAssetIndex] = useState<number | null>(null);
  const [assetTags, setAssetTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSelectProjectFiles = (files: string[]) => {
    if (onSelectProjectFiles) {
      onSelectProjectFiles(files);
    }
  };

  const handleRemoveAsset = (index: number) => {
    if (onRemoveDesignAsset) {
      onRemoveDesignAsset(index);
    }
  };

  const openTagDialog = (index: number) => {
    setCurrentAssetIndex(index);
    setAssetTags(designAssets[index].tags || []);
    setTagDialogOpen(true);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !assetTags.includes(newTag.trim())) {
      const updatedTags = [...assetTags, newTag.trim()];
      setAssetTags(updatedTags);
      setNewTag('');
      
      if (currentAssetIndex !== null && onUpdateAssetTags) {
        onUpdateAssetTags(currentAssetIndex, updatedTags);
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = assetTags.filter(tag => tag !== tagToRemove);
    setAssetTags(updatedTags);
    
    if (currentAssetIndex !== null && onUpdateAssetTags) {
      onUpdateAssetTags(currentAssetIndex, updatedTags);
    }
  };

  const handleSubmitTags = () => {
    if (currentAssetIndex !== null && onUpdateAssetTags) {
      onUpdateAssetTags(currentAssetIndex, assetTags);
    }
    setTagDialogOpen(false);
  };

  return (
    <Card className="overflow-hidden rounded-lg border shadow-sm h-full">
      <CardContent className="p-6">
        <DesignTabHeader area={area} location={location} />
        
        {/* Property Information Section */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-gray-700">
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
          
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-base font-medium">Square Feet:</span>
            <div className="flex items-center">
              <SquareDot className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-sm">
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
            <span className="text-base font-medium">Measurements:</span>
            <div className="flex items-center">
              <Ruler className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-sm">
                {formatMeasurements() || <span className="text-gray-400">Not available</span>}
              </span>
            </div>
          </div>

          {location && (
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-base font-medium">Location:</span>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-sm">{location}</span>
              </div>
            </div>
          )}
        </div>

        {/* Design Assets Section */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-black">Design Assets</h3>
            <Button variant="ghost" className="text-sm font-medium text-gray-600 hover:text-black p-1 h-auto">
              Edit
            </Button>
          </div>
          
          {designAssets && designAssets.length > 0 ? (
            <div className="space-y-2">
              {designAssets.map((asset, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium truncate max-w-[180px]">{asset.name}</span>
                    {asset.tags && asset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {asset.tags.slice(0, 2).map((tag) => (
                          <span 
                            key={tag}
                            className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                        {asset.tags.length > 2 && (
                          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            +{asset.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => openTagDialog(idx)}
                      className="p-1 text-gray-400 hover:text-gray-700 mr-1"
                      title="Add Tags"
                    >
                      <Tag className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleRemoveAsset(idx)} 
                      className="p-1 text-gray-400 hover:text-gray-700"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-gray-500 text-sm">No design assets added yet</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              variant="outline" 
              className="w-full py-1 text-xs text-[#174c65] border-[#174c65] hover:bg-[#174c65]/5"
              onClick={() => setShowProjectFilesDialog(true)}
            >
              SELECT FROM FILES
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-1 text-xs text-[#174c65] border-[#174c65] hover:bg-[#174c65]/5"
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
                <Button className="mt-4" onClick={() => {}}>
                  Download
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Asset Tags</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Display existing tags */}
            <div className="flex flex-wrap gap-2">
              {assetTags.map((tag) => (
                <div 
                  key={tag}
                  className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"
                >
                  <span>{tag}</span>
                  <button 
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Add new tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border rounded-md"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button 
                onClick={handleAddTag}
                variant="outline"
                type="button"
              >
                Add
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={() => setTagDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitTags}>
              Save Tags
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RoomDetails;
