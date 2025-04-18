import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import CategorySection from "./CategorySection";

interface DesignAssetsCardProps {
  hasRenderings: boolean;
  renderingImages?: string[];
  onAddRenderings?: () => void;
  onAddDrawings?: () => void;
  onAddBlueprints?: () => void;
  propertyBlueprint?: string | null;
  propertyId?: string;
}

const DesignAssetsCard = ({
  hasRenderings,
  renderingImages = [],
  onAddRenderings,
  onAddDrawings,
  onAddBlueprints,
  propertyBlueprint,
  propertyId
}: DesignAssetsCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');
  const [isCheckingPdf, setIsCheckingPdf] = useState(false);
  const [blueprintFile, setBlueprintFile] = useState<{name: string; size: string; type: 'pdf' | 'xls' | 'jpg' | 'png'; url?: string} | null>(
    propertyBlueprint ? { name: "Blueprint.pdf", size: "1.2MB", type: 'pdf', url: propertyBlueprint } : null
  );
  const [renderingFiles, setRenderingFiles] = useState<{name: string; size: string; type: 'jpg' | 'png' | 'pdf'; url?: string}[]>(
    renderingImages.map((url, index) => ({
      name: `Rendering_${index + 1}.jpg`,
      size: "1.5MB",
      type: 'jpg',
      url
    }))
  );
  
  const [drawingFiles, setDrawingFiles] = useState<{name: string; size: string; type: 'jpg' | 'png' | 'pdf'; url?: string}[]>([]);

  const verifyBlueprintUrl = async () => {
    if (!propertyBlueprint) {
      setPdfStatus('invalid');
      return false;
    }
    
    try {
      setIsCheckingPdf(true);
      console.log("Verifying blueprint URL:", propertyBlueprint);
      
      const response = await fetch(propertyBlueprint, { method: 'HEAD' });
      const isValid = response.ok && response.headers.get('content-type')?.includes('pdf');
      
      console.log("PDF verification result:", { 
        status: response.status, 
        contentType: response.headers.get('content-type'),
        isValid 
      });
      
      setPdfStatus(isValid ? 'valid' : 'invalid');
      return isValid;
    } catch (error) {
      console.error("Error verifying blueprint URL:", error);
      setPdfStatus('invalid');
      return false;
    } finally {
      setIsCheckingPdf(false);
    }
  };
  
  const handleUploadBlueprint = async (urls: string[]) => {
    if (!urls.length || !propertyId) return;

    try {
      setIsUploading(true);
      const { error } = await supabase
        .from('properties')
        .update({ blueprint_url: urls[0] })
        .eq('id', propertyId);

      if (error) throw error;
      
      setBlueprintFile({ name: "Blueprint.pdf", size: "1.2MB", type: 'pdf', url: urls[0] });

      toast({
        title: "Blueprint Added",
        description: "Your blueprint has been successfully uploaded."
      });
    } catch (error) {
      console.error('Error uploading blueprint:', error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading the blueprint.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBlueprint = async () => {
    if (!propertyId) return;

    try {
      if (propertyBlueprint) {
        const filename = propertyBlueprint.split('/').pop();
        if (filename) {
          await supabase.storage
            .from('property-blueprints')
            .remove([filename]);
        }
      }

      const { error } = await supabase
        .from('properties')
        .update({ blueprint_url: null })
        .eq('id', propertyId);

      if (error) throw error;
      
      setBlueprintFile(null);

      toast({
        title: "Blueprint Removed",
        description: "The blueprint has been successfully removed."
      });
    } catch (error) {
      console.error('Error removing blueprint:', error);
      toast({
        title: "Remove Failed",
        description: "There was a problem removing the blueprint.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadBlueprint = () => {
    if (propertyBlueprint) {
      const link = document.createElement('a');
      link.href = propertyBlueprint;
      link.download = "property-blueprint.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAddRenderings = async (urls: string[]) => {
    console.log("Rendering URLs:", urls);
    const roomId = propertyId; // assuming propertyId is actually roomId, adjust if needed
    
    if (urls.length > 0 && roomId) {
      try {
        // First, get existing room design preferences
        const { data: existingPrefs, error: fetchError } = await supabase
          .from('room_design_preferences')
          .select('inspiration_images')
          .eq('room_id', roomId)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        
        // Combine existing and new inspiration images
        const existingImages = existingPrefs?.inspiration_images || [];
        const updatedImages = [...existingImages, ...urls];
        
        // Update the database with new inspiration images
        const { error: updateError } = await supabase
          .from('room_design_preferences')
          .update({ 
            inspiration_images: updatedImages,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', roomId);
        
        if (updateError) throw updateError;
        
        // Update local state with renderings
        const newRenderings = urls.map((url, index) => {
          const fileType = url.toLowerCase().includes('.jpg') || url.toLowerCase().includes('.jpeg') ? 'jpg' 
            : (url.toLowerCase().includes('.png') ? 'png' : 'pdf');
          
          return {
            name: `Rendering_${index + 1}.${fileType}`,
            size: "1.5MB",
            type: fileType,
            url: url
          }
        });
        
        setRenderingFiles(prev => [...prev, ...newRenderings]);
        
        toast({
          title: "Success",
          description: "Renderings have been saved successfully."
        });
      } catch (error) {
        console.error('Error saving renderings:', error);
        toast({
          title: "Error",
          description: "Failed to save renderings. Please try again.",
          variant: "destructive"
        });
      }
    }
    if (onAddRenderings) onAddRenderings();
  };

  const handleRemoveRenderings = async () => {
    try {
      if (renderingFiles.length > 0) {
        setRenderingFiles(prev => prev.slice(0, -1));
      }
      
      toast({
        title: "Rendering Removed",
        description: "The rendering has been removed successfully."
      });
    } catch (error) {
      console.error('Error removing rendering:', error);
      toast({
        title: "Remove Failed",
        description: "There was a problem removing the rendering.",
        variant: "destructive"
      });
    }
  };

  const handleAddDrawings = async (urls: string[]) => {
    console.log("Drawing URLs:", urls);
    const roomId = propertyId; // assuming propertyId is actually roomId, adjust if needed
    
    if (urls.length > 0 && roomId) {
      try {
        // First, get existing room design preferences
        const { data: existingPrefs, error: fetchError } = await supabase
          .from('room_design_preferences')
          .select('inspiration_images')
          .eq('room_id', roomId)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        
        // Combine existing and new inspiration images
        const existingImages = existingPrefs?.inspiration_images || [];
        const updatedImages = [...existingImages, ...urls];
        
        // Update the database with new inspiration images
        const { error: updateError } = await supabase
          .from('room_design_preferences')
          .update({ 
            inspiration_images: updatedImages,
            updated_at: new Date().toISOString()
          })
          .eq('room_id', roomId);
        
        if (updateError) throw updateError;
        
        // Update local state with drawings
        const newDrawings = urls.map((url, index) => {
          const fileType = url.toLowerCase().includes('.jpg') || url.toLowerCase().includes('.jpeg') ? 'jpg' 
            : (url.toLowerCase().includes('.png') ? 'png' : 'pdf');
          
          return {
            name: `Drawing_${drawingFiles.length + index + 1}.${fileType}`,
            size: "1.2MB",
            type: fileType,
            url: url
          };
        });
        
        setDrawingFiles(prev => [...prev, ...newDrawings]);
        
        toast({
          title: "Success",
          description: "Drawings have been saved successfully."
        });
      } catch (error) {
        console.error('Error saving drawings:', error);
        toast({
          title: "Error",
          description: "Failed to save drawings. Please try again.",
          variant: "destructive"
        });
      }
    }
    
    if (onAddDrawings) onAddDrawings();
  };

  const handleRemoveDrawings = async () => {
    try {
      if (drawingFiles.length > 0) {
        setDrawingFiles(prev => prev.slice(0, -1));
      }
      
      toast({
        title: "Drawing Removed",
        description: "The drawing has been removed successfully."
      });
    } catch (error) {
      console.error('Error removing drawing:', error);
      toast({
        title: "Remove Failed",
        description: "There was a problem removing the drawing.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <CategorySection
          title="Blueprints"
          files={blueprintFile ? [blueprintFile] : []}
          onUpload={handleUploadBlueprint}
          onDelete={handleRemoveBlueprint}
        />

        <CategorySection
          title="Renderings"
          files={renderingFiles}
          onUpload={handleAddRenderings}
          onDelete={handleRemoveRenderings}
        />

        <CategorySection
          title="Drawings"
          files={drawingFiles}
          onUpload={handleAddDrawings}
          onDelete={handleRemoveDrawings}
        />
      </CardContent>
    </Card>
  );
};

export default DesignAssetsCard;
