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

interface PinterestInspirationSectionProps {
  inspirationImages: string[];
  pinterestBoards?: PinterestBoard[];
  onAddInspiration: (images: string[]) => void;
  onAddPinterestBoards: (boards: PinterestBoard[], room: string) => void;
  currentRoom: string;
}

const PinterestInspirationSection: React.FC<PinterestInspirationSectionProps> = ({
  inspirationImages = [],
  pinterestBoards = [],
  onAddInspiration,
  onAddPinterestBoards,
  currentRoom
}) => {
  const hasInspiration = inspirationImages.length > 0 || pinterestBoards.length > 0;
  const [selectedTab, setSelectedTab] = useState<'images' | 'boards'>('images');
  const [expandedBoard, setExpandedBoard] = useState<string | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<PinterestBoard | null>(null);
  const [localPinterestBoards, setLocalPinterestBoards] = useState<PinterestBoard[]>(pinterestBoards);

  useEffect(() => {
    setLocalPinterestBoards(pinterestBoards);
  }, [pinterestBoards]);
  
  const handlePinterestBoardsSelected = (boards: PinterestBoard[]) => {
    console.log("Pinterest boards selected for room:", currentRoom, boards);
    onAddPinterestBoards(boards, currentRoom);
  };

  const handleRemoveBoard = async (boardToRemove: PinterestBoard) => {
    try {
      console.log("Attempting to remove board:", boardToRemove);
      
      const urlPath = window.location.pathname;
      const projectId = urlPath.substring(urlPath.lastIndexOf('/') + 1);
      
      if (!projectId) {
        throw new Error("Could not determine project ID");
      }
      
      const updatedBoards = localPinterestBoards.filter(board => board.id !== boardToRemove.id);
      
      const boardPinUrls = boardToRemove.pins?.map(pin => pin.imageUrl) || [];
      const updatedInspiration = inspirationImages.filter(img => !boardPinUrls.includes(img));
      
      const { data: projectData, error: fetchError } = await supabase
        .from('projects')
        .select('design_preferences')
        .eq('id', projectId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const designPreferences = projectData.design_preferences 
        ? JSON.parse(JSON.stringify(projectData.design_preferences)) 
        : {};
      
      designPreferences.pinterestBoards = updatedBoards;
      designPreferences.inspirationImages = updatedInspiration;
      
      const { error: updateError } = await supabase
        .from('projects')
        .update({ design_preferences: designPreferences })
        .eq('id', projectId);
      
      if (updateError) throw updateError;
      
      onAddPinterestBoards(updatedBoards);
      onAddInspiration(updatedInspiration);
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
      const urlPath = window.location.pathname;
      const projectId = urlPath.substring(urlPath.lastIndexOf('/') + 1);
      
      if (!projectId) {
        throw new Error("Could not determine project ID");
      }
      
      const updatedImages = inspirationImages.filter(img => img !== imageToDelete);
      
      const { data: projectData, error: fetchError } = await supabase
        .from('projects')
        .select('design_preferences')
        .eq('id', projectId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const designPreferences = projectData.design_preferences 
        ? JSON.parse(JSON.stringify(projectData.design_preferences)) 
        : {};
      
      designPreferences.inspirationImages = updatedImages;
      
      const { error: updateError } = await supabase
        .from('projects')
        .update({ design_preferences: designPreferences })
        .eq('id', projectId);
      
      if (updateError) throw updateError;
      
      onAddInspiration(updatedImages);
      
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
