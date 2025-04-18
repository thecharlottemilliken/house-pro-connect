
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { ExternalLink, Image, X } from "lucide-react";
import { type PinterestBoard } from "@/types/pinterest";
import PinterestPinsGrid from "./PinterestPinsGrid";

interface PinterestBoardCardProps {
  board: PinterestBoard;
  isExpanded: boolean;
  onToggleExpand: (boardId: string) => void;
  onOpenBoard: (url: string) => void;
  onRequestDelete: (board: PinterestBoard) => void;
}

const PinterestBoardCard: React.FC<PinterestBoardCardProps> = ({
  board,
  isExpanded,
  onToggleExpand,
  onOpenBoard,
  onRequestDelete,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-100 relative group">
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete(board);
          }}
          className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          aria-label="Remove board"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-1 truncate">{board.name}</h3>
        <div className="flex justify-between items-center mt-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-pink-500 hover:text-pink-700 hover:bg-pink-50 text-xs p-2 h-auto"
            onClick={() => onOpenBoard(board.url)}
          >
            <ExternalLink className="h-3 w-3 mr-1" /> Open Board
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-xs p-2 h-auto"
            onClick={() => onToggleExpand(board.id)}
          >
            <Image className="h-3 w-3 mr-1" />
            {isExpanded ? "Hide Pins" : "Show Pins"}
          </Button>
        </div>
      </div>
      {isExpanded && <PinterestPinsGrid pins={board.pins || []} />}
    </div>
  );
};

export default PinterestBoardCard;
