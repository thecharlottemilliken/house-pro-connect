
import React, { useState } from "react";
import { Upload, FileSearch, Tag as TagIcon, Eye, Trash, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import SelectPropertyPhotosDialog from "./SelectPropertyPhotosDialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TagsDialogContent from "./room-details/TagsDialogContent";
import { FileTags } from "@/components/ui/file-upload/file-tags";

interface CategorySectionProps {
  title: string;
  roomId?: string;
  currentRoom?: string;
  files?: { name: string; size: string; type: 'pdf' | 'xls' | 'jpg' | 'png'; url?: string; tags?: string[]; roomId?: string }[];
  onUpload: (urls: string[], roomId?: string) => void;
  onDelete: (fileIndex?: number) => void;
  onUpdateTags?: (fileIndex: number, tags: string[]) => void;
  propertyPhotos?: string[];
}

const CategorySection = ({ 
  title, 
  roomId, 
  currentRoom, 
  files = [], 
  onUpload, 
  onDelete, 
  onUpdateTags,
  propertyPhotos = [] 
}: CategorySectionProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const [showTagsDialog, setShowTagsDialog] = useState(false);

  // Common tag suggestions based on room categories
  const getTagSuggestions = () => {
    const baseTags = ["Blueprint", "Floor Plan", "Rendering", "Drawing", "Material"];
    
    // Add room-specific tags if currentRoom exists
    if (currentRoom) {
      baseTags.push(currentRoom);
    }
    
    return baseTags;
  };

  // Determine accepted file types based on the section title
  const getAcceptedFileTypes = () => {
    switch (title.toLowerCase()) {
      case 'blueprints':
        return "application/pdf,image/jpeg,image/png";
      case 'renderings':
        return "image/jpeg,image/png";
      case 'drawings':
        return "image/jpeg,image/png,application/pdf";
      default:
        return "image/*,application/pdf,application/vnd.ms-excel";
    }
  };

  const handleSelectExistingFiles = (selectedPhotos: string[]) => {
    // Pass the roomId to associate files with the specific room
    onUpload(selectedPhotos, roomId);
    setShowSelectDialog(false);
  };

  const handleOpenTagsDialog = (index: number) => {
    setSelectedFileIndex(index);
    setShowTagsDialog(true);
  };

  const handleSaveTags = (tags: string[]) => {
    if (selectedFileIndex !== null && onUpdateTags) {
      console.log("Saving tags:", tags);
      onUpdateTags(selectedFileIndex, tags);
      setShowTagsDialog(false);
      setSelectedFileIndex(null);
    }
  };

  // Filter files to only show those associated with the current room
  const roomFiles = files.filter(file => {
    // First, check if the file has a roomId that matches the current roomId
    if (file.roomId && roomId && file.roomId === roomId) {
      return true;
    }
    
    // If file has no roomId but has tags matching the current room name, include it
    if (!file.roomId && file.tags && currentRoom && 
        file.tags.some(tag => tag.toLowerCase() === currentRoom.toLowerCase())) {
      return true;
    }
    
    // If the file has no roomId and no room-related tags, only include it if current room is primary
    if (!file.roomId && (!file.tags || file.tags.length === 0)) {
      // Only include unassociated files in the primary room tab
      // (This is a fallback - ideally all files should have proper room association)
      return false;
    }
    
    return false;
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSelectDialog(true)}
            className="p-1.5 text-gray-500 hover:text-gray-700"
            title="Select from project files"
          >
            <FileSearch className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowUploadDialog(true)}
            className="p-1.5 text-gray-500 hover:text-gray-700"
            title="Upload new files"
          >
            <Upload className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {roomFiles.length > 0 ? (
        <div className="space-y-3">
          {roomFiles.map((file, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {file.type === 'pdf' ? (
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center">PDF</div>
                    ) : file.type === 'xls' ? (
                      <div className="w-10 h-10 bg-green-100 text-green-700 rounded-md flex items-center justify-center">XLS</div>
                    ) : (
                      <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-md flex items-center justify-center">IMG</div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{file.name}</h4>
                    <p className="text-xs text-gray-500">{file.size}</p>
                    
                    {/* Tags section with improved styling */}
                    <div className="mt-2">
                      <FileTags 
                        tags={file.tags || []} 
                        onRemoveTag={onUpdateTags ? (tag) => {
                          if (onUpdateTags) {
                            const currentTags = file.tags || [];
                            const updatedTags = currentTags.filter(t => t !== tag);
                            onUpdateTags(index, updatedTags);
                          }
                        } : undefined} 
                      />
                      
                      {/* Add tag button */}
                      {onUpdateTags && (
                        <button
                          onClick={() => handleOpenTagsDialog(index)}
                          className="mt-1.5 inline-flex items-center rounded border border-dashed border-gray-300 px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-50 focus:outline-none"
                        >
                          <Plus className="mr-0.5 h-3 w-3" />
                          <TagIcon className="mr-0.5 h-3 w-3" />
                          Manage Tags
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* File Actions */}
                <div className="flex gap-2">
                  <button 
                    className="text-gray-400 hover:text-gray-700 p-1"
                    onClick={() => console.log('View file:', file.name)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    className="text-gray-400 hover:text-gray-700 p-1"
                    onClick={() => onDelete(index)}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">None uploaded.</p>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {title}</DialogTitle>
            <DialogDescription>
              Upload files for {title}. Accepted formats: PDF, JPG, PNG
            </DialogDescription>
          </DialogHeader>
          
          <FileUpload
            accept={getAcceptedFileTypes()}
            multiple={false}
            onUploadComplete={(urls) => {
              // Pass the roomId to associate uploads with specific room
              onUpload(urls, roomId);
              setShowUploadDialog(false);
            }}
            label={`${title} File`}
            description={`Upload your ${title.toLowerCase()} file${currentRoom ? ` for ${currentRoom}` : ''}`}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Select from Project Files Dialog */}
      {propertyPhotos.length > 0 && (
        <SelectPropertyPhotosDialog
          photos={propertyPhotos}
          onSelect={handleSelectExistingFiles}
          open={showSelectDialog}
          onOpenChange={setShowSelectDialog}
        />
      )}

      {/* Tags Dialog */}
      {selectedFileIndex !== null && (
        <Dialog open={showTagsDialog} onOpenChange={setShowTagsDialog}>
          <TagsDialogContent 
            tags={roomFiles[selectedFileIndex]?.tags || []}
            onSave={handleSaveTags}
            onCancel={() => {
              setShowTagsDialog(false);
              setSelectedFileIndex(null);
            }}
          />
        </Dialog>
      )}
    </div>
  );
};

export default CategorySection;
