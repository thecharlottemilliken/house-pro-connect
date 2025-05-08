
import React, { useState } from "react";
import { Upload, FileSearch, Tag as TagIcon } from "lucide-react";
import { FileListItem } from "./FileListItem";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import SelectPropertyPhotosDialog from "./SelectPropertyPhotosDialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [tagInput, setTagInput] = useState('');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);

  // Common tag suggestions based on room categories
  const getTagSuggestions = () => {
    const baseTags = ["Blueprint", "Rendering", "Drawing"];
    
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

  const handleAddTag = (fileIndex: number, tag: string) => {
    if (!tag.trim() || !onUpdateTags) return;
    
    const file = roomFiles[fileIndex];
    const currentTags = file.tags || [];
    
    // Don't add duplicate tags
    if (currentTags.includes(tag.trim())) return;
    
    const updatedTags = [...currentTags, tag.trim()];
    onUpdateTags(fileIndex, updatedTags);
    setTagInput('');
    setIsTagPopoverOpen(false);
  };

  const handleRemoveTag = (fileIndex: number, tagToRemove: string) => {
    if (!onUpdateTags) return;
    
    const file = roomFiles[fileIndex];
    const currentTags = file.tags || [];
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    
    onUpdateTags(fileIndex, updatedTags);
  };

  const openTagPopover = (index: number) => {
    setSelectedFileIndex(index);
    setIsTagPopoverOpen(true);
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
                    
                    {/* Tags section with project creation flow styling */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(file.tags || []).map((tag, tagIndex) => (
                        <Badge 
                          key={tagIndex} 
                          variant="outline" 
                          className="text-xs py-0 px-2 bg-gray-50 text-gray-700 hover:bg-gray-50 cursor-default flex items-center gap-1"
                        >
                          {tag}
                          {onUpdateTags && (
                            <button 
                              onClick={() => handleRemoveTag(index, tag)}
                              className="ml-1 text-gray-400 hover:text-gray-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          )}
                        </Badge>
                      ))}
                      
                      {/* Add tag button */}
                      {onUpdateTags && (
                        <Popover open={isTagPopoverOpen && selectedFileIndex === index} onOpenChange={(open) => {
                          if (open) {
                            setSelectedFileIndex(index);
                          }
                          setIsTagPopoverOpen(open);
                        }}>
                          <PopoverTrigger asChild>
                            <button 
                              onClick={() => openTagPopover(index)}
                              className="rounded border border-dashed border-gray-300 px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-50 focus:outline-none flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" className="mr-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                              Tag
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-2" align="start">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-1">
                                <Input 
                                  className="h-8 text-xs"
                                  value={tagInput}
                                  onChange={(e) => setTagInput(e.target.value)}
                                  placeholder="Add tag"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && tagInput.trim()) {
                                      handleAddTag(index, tagInput);
                                    }
                                  }}
                                />
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 px-2" 
                                  onClick={() => handleAddTag(index, tagInput)}
                                  disabled={!tagInput.trim()}
                                >
                                  Add
                                </Button>
                              </div>
                              
                              {/* Tag suggestions */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {getTagSuggestions().map((suggestion) => (
                                  <Badge 
                                    key={suggestion} 
                                    variant="outline" 
                                    className="cursor-pointer bg-gray-50 hover:bg-gray-100"
                                    onClick={() => handleAddTag(index, suggestion)}
                                  >
                                    {suggestion}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                  <button 
                    className="text-gray-400 hover:text-gray-700 p-1"
                    onClick={() => onDelete(index)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
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
    </div>
  );
};

export default CategorySection;
