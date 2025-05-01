
import React, { useState } from "react";
import { Button } from "../button";
import { ArrowUpFromLine, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onUploadComplete: (urls: string[]) => void;
  label: string;
  description: string;
  uploadedFiles?: string[];
}

export function FileUpload({ 
  accept = "image/*,application/pdf,image/jpeg,image/png,application/vnd.ms-excel", 
  multiple = false,
  onUploadComplete,
  label,
  description,
  uploadedFiles = []
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      // Check authentication first
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You must be signed in to upload files.",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }

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
          
          uploadedUrls.push(publicUrl);
        }
      }

      onUploadComplete(uploadedUrls);
      toast({
        title: "Files uploaded successfully",
        description: "Your files have been uploaded."
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please ensure you're signed in.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-gray-500 text-sm">{description}</p>
          {uploadedFiles.length > 0 && (
            <p className="text-green-600 text-sm mt-1 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
            </p>
          )}
        </div>
        <div className="relative">
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button className="bg-[#174c65]" disabled={isUploading}>
            <ArrowUpFromLine className="mr-2 h-4 w-4" />
            {isUploading ? 'UPLOADING...' : 'UPLOAD'}
          </Button>
        </div>
      </div>
    </div>
  );
}
