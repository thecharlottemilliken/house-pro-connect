
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
        await supabase.storage
          .from('property-blueprints')
          .remove([filename!]);
      }

      const { error } = await supabase
        .from('properties')
        .update({ blueprint_url: null })
        .eq('id', propertyId);

      if (error) throw error;

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

  const handleAddRenderings = (urls: string[]) => {
    // Handle rendering uploads when implemented
    console.log("Rendering URLs:", urls);
    if (onAddRenderings) onAddRenderings();
  };

  const handleRemoveRenderings = async () => {
    try {
      // This is a placeholder function for removing renderings
      // Actual implementation would require storing rendering references
      // and removing them from storage and database
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

  const handleAddDrawings = (urls: string[]) => {
    // Handle drawings uploads when implemented
    console.log("Drawing URLs:", urls);
    if (onAddDrawings) onAddDrawings();
  };

  const handleRemoveDrawings = async () => {
    try {
      // This is a placeholder function for removing drawings
      // Actual implementation would require storing drawing references
      // and removing them from storage and database
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
          files={propertyBlueprint ? [
            { name: "Blueprint.pdf", size: "1.2MB", type: 'pdf' }
          ] : []}
          onUpload={handleUploadBlueprint}
          onDelete={handleRemoveBlueprint}
        />

        <CategorySection
          title="Renderings"
          files={renderingImages.map((url, index) => ({
            name: `Rendering_${index + 1}.jpg`,
            size: "1.5MB",
            type: 'pdf'
          }))}
          onUpload={handleAddRenderings}
          onDelete={handleRemoveRenderings}
        />

        <CategorySection
          title="Drawings"
          files={[]}
          onUpload={handleAddDrawings}
          onDelete={handleRemoveDrawings}
        />
      </CardContent>
    </Card>
  );
};

export default DesignAssetsCard;
