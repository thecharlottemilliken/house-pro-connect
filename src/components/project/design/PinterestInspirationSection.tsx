import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PinterestConnector from "./PinterestConnector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PinterestBoardCard from "./PinterestBoardCard";
import InspirationImagesGrid from "./InspirationImagesGrid";
import UploadInspirationModal from "./UploadInspirationModal";
import { toast } from "@/hooks/use-toast";
import { type PinterestBoard } from "@/types/pinterest";

interface PinterestInspirationSectionProps {
  currentRoom: string;
  roomId?: string;
  projectId?: string;
  inspirationImages?: string[];
  pinterestBoards?: PinterestBoard[];
  onAddInspiration?: (images: string[]) => void;
  onAddPinterestBoards?: (boards: PinterestBoard[]) => void;
}

const PinterestInspirationSection: React.FC<PinterestInspirationSectionProps> = ({ 
  currentRoom,
  roomId,
  projectId,
  inspirationImages: propInspirationImages,
  pinterestBoards: propPinterestBoards,
  onAddInspiration,
  onAddPinterestBoards
}) => {
  const [inspirationImages, setInspirationImages] = useState<string[]>(propInspirationImages || []);
  const [pinterestBoards, setPinterestBoards] = useState<PinterestBoard[]>(propPinterestBoards || []);
  const [isPinterestDialogOpen, setIsPinterestDialogOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    setInspirationImages(propInspirationImages || []);
  }, [propInspirationImages]);

  useEffect(() => {
    setPinterestBoards(propPinterestBoards || []);
  }, [propPinterestBoards]);

  const handleAddInspirationImages = (images: string[]) => {
    setInspirationImages(prevImages => [...prevImages, ...images]);
    if (onAddInspiration) {
      onAddInspiration(images);
    }
    setIsUploadModalOpen(false);
    toast({
      title: "Inspiration added!",
      description: "Successfully added new inspiration images."
    });
  };

  const handleAddPinterestBoards = (boards: PinterestBoard[]) => {
    setPinterestBoards(prevBoards => [...prevBoards, ...boards]);
    if (onAddPinterestBoards) {
      onAddPinterestBoards(boards);
    }
    setIsPinterestDialogOpen(false);
    toast({
      title: "Pinterest boards added!",
      description: "Successfully connected new Pinterest boards."
    });
  };

  return (
    <div className="space-y-6">
      {/* Inspiration Images Section */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Inspiration Images</h3>
            <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Images
            </Button>
          </div>
          
          <InspirationImagesGrid images={inspirationImages} />

          <UploadInspirationModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onAddInspiration={handleAddInspirationImages}
            roomId={roomId}
            currentRoom={currentRoom}
          />
        </CardContent>
      </Card>

      {/* Pinterest Boards Section */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Pinterest Boards</h3>
            <Button variant="outline" size="sm" onClick={() => setIsPinterestDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Connect Boards
            </Button>
          </div>

          {pinterestBoards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinterestBoards.map((board) => (
                <PinterestBoardCard key={board.id} board={board} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No Pinterest boards connected yet.
            </div>
          )}

          <Dialog open={isPinterestDialogOpen} onOpenChange={setIsPinterestDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Connect Pinterest Boards</DialogTitle>
              </DialogHeader>
              <PinterestConnector 
                onAddPinterestBoards={handleAddPinterestBoards} 
                roomId={roomId}
                currentRoom={currentRoom}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default PinterestInspirationSection;
