import React, { useState, useEffect } from "react";
import PinterestConnector from "./PinterestConnector";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EmptyDesignState from "./EmptyDesignState";
import { type PinterestBoard } from "@/types/pinterest";
import PinterestBoardCard from "./PinterestBoardCard";
import InspirationImagesGrid from "./InspirationImagesGrid";
import { supabase } from "@/integrations/supabase/client";
import UploadInspirationModal from "./UploadInspirationModal";
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
import { Card, CardContent } from "@/components/ui/card";

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
  const [selectedTab, setSelectedTab] = useState<'uploaded' | 'pinterest'>('uploaded');
  const [expandedBoard, setExpandedBoard] = useState<string | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<PinterestBoard | null>(null);
  const [localPinterestBoards, setLocalPinterestBoards] = useState<PinterestBoard[]>(pinterestBoards);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    setLocalPinterestBoards(pinterestBoards);
  }, [pinterestBoards]);

  useEffect(() => {
    setHasInspiration(inspirationImages.length > 0 || localPinterestBoards.length > 0);
  }, [inspirationImages, localPinterestBoards]);
  
  const handlePinterestBoardsSelected = (boards: PinterestBoard[]) => {
    if (!roomId) {
      toast({
        title: "Error",
        description: "Room ID is required to save Pinterest boards",
        variant: "destructive"
      });
      return;
    }
    
    onAddPinterestBoards(boards, currentRoom, roomId);
  };

  const handleRemoveBoard = async (boardToRemove: PinterestBoard) => {
    try {
      if (!roomId) {
        throw new Error("Room ID is required to remove Pinterest board");
      }
      
      const updatedBoards = localPinterestBoards.filter(board => board.id !== boardToRemove.id);
      
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
    if (selectedTab === 'uploaded') {
      return inspirationImages.length > 0 ? (
        <InspirationImagesGrid 
          images={inspirationImages} 
          onDeleteImage={handleDeleteImage}
        />
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No images uploaded yet</p>
          <Button 
            variant="outline" 
            className="mt-4 border-[#174c65] text-[#174c65] hover:bg-[#174c65]/5"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Upload Images
          </Button>
        </div>
      );
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

  const handleUploadComplete = (uploadedUrls: string[]) => {
    if (!roomId) {
      toast({
        title: "Error",
        description: "Room ID is required to save inspiration images",
        variant: "destructive"
      });
      return;
    }

    onAddInspiration([...inspirationImages, ...uploadedUrls], roomId);
    setIsUploadModalOpen(false);
  };

  return (
    <Card className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white text-black h-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-2xl">Inspiration</h3>
            <p className="text-gray-500 mt-1">Collect design ideas for your {currentRoom.toLowerCase()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="bg-white text-gray-700 hover:bg-gray-100 flex items-center gap-1"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <ImagePlus className="h-4 w-4" /> 
              <span className="hidden sm:inline">Add Inspiration</span>
            </Button>
            <PinterestConnector onBoardsSelected={handlePinterestBoardsSelected} />
          </div>
        </div>
        
        {!hasInspiration ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ImagePlus className="h-6 w-6 text-gray-500" />
            </div>
            <h4 className="font-semibold text-gray-900">Add design inspiration</h4>
            <p className="text-gray-500 max-w-md mt-1 mb-4">
              Upload images or connect your Pinterest boards to organize your design ideas
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Upload Images
              </Button>
              <PinterestConnector 
                onBoardsSelected={handlePinterestBoardsSelected} 
                buttonClassName="border-gray-300 text-gray-700 hover:bg-gray-100"
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex space-x-4 mb-6">
              <button
                className={`pb-2 text-base font-medium border-b-2 transition-colors ${
                  selectedTab === 'uploaded'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedTab('uploaded')}
              >
                Uploaded ({inspirationImages.length})
              </button>
              <button
                className={`pb-2 text-base font-medium border-b-2 transition-colors ${
                  selectedTab === 'pinterest'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedTab('pinterest')}
              >
                Pinterest ({localPinterestBoards.length})
              </button>
            </div>
            
            {selectedTab === 'uploaded' ? (
              inspirationImages.length > 0 ? (
                <InspirationImagesGrid 
                  images={inspirationImages} 
                  onDeleteImage={handleDeleteImage}
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No images uploaded yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Upload Images
                  </Button>
                </div>
              )
            ) : (
              localPinterestBoards.length > 0 ? (
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
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No Pinterest boards connected yet</p>
                  <PinterestConnector 
                    onBoardsSelected={handlePinterestBoardsSelected}
                    buttonClassName="mt-4 border-gray-300 text-gray-700 hover:bg-gray-100"
                  />
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
      
      <UploadInspirationModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
        roomName={currentRoom}
      />
      
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
    </Card>
  );
};

export default PinterestInspirationSection;
