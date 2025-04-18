import React, { useState, useEffect } from "react";
import { Building2, Image, Pen, FileWarning, Download, AlertTriangle, Trash, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  propertyId?: string; // Add this to help with updating the blueprint
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
  
  // Check if blueprint URL exists and is valid
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
  
  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">Design Assets</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

            {propertyBlueprint ? (
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <h4 className="font-medium text-sm">Property Blueprint</h4>
                      </div>
                      {pdfStatus === 'invalid' && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Invalid PDF
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Original property blueprint</p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDownloadBlueprint}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRemoveBlueprint}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                        Remove
                      </Button>
                      {pdfStatus === 'invalid' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowUploadBlueprint(true)}
                          className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Plus className="h-4 w-4" />
                          Replace
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
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
          </div>
        </CardContent>
      </Card>

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
    </>
  );
};

export default DesignAssetsCard;
