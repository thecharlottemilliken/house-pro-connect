
import React, { useState, useEffect } from "react";
import { FileWithPreview, RoomTagOption, FileUpload, extractUrls, extractTags } from "@/components/ui/file-upload";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PropertyFileUploadProps {
  accept?: string;
  multiple?: boolean;
  onFilesUploaded?: (files: FileWithPreview[]) => void; 
  initialFiles?: FileWithPreview[];
  roomOptions?: RoomTagOption[];
  label?: string;
  description?: string;
  initialTags?: string[]; // Add initialTags prop
}

export function PropertyFileUpload({ 
  accept = "image/*, .pdf, .dwg",
  multiple = true,
  onFilesUploaded,
  initialFiles = [],
  roomOptions = [],
  label = "Upload Files",
  description = "Upload property photos, blueprints, or drawings",
  initialTags = [] // Default to empty array
}: PropertyFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>(initialFiles);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    // Listen for authentication changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    // Update with initialFiles when they change
    if (initialFiles.length > 0) {
      setUploadedFiles(initialFiles);
    }
  }, [initialFiles]);

  // Handle completed uploads
  const handleUploadComplete = (files: FileWithPreview[]) => {
    console.log("PropertyFileUpload - Files uploaded:", files);
    console.log("PropertyFileUpload - Initial tags applied:", initialTags);
    
    // Update our internal state with the new files
    setUploadedFiles(prev => {
      // Create a map of existing file IDs to avoid duplicates
      const existingIds = new Set(prev.map(file => file.id));
      
      // Only add files that don't already exist in the array
      const newFiles = files.filter(file => !existingIds.has(file.id));
      
      // Combine existing files with new ones
      return [...prev, ...newFiles];
    });
    
    // Call the parent's callback with the FileWithPreview objects
    if (onFilesUploaded && files.length > 0) {
      onFilesUploaded(files);
    }
  };
  
  // Default room options if none provided
  const defaultRoomOptions: RoomTagOption[] = [
    { value: "livingRoom", label: "Living Room" },
    { value: "kitchen", label: "Kitchen" },
    { value: "bathroom", label: "Bathroom" },
    { value: "bedroom", label: "Bedroom" },
    { value: "office", label: "Office" },
    { value: "exterior", label: "Exterior" },
    { value: "blueprint", label: "Blueprint" },
  ];

  const roomTagOptions = roomOptions.length > 0 ? roomOptions : defaultRoomOptions;

  // Display authentication warning if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded relative">
          <strong className="font-bold">Authentication Required</strong>
          <span className="block sm:inline"> Please sign in to upload files.</span>
        </div>
        
        <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50">
          <p className="text-lg font-medium text-gray-500">{label}</p>
          <p className="text-sm text-gray-400">{description}</p>
          <p className="text-sm text-gray-400 mt-4">Sign in to enable file uploads</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FileUpload
        accept={accept}
        multiple={multiple}
        onUploadComplete={handleUploadComplete}
        label={label}
        description={description}
        initialTags={initialTags}
      />
    </div>
  );
}
