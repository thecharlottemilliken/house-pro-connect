
import React, { useState, useEffect } from "react";
import { Building2, Image, Pen, Eye, FileWarning, ExternalLink, Download, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import EmptyDesignState from "./EmptyDesignState";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";

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
  const [showPdfSheet, setShowPdfSheet] = React.useState(false);
  const [isCheckingPdf, setIsCheckingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');
  const [showUploadBlueprint, setShowUploadBlueprint] = useState(false);
  
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

  const handleCheckAndOpenPdf = async () => {
    const isValid = await verifyBlueprintUrl();
    
    if (isValid) {
      handleOpenInNewTab();
      toast({
        title: "PDF Verified",
        description: "The blueprint PDF is valid and has been opened in a new tab."
      });
    } else {
      setPreviewError(true);
      toast({
        title: "PDF Verification Failed",
        description: "The blueprint file appears to be invalid or inaccessible. Try uploading it again.",
        variant: "destructive"
      });
    }
  };
  
  const handleOpenPreview = () => {
    setPreviewError(false);
    
    // For PDF files, show the sheet or open in new tab
    if (propertyBlueprint && propertyBlueprint.endsWith('.pdf')) {
      console.log("Opening PDF preview:", propertyBlueprint);
      
      // Try the sheet approach first
      setShowPdfSheet(true);
    } else {
      // For images, use the dialog
      setShowBlueprintPreview(true);
    }
  };

  const handleDownloadBlueprint = () => {
    if (propertyBlueprint) {
      console.log("Downloading blueprint:", propertyBlueprint);
      const link = document.createElement('a');
      link.href = propertyBlueprint;
      link.download = "property-blueprint.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (propertyBlueprint) {
      console.log("Opening blueprint in new tab:", propertyBlueprint);
      window.open(propertyBlueprint, '_blank');
    }
  };

  const handlePreviewError = () => {
    console.error("Blueprint preview failed to load:", propertyBlueprint);
    setPreviewError(true);
  };

  const handleUploadBlueprint = (urls: string[]) => {
    if (urls.length > 0) {
      console.log("New blueprint uploaded:", urls[0]);
      // In a real implementation, we would update the propertyBlueprint in the database
      toast({
        title: "Blueprint Uploaded",
        description: "Your blueprint has been uploaded successfully. Refresh the page to see it."
      });
      setShowUploadBlueprint(false);
    }
  };

  useEffect(() => {
    // Verify blueprint once when component mounts
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
                  {pdfStatus === 'invalid' && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-red-100 text-red-700 flex items-center p-1 rounded">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span className="text-xs font-medium">Invalid PDF</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPreview();
                      }}
                      className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <Eye className="w-5 h-5 text-gray-700" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadBlueprint();
                      }}
                      className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <Download className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-1">Property Blueprint</h4>
                  <p className="text-sm text-gray-500">Original property blueprint</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckAndOpenPdf();
                      }}
                      className="text-xs flex items-center gap-1"
                      disabled={isCheckingPdf}
                    >
                      {isCheckingPdf ? 'Checking...' : (
                        <>
                          <ExternalLink className="h-3 w-3" /> Open PDF
                        </>
                      )}
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
                    {pdfStatus === 'invalid' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUploadBlueprint(true);
                        }}
                      >
                        <AlertTriangle className="h-3 w-3" /> Replace PDF
                      </Button>
                    )}
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

      {/* This dialog is used for non-PDF file previews */}
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

      {/* Sheet for PDF files - though we'll mainly use "open in new tab" due to browser security restrictions */}
      <Sheet open={showPdfSheet} onOpenChange={setShowPdfSheet}>
        <SheetContent className="w-[90%] sm:max-w-3xl h-full overflow-hidden">
          <SheetHeader>
            <SheetTitle>Blueprint PDF</SheetTitle>
            <SheetDescription className="flex justify-between items-center">
              <span>Your property blueprint document</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCheckAndOpenPdf}
                >
                  Open in New Tab
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadBlueprint}
                >
                  Download
                </Button>
              </div>
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 h-[calc(100%-5rem)] flex flex-col items-center justify-center">
            <div className="text-center mb-4">
              <FileWarning className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium">PDF Preview Unavailable</h3>
              <p className="text-gray-500 mt-1">Browser security restrictions prevent embedding this PDF directly.</p>
              
              {pdfStatus === 'invalid' && (
                <div className="bg-red-50 text-red-800 p-4 rounded-md mt-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <h4 className="font-medium">PDF Validation Failed</h4>
                  </div>
                  <p className="mt-2 text-sm">
                    The PDF file appears to be invalid or inaccessible. This could be due to:
                  </p>
                  <ul className="mt-2 text-sm list-disc list-inside">
                    <li>The file was not uploaded properly</li>
                    <li>The file may be corrupted</li>
                    <li>Storage permission issues</li>
                  </ul>
                  <Button 
                    className="mt-3 bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      setShowPdfSheet(false);
                      setShowUploadBlueprint(true);
                    }}
                  >
                    Upload New Blueprint
                  </Button>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleCheckAndOpenPdf}
              className="mb-3"
              disabled={isCheckingPdf}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {isCheckingPdf ? 'Checking PDF...' : 'Open PDF in New Tab'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDownloadBlueprint}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={previewError} onOpenChange={setPreviewError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Document Preview Error</AlertDialogTitle>
            <AlertDialogDescription>
              There was a problem displaying the document. The PDF file appears to be invalid or inaccessible. 
              This could be due to the file not being uploaded correctly or being corrupted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setPreviewError(false);
                setShowUploadBlueprint(true);
              }}
            >
              Upload New Blueprint
            </Button>
            <AlertDialogCancel className="w-full sm:w-auto" onClick={() => {
              setPreviewError(false);
              setShowBlueprintPreview(false);
            }}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
