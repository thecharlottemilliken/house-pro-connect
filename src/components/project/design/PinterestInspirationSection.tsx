
import React, { useState } from "react";
import PinterestConnector from "./PinterestConnector";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EmptyDesignState from "./EmptyDesignState";
import { PinterestBoard } from "@/hooks/useProjectData";

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

  const handlePinterestBoardsSelected = (boards: PinterestBoard[]) => {
    onAddPinterestBoards(boards);
    
    // For demo purposes, extract some images from the boards to add as inspiration
    // In a real implementation, this would fetch actual images from the Pinterest API
    const mockImages = [
      "https://i.pinimg.com/564x/a1/94/a5/a194a58ce675f39a3d74e9b41e6be00a.jpg",
      "https://i.pinimg.com/564x/8e/bf/36/8ebf36a1f7f2c91c92b3bcf595be3c59.jpg",
      "https://i.pinimg.com/564x/5e/66/28/5e6628e606068dbeaa81e9dfbd489fe8.jpg"
    ];
    
    // Add these mock images to inspiration
    onAddInspiration(mockImages);
  };
  
  const openPinterestBoard = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderTabContent = () => {
    if (selectedTab === 'images') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {inspirationImages.map((img, idx) => (
            <div key={idx} className="aspect-video bg-gray-100 rounded overflow-hidden">
              <img src={img} alt={`Inspiration ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {pinterestBoards.map((board) => (
            <div 
              key={board.id} 
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-100 relative">
                {board.imageUrl ? (
                  <img src={board.imageUrl} alt={board.name} className="w-full h-full object-cover" />
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
                </div>
              </div>
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
