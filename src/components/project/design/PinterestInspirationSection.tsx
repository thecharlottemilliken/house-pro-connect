
import React, { useState } from "react";
import PinterestConnector from "./PinterestConnector";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EmptyDesignState from "./EmptyDesignState";
import { type PinterestBoard } from "@/types/pinterest";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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

  const handlePinterestBoardsSelected = (boards: PinterestBoard[]) => {
    console.log("Pinterest boards selected:", boards);
    onAddPinterestBoards(boards);
    
    // Extract images from the boards to add as inspiration
    const newImages = boards.flatMap(board => board.pins?.map(pin => pin.imageUrl) || []);
    if (newImages.length > 0) {
      onAddInspiration(newImages);
    }
  };
  
  const openPinterestBoard = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleBoardExpansion = (boardId: string) => {
    setExpandedBoard(expandedBoard === boardId ? null : boardId);
  };

  const renderPins = (board: PinterestBoard) => {
    if (!board.pins || board.pins.length === 0) return null;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
        {board.pins.map((pin) => (
          <div key={pin.id} className="relative group">
            <AspectRatio ratio={1}>
              <img
                src={pin.imageUrl}
                alt={pin.description || "Pinterest pin"}
                className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                onError={(e) => {
                  console.error("Failed to load image:", pin.imageUrl);
                  e.currentTarget.src = "https://placehold.co/600x400?text=Image+Not+Found";
                }}
              />
            </AspectRatio>
            {pin.description && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <p className="text-white text-xs line-clamp-2">{pin.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderBoardContent = (board: PinterestBoard) => (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-100 relative">
        {board.imageUrl ? (
          <img 
            src={board.imageUrl} 
            alt={board.name} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              console.error("Failed to load board image:", board.imageUrl);
              e.currentTarget.src = "https://placehold.co/600x400?text=Board+Image";
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-pink-50">
            <span className="text-pink-500">Pinterest</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-1 truncate">{board.name}</h3>
        <div className="flex justify-between items-center mt-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-pink-500 hover:text-pink-700 hover:bg-pink-50 text-xs p-2 h-auto"
            onClick={() => openPinterestBoard(board.url)}
          >
            <ExternalLink className="h-3 w-3 mr-1" /> Open Board
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-xs p-2 h-auto"
            onClick={() => toggleBoardExpansion(board.id)}
          >
            <Image className="h-3 w-3 mr-1" />
            {expandedBoard === board.id ? "Hide Pins" : "Show Pins"}
          </Button>
        </div>
      </div>
      {expandedBoard === board.id && renderPins(board)}
    </div>
  );

  const renderTabContent = () => {
    if (selectedTab === 'images') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {inspirationImages.map((img, idx) => (
            <div key={idx} className="aspect-video bg-gray-100 rounded overflow-hidden">
              <img 
                src={img} 
                alt={`Inspiration ${idx + 1}`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Failed to load inspiration image:", img);
                  e.currentTarget.src = "https://placehold.co/600x400?text=Image+Not+Found";
                }}
              />
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {pinterestBoards.map((board) => (
            <div key={board.id}>
              {renderBoardContent(board)}
            </div>
          ))}
        </div>
      );
    }
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
    </div>
  );
};

export default PinterestInspirationSection;
