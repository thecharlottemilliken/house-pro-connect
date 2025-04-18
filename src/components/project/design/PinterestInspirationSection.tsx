
import React, { useState } from "react";
import PinterestConnector from "./PinterestConnector";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

interface PinterestInspirationSectionProps {
  inspirationImages: string[];
  pinterestBoards?: PinterestBoard[];
  onAddInspiration: (images: string[]) => void;
  onAddPinterestBoards: (boards: PinterestBoard[]) => void;
}

const PinterestInspirationSection: React.FC<PinterestInspirationSectionProps> = ({
  inspirationImages = [],
  pinterestBoards = [],
  onAddInspiration,
  onAddPinterestBoards
}) => {
  const hasInspiration = inspirationImages.length > 0 || pinterestBoards.length > 0;
  const [selectedTab, setSelectedTab] = useState<'images' | 'boards'>('images');
  const [expandedBoard, setExpandedBoard] = useState<string | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<PinterestBoard | null>(null);

  const handlePinterestBoardsSelected = (boards: PinterestBoard[]) => {
    console.log("Pinterest boards selected:", boards);
    onAddPinterestBoards(boards);
    
    const newImages = boards.flatMap(board => board.pins?.map(pin => pin.imageUrl) || []);
    if (newImages.length > 0) {
      onAddInspiration(newImages);
    }
  };

  const handleRemoveBoard = async (boardToRemove: PinterestBoard) => {
    try {
      console.log("Removing board:", boardToRemove);
      
      // Get current boards from state and filter out the one to remove
      const updatedBoards = pinterestBoards.filter(board => board.id !== boardToRemove.id);
      
      // Get pin image URLs from the board being removed
      const boardPinUrls = boardToRemove.pins?.map(pin => pin.imageUrl) || [];
      
      // Remove those pin URLs from inspiration images
      const updatedInspiration = inspirationImages.filter(img => !boardPinUrls.includes(img));
      
      // Update the Supabase database with the changes
      const { data: projectData, error: fetchError } = await supabase
        .from('projects')
        .select('design_preferences')
        .eq('id', new URL(window.location.href).pathname.split('/').pop())
        .single();
      
      if (fetchError) throw fetchError;
      
      const designPreferences = projectData.design_preferences || {};
      designPreferences.pinterestBoards = updatedBoards;
      designPreferences.inspirationImages = updatedInspiration;
      
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          design_preferences: designPreferences 
        })
        .eq('id', new URL(window.location.href).pathname.split('/').pop());
      
      if (updateError) throw updateError;
      
      // Update UI via passed state update functions
      onAddPinterestBoards(updatedBoards);
      onAddInspiration(updatedInspiration);
      
      // Reset delete confirmation dialog state
      setBoardToDelete(null);
      
      toast({
        title: "Board Removed",
        description: "Pinterest board and related pins have been removed successfully",
      });
    } catch (error) {
      console.error("Error removing board:", error);
      toast({
        title: "Error",
        description: "Failed to remove Pinterest board",
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
      return <InspirationImagesGrid images={inspirationImages} />;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pinterestBoards.map((board) => (
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
        <h2 className="text-xl font-bold">Inspiration</h2>
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
              Pinterest Boards ({pinterestBoards.length})
            </button>
          </div>
          {renderTabContent()}
        </>
      )}
      
      <AlertDialog open={!!boardToDelete} onOpenChange={(open) => !open && setBoardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Pinterest Board</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this board? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => boardToDelete && handleRemoveBoard(boardToDelete)}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PinterestInspirationSection;
