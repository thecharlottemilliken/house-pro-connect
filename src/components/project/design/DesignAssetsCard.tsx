import React, { useState, useEffect } from "react";
import { Building2, Image, Pen, FileWarning, Download, AlertTriangle, Trash, Plus, FileCheck, FileX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EmptyDesignState from "./EmptyDesignState";
import { toast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    if (propertyBlueprint) {
      verifyBlueprintUrl();
    }
  }, [propertyBlueprint]);

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toLowerCase() || '';
  };

  const formatFileSize = () => "2.3 MB"; // Placeholder for demo

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4">Design Assets</h3>
        <div className="space-y-2">
          {propertyBlueprint && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Blueprint.pdf</p>
                  <p className="text-xs text-gray-500">{formatFileSize()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDownloadBlueprint}
                  className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleRemoveBlueprint}
                  className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {renderingImages.map((url, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded">
                  <Image className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Rendering_{index + 1}.{getFileExtension(url)}</p>
                  <p className="text-xs text-gray-500">{formatFileSize()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.open(url, '_blank')}
                  className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-200"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {!propertyBlueprint && (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="p-4">
                <EmptyDesignState
                  type="renderings"
                  customIcon={<Building2 className="w-8 h-8 text-gray-400" />}
                  customTitle="Blueprints"
                  customDescription="Add blueprints"
                  customActionLabel="Add Blueprints"
                  onAction={() => setShowUploadBlueprint(true)}
                />
              </CardContent>
            </Card>
          )}

          <Card className="bg-gray-50 border-dashed">
            <CardContent className="p-4">
              <EmptyDesignState
                type="renderings"
                customIcon={<Image className="w-8 h-8 text-gray-400" />}
                customTitle="3D Renderings"
                customDescription="Add design visualizations"
                customActionLabel="Add Renderings"
                onAction={onAddRenderings}
              />
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-dashed">
            <CardContent className="p-4">
              <EmptyDesignState
                type="renderings"
                customIcon={<Pen className="w-8 h-8 text-gray-400" />}
                customTitle="Design Drawings"
                customDescription="Add design drawings"
                customActionLabel="Add Drawings"
                onAction={onAddDrawings}
              />
            </CardContent>
          </Card>
        </div>
      </CardContent>

      {/* Upload Blueprint Dialog */}
      <Dialog open={showUploadBlueprint} onOpenChange={setShowUploadBlueprint}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Blueprint</DialogTitle>
            <DialogDescription>
              Upload a new blueprint PDF file for your property. This will replace the current blueprint.
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
