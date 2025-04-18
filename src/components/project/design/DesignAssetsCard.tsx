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
  const [showUploadBlueprint, setShowUploadBlueprint] = useState(false);
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
      setShowUploadBlueprint(false);
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
      // Remove the file from storage if it exists
      if (propertyBlueprint) {
        const filename = propertyBlueprint.split('/').pop();
        await supabase.storage
          .from('property-blueprints')
          .remove([filename!]);
      }

      // Update the property record
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

  return (
    <Card>
      <CardContent className="p-6">
        <CategorySection
          title="Blueprints"
          files={propertyBlueprint ? [
            { name: "Biodata.pdf", size: "1.2MB / 1.2MB", type: 'pdf' }
          ] : []}
          onUpload={() => setShowUploadBlueprint(true)}
        />

        <CategorySection
          title="Renderings"
          files={renderingImages.map((url, index) => ({
            name: `Rendering_${index + 1}.jpg`,
            size: "1.5MB / 1.5MB",
            type: 'pdf'
          }))}
          onUpload={onAddRenderings}
        />

        <CategorySection
          title="Drawings"
          files={[]}
          onUpload={onAddDrawings}
        />
      </CardContent>

      {/* Upload Blueprint Dialog */}
      <Dialog open={showUploadBlueprint} onOpenChange={setShowUploadBlueprint}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Blueprint</DialogTitle>
            <DialogDescription>
              Upload a new blueprint PDF file for your property.
            </DialogDescription>
          </DialogHeader>
          
          <FileUpload
            accept="application/pdf"
            multiple={false}
            onUploadComplete={handleUploadBlueprint}
            label="Blueprint PDF"
            description="Upload a PDF file of your property blueprint"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadBlueprint(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DesignAssetsCard;
