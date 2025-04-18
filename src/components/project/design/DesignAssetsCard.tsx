
import React from "react";
import { Building2, Image, Pen, Eye, FileWarning, ExternalLink, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import EmptyDesignState from "./EmptyDesignState";

interface DesignAssetsCardProps {
  hasRenderings: boolean;
  renderingImages?: string[];
  onAddRenderings?: () => void;
  onAddDrawings?: () => void;
  onAddBlueprints?: () => void;
  propertyBlueprint?: string | null;
}

const DesignAssetsCard = ({
  hasRenderings,
  renderingImages = [],
  onAddRenderings,
  onAddDrawings,
  onAddBlueprints,
  propertyBlueprint
}: DesignAssetsCardProps) => {
  const [showBlueprintPreview, setShowBlueprintPreview] = React.useState(false);
  const [previewError, setPreviewError] = React.useState(false);
  
  const handleOpenPreview = () => {
    setPreviewError(false);
    setShowBlueprintPreview(true);
    
    // If it's a PDF, just open in new tab to avoid security restrictions
    if (propertyBlueprint && propertyBlueprint.endsWith('.pdf')) {
      window.open(propertyBlueprint, '_blank');
      setShowBlueprintPreview(false);
    } else {
      setShowBlueprintPreview(true);
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

  const handlePreviewError = () => {
    console.error("Blueprint preview failed to load:", propertyBlueprint);
    setPreviewError(true);
  };
  
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
              <Card className="overflow-hidden cursor-pointer group">
                <div className="w-full h-48 bg-gray-100 relative">
                  <img 
                    src={propertyBlueprint.endsWith('.pdf') ? '/placeholder.svg' : propertyBlueprint} 
                    alt="Property Blueprint"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Blueprint image failed to load:", propertyBlueprint);
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={handleOpenPreview}
                      className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <Eye className="w-5 h-5 text-gray-700" />
                    </button>
                    <button 
                      onClick={handleDownloadBlueprint}
                      className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <Download className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-1">Property Blueprint</h4>
                  <p className="text-sm text-gray-500">Original property blueprint</p>
                  <div className="mt-2 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPreview();
                      }}
                      className="text-xs flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" /> View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadBlueprint();
                      }}
                      className="text-xs flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" /> Download
                    </Button>
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
                    onAction={onAddBlueprints}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* This dialog is only used for non-PDF files now */}
      <Dialog open={showBlueprintPreview && !previewError && propertyBlueprint && !propertyBlueprint.endsWith('.pdf')} 
             onOpenChange={(open) => !open && setShowBlueprintPreview(false)}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle>Blueprint Preview</DialogTitle>
            <DialogDescription>Viewing your property blueprint</DialogDescription>
          </DialogHeader>
          {propertyBlueprint && !propertyBlueprint.endsWith('.pdf') && (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={propertyBlueprint}
                className="max-w-full max-h-full object-contain"
                alt="Blueprint Preview"
                onError={handlePreviewError}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={previewError} onOpenChange={setPreviewError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Document Preview Error</AlertDialogTitle>
            <AlertDialogDescription>
              There was a problem displaying the document. This might be due to browser security restrictions or an issue with the file format.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setPreviewError(false);
              if (propertyBlueprint) {
                window.open(propertyBlueprint, '_blank');
              }
            }}>
              Open in New Tab
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => {
              setPreviewError(false);
              setShowBlueprintPreview(false);
            }}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DesignAssetsCard;
