
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
  
  const blueprintUrl = propertyDetails?.blueprint_url;
  const designPreferences = projectData?.design_preferences || {};
  const renderingImages = designPreferences.renderingImages || [];
  const beforePhotos = designPreferences.beforePhotos || {};

  const renderImagePreview = (url: string) => (
    <div className="relative aspect-video rounded-md overflow-hidden border border-gray-200 mb-2">
      <img src={url} alt="Preview" className="w-full h-full object-cover" />
    </div>
  );

  return (
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
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle>Project Assets</SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-80px)] px-6">
          <Accordion type="single" collapsible className="w-full">
            {blueprintUrl && (
              <AccordionItem value="blueprint">
                <AccordionTrigger className="gap-2">
                  <FileText className="h-4 w-4" /> Blueprint
                </AccordionTrigger>
                <AccordionContent>
                  {renderImagePreview(blueprintUrl)}
                </AccordionContent>
              </AccordionItem>
            )}

            {Object.entries(beforePhotos).length > 0 && (
              <AccordionItem value="before-photos">
                <AccordionTrigger className="gap-2">
                  <Image className="h-4 w-4" /> Before Photos
                </AccordionTrigger>
                <AccordionContent>
                  {Object.entries(beforePhotos).map(([room, photos]) => (
                    <div key={room} className="mb-4">
                      <h4 className="text-sm font-medium mb-2">{room}</h4>
                      {Array.isArray(photos) && photos.map((photo, index) => (
                        renderImagePreview(photo)
                      ))}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}

            {renderingImages.length > 0 && (
              <AccordionItem value="renderings">
                <AccordionTrigger className="gap-2">
                  <FileImage className="h-4 w-4" /> Renderings
                </AccordionTrigger>
                <AccordionContent>
                  {renderingImages.map((image: string, index: number) => (
                    renderImagePreview(image)
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
