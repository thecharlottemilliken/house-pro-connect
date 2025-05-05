import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileText, File, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SelectProjectFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSelect: (files: string[]) => void;
  onConfirm?: () => void;
  designAssets?: any[];
  onSelectFile?: (fileUrl: string, isSelected: boolean) => void;
  selectedFiles?: string[];
}

const SelectProjectFilesDialog = ({
  open,
  onOpenChange,
  projectId,
  onSelect,
  onConfirm,
  designAssets = [],
  onSelectFile,
  selectedFiles = []
}: SelectProjectFilesDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [projectFiles, setProjectFiles] = useState<{id: string; name: string; url: string; content_type: string}[]>([]);
  const [selectedFilesInternal, setSelectedFilesInternal] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      loadProjectFiles();
    }
  }, [open, projectId]);

  useEffect(() => {
    // Use the external selectedFiles if provided, otherwise use internal state
    if (selectedFiles.length > 0) {
      setSelectedFilesInternal(selectedFiles);
    }
  }, [selectedFiles]);

  const loadProjectFiles = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // Get project information to access design preferences
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('design_preferences')
        .eq('id', projectId)
        .single();
        
      if (projectError) throw projectError;
      
      // Extract file information from design_preferences
      const designPreferences = projectData?.design_preferences || {};
      
      // Safely access properties with proper type checking
      const files: {id: string; name: string; url: string; content_type: string}[] = [];
      
      // Process designFiles if it exists and is an array
      if (designPreferences && 
          typeof designPreferences === 'object' && 
          'designFiles' in designPreferences && 
          Array.isArray(designPreferences.designFiles)) {
        
        designPreferences.designFiles.forEach((file: any) => {
          if (file && typeof file === 'object' && 'url' in file) {
            files.push({
              id: file.id || `file-${Math.random().toString(36).substring(2, 11)}`,
              name: file.name || 'Unnamed file',
              url: file.url,
              content_type: file.type || 'application/octet-stream'
            });
          }
        });
      }
      
      // Process designFileUrls if it exists and is an array
      if (designPreferences && 
          typeof designPreferences === 'object' && 
          'designFileUrls' in designPreferences && 
          Array.isArray(designPreferences.designFileUrls)) {
        
        designPreferences.designFileUrls.forEach((url: string) => {
          // Check if this URL already exists in the files array
          const exists = files.some(file => file.url === url);
          if (!exists && typeof url === 'string') {
            // Extract a filename from the URL
            const fileName = url.split('/').pop() || 'File';
            files.push({
              id: `url-${Math.random().toString(36).substring(2, 11)}`,
              name: fileName,
              url: url,
              content_type: url.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? 'image/jpeg' : 'application/octet-stream'
            });
          }
        });
      }
      
      // Process designAssets if it exists and is an array
      if (designPreferences && 
          typeof designPreferences === 'object' && 
          'designAssets' in designPreferences && 
          Array.isArray(designPreferences.designAssets)) {
          
        designPreferences.designAssets.forEach((asset: any) => {
          if (asset && typeof asset === 'object' && 'url' in asset) {
            const exists = files.some(file => file.url === asset.url);
            if (!exists) {
              files.push({
                id: `asset-${Math.random().toString(36).substring(2, 11)}`,
                name: asset.name || 'Asset file',
                url: asset.url,
                content_type: asset.type || 'application/octet-stream'
              });
            }
          }
        });
      }
      
      setProjectFiles(files);
      setSelectedFilesInternal([]);
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
    if (onSelectFile) {
      // If external handler provided, use it
      const isSelected = !selectedFilesInternal.includes(fileUrl);
      onSelectFile(fileUrl, isSelected);
    } else {
      // Otherwise use internal state
      setSelectedFilesInternal(prev => {
        if (prev.includes(fileUrl)) {
          return prev.filter(url => url !== fileUrl);
        } else {
          return [...prev, fileUrl];
        }
      });
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onSelect(selectedFilesInternal);
    }
    onOpenChange(false);
  };

  const isImageFile = (contentType: string) => {
    return contentType?.startsWith('image/') || contentType?.toLowerCase().includes('image');
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
                const isSelected = selectedFiles.includes(file.url) || selectedFilesInternal.includes(file.url);
                
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
              {(selectedFiles.length || selectedFilesInternal.length)} file{(selectedFiles.length || selectedFilesInternal.length) !== 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={(selectedFiles.length === 0 && selectedFilesInternal.length === 0) || loading}
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
