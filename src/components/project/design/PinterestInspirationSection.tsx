
import React, { useState, useEffect } from "react";
import PinterestConnector from "./PinterestConnector";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EmptyDesignState from "./EmptyDesignState";
import { type PinterestBoard } from "@/types/pinterest";
import PinterestBoardCard from "./PinterestBoardCard";
import InspirationImagesGrid from "./InspirationImagesGrid";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Json } from "@/integrations/supabase/types";

interface PinterestInspirationSectionProps {
  inspirationImages: string[];
  pinterestBoards: PinterestBoard[];
  onAddInspiration: (images: string[], roomId?: string) => void;
  onAddPinterestBoards: (boards: PinterestBoard[], room: string, roomId?: string) => void;
  currentRoom: string;
  roomId?: string;
}

const PinterestInspirationSection: React.FC<PinterestInspirationSectionProps> = ({
  inspirationImages = [],
  pinterestBoards = [],
  onAddInspiration,
  onAddPinterestBoards,
  currentRoom,
  roomId
}) => {
  const [hasInspiration, setHasInspiration] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'images' | 'boards'>('images');
  const [expandedBoard, setExpandedBoard] = useState<string | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<PinterestBoard | null>(null);
  const [localPinterestBoards, setLocalPinterestBoards] = useState<PinterestBoard[]>(pinterestBoards);

  // Update hasInspiration based on local state
  useEffect(() => {
    setHasInspiration(inspirationImages.length > 0 || localPinterestBoards.length > 0);
  }, [inspirationImages, localPinterestBoards]);

  // Sync with prop changes
  useEffect(() => {
    setLocalPinterestBoards(pinterestBoards);
  }, [pinterestBoards]);
  
  const handlePinterestBoardsSelected = (boards: PinterestBoard[]) => {
    if (!roomId) {
      toast({
        title: "Error",
        description: "Room ID is required to save Pinterest boards",
        variant: "destructive"
      });
      return;
    }
    console.log("Pinterest boards selected for room:", currentRoom, boards);
    onAddPinterestBoards(boards, currentRoom, roomId);
  };

  const handleRemoveBoard = async (boardToRemove: PinterestBoard) => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required to remove Pinterest board");
      }
      
      const updatedBoards = localPinterestBoards.filter(board => board.id !== boardToRemove.id);
      
      // Convert PinterestBoard[] to a format compatible with Supabase's Json type
      const boardsForStorage = updatedBoards.map(board => ({
        id: board.id,
        name: board.name,
        url: board.url,
        imageUrl: board.imageUrl,
        pins: board.pins ? board.pins.map(pin => ({
          id: pin.id,
          imageUrl: pin.imageUrl,
          description: pin.description
        })) : undefined
      })) as unknown as Json;
      
      const { error: updateError } = await supabase
        .from('room_design_preferences')
        .update({ 
          pinterest_boards: boardsForStorage,
          updated_at: new Date().toISOString()
        })
        .eq('room_id', roomId);
      
      if (updateError) throw updateError;
      
      onAddPinterestBoards(updatedBoards, currentRoom, roomId);
      setLocalPinterestBoards(updatedBoards);
      setBoardToDelete(null);
      
      toast({
        title: "Pinterest Board Removed",
        description: `"${boardToRemove.name}" has been deleted successfully`,
      });
    } catch (error) {
      console.error("Error removing Pinterest board:", error);
      toast({
        title: "Error Removing Board",
        description: "Failed to remove Pinterest board. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = async (imageToDelete: string) => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required to delete image");
      }
      
      const updatedImages = inspirationImages.filter(img => img !== imageToDelete);
      
      const { error: updateError } = await supabase
        .from('room_design_preferences')
        .update({ 
          inspiration_images: updatedImages,
          updated_at: new Date().toISOString()
        })
        .eq('room_id', roomId);
      
      if (updateError) throw updateError;
      
      onAddInspiration(updatedImages, roomId);
      
      toast({
        title: "Image Removed",
        description: "The inspiration image has been deleted successfully",
      });
    } catch (error) {
      console.error("Error removing inspiration image:", error);
      toast({
        title: "Error Removing Image",
        description: "Failed to remove inspiration image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openPinterestBoard = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleBoardExpansion = (boardId: string) => {
    setExpandedBoard(expandedBoard === boardId ? null : boardId);
  };

  const renderTabContent = () => {
    if (selectedTab === 'images') {
      return <InspirationImagesGrid 
        images={inspirationImages} 
        onDeleteImage={handleDeleteImage}
      />;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {localPinterestBoards.map((board) => (
          <PinterestBoardCard
            key={board.id}
            board={board}
            isExpanded={expandedBoard === board.id}
            onToggleExpand={toggleBoardExpansion}
            onOpenBoard={openPinterestBoard}
            onRequestDelete={setBoardToDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Inspiration for {currentRoom}</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="uppercase text-xs flex items-center gap-1"
            onClick={() => toast({
              title: "Add Inspiration",
              description: "Upload inspiration image functionality would be here"
            })}
          >
            <Plus className="h-3.5 w-3.5" /> Add Images
          </Button>
          <PinterestConnector onBoardsSelected={handlePinterestBoardsSelected} />
        </div>
      </div>
      
      {!hasInspiration ? (
        <EmptyDesignState 
          type="inspiration" 
          onAction={() => {}}
        />
      ) : (
        <>
          <div className="flex space-x-2 mb-4 border-b">
            <button
              className={`pb-2 px-4 text-sm font-medium ${
                selectedTab === 'images'
                  ? 'text-pink-500 border-b-2 border-pink-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedTab('images')}
            >
              Images ({inspirationImages.length})
            </button>
            <button
              className={`pb-2 px-4 text-sm font-medium ${
                selectedTab === 'boards'
                  ? 'text-pink-500 border-b-2 border-pink-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedTab('boards')}
            >
              Pinterest Boards ({localPinterestBoards.length})
            </button>
          </div>
          {renderTabContent()}
        </>
      )}
      
      <AlertDialog open={!!boardToDelete} onOpenChange={(open) => !open && setBoardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pinterest Board</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this Pinterest board? This will remove all associated pins from your inspiration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => boardToDelete && handleRemoveBoard(boardToDelete)}
              className="bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PinterestInspirationSection;
