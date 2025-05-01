
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileText, File } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SelectProjectFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSelect: (files: string[]) => void;
}

const SelectProjectFilesDialog = ({
  open,
  onOpenChange,
  projectId,
  onSelect,
}: SelectProjectFilesDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [projectFiles, setProjectFiles] = useState<{id: string; name: string; url: string; content_type: string}[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      loadProjectFiles();
    }
  }, [open, projectId]);

  const loadProjectFiles = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const { data: projectFilesData, error } = await supabase
        .from('project_files')
        .select('id, name, url, content_type')
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      setProjectFiles(projectFilesData || []);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error loading project files:', error);
      toast({
        title: "Error",
        description: "Failed to load project files",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = (fileUrl: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileUrl)) {
        return prev.filter(url => url !== fileUrl);
      } else {
        return [...prev, fileUrl];
      }
    });
  };

  const handleConfirm = () => {
    onSelect(selectedFiles);
    onOpenChange(false);
  };

  const isImageFile = (contentType: string) => {
    return contentType?.startsWith('image/');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Project Files</DialogTitle>
          <DialogDescription>
            Choose files from your project to include
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Loading project files...</p>
            </div>
          ) : projectFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No project files found
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {projectFiles.map((file) => {
                const isImage = isImageFile(file.content_type);
                const isSelected = selectedFiles.includes(file.url);
                
                return (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file.url)}
                    className={`
                      border rounded-md p-2 cursor-pointer transition-all hover:bg-gray-50
                      ${isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-gray-200'}
                    `}
                  >
                    <div className="aspect-square w-full bg-gray-100 rounded flex items-center justify-center mb-2 overflow-hidden">
                      {isImage ? (
                        <img 
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <p className="truncate text-sm">{file.name}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between gap-2">
          <div>
            <p className="text-sm text-gray-500">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={selectedFiles.length === 0 || loading}
              onClick={handleConfirm}
            >
              Select Files
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectProjectFilesDialog;
