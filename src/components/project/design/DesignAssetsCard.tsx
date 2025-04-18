
import React from "react";
import { Building2, Image, Pen, Eye, FileWarning } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
              <Card className="overflow-hidden cursor-pointer group" onClick={handleOpenPreview}>
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
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-1">Property Blueprint</h4>
                  <p className="text-sm text-gray-500">Original property blueprint</p>
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

      <Dialog open={showBlueprintPreview && !previewError} onOpenChange={(open) => !open && setShowBlueprintPreview(false)}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          {propertyBlueprint && (
            <iframe
              src={propertyBlueprint}
              className="w-full h-full border-0"
              title="Blueprint Preview"
              onError={handlePreviewError}
              onLoad={(e) => {
                console.log("Blueprint preview loaded successfully");
              }}
              sandbox="allow-same-origin allow-scripts"
            />
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
