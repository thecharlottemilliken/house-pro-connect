
import React from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Trash2, Upload } from "lucide-react";
import FileListItem from "./FileListItem";
import SelectProjectFilesDialog from "./SelectProjectFilesDialog";

interface CategorySectionProps {
  title: string;
  files: Array<{name: string; size: string; type: 'pdf' | 'xls' | 'jpg' | 'png'; url?: string}>;
  onUpload: (urls: string[]) => void;
  onDelete: () => void;
  projectFiles?: Array<{name: string; url: string; type?: string}>;
}

const CategorySection: React.FC<CategorySectionProps> = ({ 
  title, 
  files, 
  onUpload, 
  onDelete,
  projectFiles = []
}) => {
  const handleSelectFromProjectFiles = (selectedUrls: string[]) => {
    if (selectedUrls.length > 0) {
      onUpload(selectedUrls);
    }
  };

  return (
    <div className="py-4 first:pt-0 border-b last:border-b-0 border-gray-100">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {files.length > 0 ? (
        <div className="space-y-3">
          {files.map((file, index) => (
            <FileListItem 
              key={index}
              name={file.name}
              size={file.size}
              type={file.type}
              url={file.url}
            />
          ))}
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </Button>
            
            <FileUpload
              onUploadComplete={onUpload}
              accept={title === "Blueprints" ? "image/*,.pdf,.dwg" : "image/*"}
              multiple={title !== "Blueprints"}
              label={`Upload ${title}`}
              description={`Upload ${title.toLowerCase()} for your project`}
              buttonVariant="outline"
              buttonSize="sm"
              compact={true}
              icon={<Upload className="mr-2 h-4 w-4" />}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <FileUpload
            onUploadComplete={onUpload}
            accept={title === "Blueprints" ? "image/*,.pdf,.dwg" : "image/*"}
            multiple={title !== "Blueprints"}
            label={`Upload ${title}`}
            description={`Upload ${title.toLowerCase()} for your project`}
          />
          
          {projectFiles.length > 0 && (
            <SelectProjectFilesDialog 
              files={projectFiles}
              onSelect={handleSelectFromProjectFiles}
              type={title === "Blueprints" ? "pdf" : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySection;
