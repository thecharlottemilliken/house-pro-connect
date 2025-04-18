
import React from "react";
import { Upload } from "lucide-react";
import { FileListItem } from "./FileListItem";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";

interface CategorySectionProps {
  title: string;
  files?: { name: string; size: string; type: 'pdf' | 'xls' }[];
  onUpload: (urls: string[]) => void;
}

const CategorySection = ({ title, files = [], onUpload }: CategorySectionProps) => {
  const [showUploadDialog, setShowUploadDialog] = React.useState(false);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <button 
          onClick={() => setShowUploadDialog(true)}
          className="p-1.5 text-gray-500 hover:text-gray-700"
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>
      
      {files.length > 0 ? (
        <div className="space-y-1">
          {files.map((file, index) => (
            <FileListItem
              key={index}
              {...file}
              onDownload={() => console.log('Download:', file.name)}
              onView={() => console.log('View:', file.name)}
              onDelete={() => console.log('Delete:', file.name)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">None uploaded.</p>
      )}

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {title}</DialogTitle>
            <DialogDescription>
              Upload files for your property. Accepted formats: PDF, XLS
            </DialogDescription>
          </DialogHeader>
          
          <FileUpload
            accept={title.toLowerCase() === 'blueprints' ? "application/pdf" : "application/pdf,application/vnd.ms-excel"}
            multiple={false}
            onUploadComplete={(urls) => {
              onUpload(urls);
              setShowUploadDialog(false);
            }}
            label={`${title} File`}
            description={`Upload your ${title.toLowerCase()} file`}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategorySection;
