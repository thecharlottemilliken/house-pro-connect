
import React from "react";
import { Upload, FileSearch } from "lucide-react";
import { FileListItem } from "./FileListItem";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import SelectPropertyPhotosDialog from "./SelectPropertyPhotosDialog";

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
  const [showUploadDialog, setShowUploadDialog] = React.useState(false);
  const [showSelectDialog, setShowSelectDialog] = React.useState(false);

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
    onUpload(selectedPhotos, roomId);
    setShowSelectDialog(false);
  };

  const handleUpdateTags = (fileIndex: number, updatedTags: string[]) => {
    if (onUpdateTags) {
      onUpdateTags(fileIndex, updatedTags);
    }
  };

  // Filter files to only show those associated with the current room
  const roomFiles = files.filter(file => !file.roomId || file.roomId === roomId);

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
        <div className="space-y-1">
          {roomFiles.map((file, index) => (
            <FileListItem
              key={index}
              {...file}
              onDownload={() => console.log('Download:', file.name)}
              onView={() => console.log('View:', file.name)}
              onDelete={() => onDelete(index)}
              onRemove={() => onDelete(index)}
              tags={file.tags}
              onUpdateTags={onUpdateTags ? (tags) => handleUpdateTags(index, tags) : undefined}
            />
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
