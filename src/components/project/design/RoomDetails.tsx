
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Eye, Download, X, Upload, MapPin, Ruler, SquareDot, Tag, Plus } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
}

// Common tags that users might want to use
const commonTags = [
  "Blueprint", "Rendering", "Drawing", "Contract", "Material", "Invoice", 
  "Measurement", "Reference", "Proposal", "Quote", "Design", "Inspiration"
];

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number>(-1);
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  // Open tag management dialog
  const openTagDialog = (index: number) => {
    const asset = designAssets[index];
    setSelectedAssetIndex(index);
    setSelectedTags(asset.tags || []);
    setTagDialogOpen(true);
  };

  // Add a new tag
  const handleAddTag = () => {
    if (newTag.trim() !== '' && !selectedTags.includes(newTag.trim())) {
      setSelectedTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remove a tag
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  // Save tags
  const handleSaveTags = () => {
    if (onUpdateAssetTags && selectedAssetIndex >= 0) {
      onUpdateAssetTags(selectedAssetIndex, selectedTags);
      setTagDialogOpen(false);
    }
  };

  // Add common tag
  const handleAddCommonTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
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
                  </div>
                  <div className="flex items-center gap-2">
                    {asset.tags && asset.tags.length > 0 && (
                      <div className="flex items-center">
                        <Tag className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">{asset.tags[0]}{asset.tags.length > 1 ? ` +${asset.tags.length - 1}` : ''}</span>
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="p-1 text-gray-400 hover:text-gray-700"
                          title="Options"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                          </svg>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openTagDialog(idx)} className="cursor-pointer">
                          <Tag className="h-4 w-4 mr-2" />
                          Manage Tags
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleRemoveAsset(idx)} className="text-red-500 cursor-pointer">
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Tags Management Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2 min-h-[60px] border p-2 rounded-md">
              {selectedTags.length === 0 ? (
                <span className="text-gray-400 text-sm">No tags added yet</span>
              ) : (
                selectedTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center bg-gray-100 px-2 py-1 rounded-md text-sm">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 text-gray-500 hover:text-gray-700">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add a new tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button onClick={handleAddTag} size="sm" className="px-2">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Common tags:</p>
              <div className="flex flex-wrap gap-2">
                {commonTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleAddCommonTag(tag)}
                    className={`text-xs px-2 py-1 rounded-md border ${
                      selectedTags.includes(tag) 
                        ? 'bg-[#174c65] text-white border-[#174c65]' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTags} className="bg-[#174c65] hover:bg-[#174c65]/90">
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RoomDetails;
