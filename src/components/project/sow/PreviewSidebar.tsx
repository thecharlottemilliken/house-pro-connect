
import React from 'react';
import { FileImage, FileText, Image, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PreviewSidebarProps {
  projectData: any;
  propertyDetails: any;
}

export function PreviewSidebar({ projectData, propertyDetails }: PreviewSidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  
  const blueprintUrl = propertyDetails?.blueprint_url;
  const designPreferences = projectData?.design_preferences || {};
  const renderingImages = designPreferences.renderingImages || [];
  const beforePhotos = designPreferences.beforePhotos || {};

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
  };

  const FileListItem = ({ name, room, url }: { name: string; room: string; url: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <FileImage className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{room}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={url}
          download
          className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <FileText className="w-4 h-4" />
        </a>
        <button
          onClick={() => handlePreview(url)}
          className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Image className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="fixed right-4 top-20 z-50 gap-2"
          >
            <FileImage className="h-4 w-4" />
            Project Assets
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <div className="flex items-center justify-between pb-4 border-b">
              <SheetTitle className="text-2xl font-bold">Project Assets</SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-80px)] mt-6">
            <div className="px-1">
              <Accordion type="single" collapsible className="w-full">
                {blueprintUrl && (
                  <AccordionItem value="blueprint" className="border-none">
                    <AccordionTrigger className="py-4 text-base font-semibold">
                      Blueprint
                    </AccordionTrigger>
                    <AccordionContent>
                      <FileListItem
                        name="Blueprint.pdf"
                        room="Property"
                        url={blueprintUrl}
                      />
                    </AccordionContent>
                  </AccordionItem>
                )}

                {Object.entries(beforePhotos).length > 0 && (
                  <AccordionItem value="before-photos" className="border-none">
                    <AccordionTrigger className="py-4 text-base font-semibold">
                      Before Photos
                    </AccordionTrigger>
                    <AccordionContent>
                      {Object.entries(beforePhotos).map(([room, photos]) => (
                        Array.isArray(photos) && photos.map((photo, index) => (
                          <FileListItem
                            key={`${room}-${index}`}
                            name={`Photo ${index + 1}`}
                            room={room}
                            url={photo}
                          />
                        ))
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {renderingImages.length > 0 && (
                  <AccordionItem value="renderings" className="border-none">
                    <AccordionTrigger className="py-4 text-base font-semibold">
                      Renderings
                    </AccordionTrigger>
                    <AccordionContent>
                      {renderingImages.map((image: string, index: number) => (
                        <FileListItem
                          key={index}
                          name={`Rendering ${index + 1}`}
                          room="Design"
                          url={image}
                        />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <img 
              src={previewUrl || ''} 
              alt="Preview" 
              className="w-full h-full object-contain bg-black/5"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
