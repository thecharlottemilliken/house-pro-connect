
import React, { useState } from 'react';
import { PinterestConnector } from './PinterestConnector';
import { PinterestBoardCard } from './PinterestBoardCard';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUp } from 'lucide-react';
import InspirationImagesGrid from './InspirationImagesGrid';
import UploadInspirationModal from './UploadInspirationModal';
import { PinterestPinsGrid } from './PinterestPinsGrid';

interface PinterestInspirationSectionProps {
  inspirationImages: string[];
  pinterestBoards: any[];
  onAddInspiration: (images: string[], roomId?: string) => void;
  onAddPinterestBoards: (boards: any[], roomName: string, roomId?: string) => void;
  currentRoom: string;
  roomId?: string;
}

const PinterestInspirationSection: React.FC<PinterestInspirationSectionProps> = ({
  inspirationImages,
  pinterestBoards,
  onAddInspiration,
  onAddPinterestBoards,
  currentRoom,
  roomId
}) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [expandedBoard, setExpandedBoard] = useState<string | null>(null);

  const handleUploadComplete = (urls: string[]) => {
    if (urls.length > 0) {
      console.log("Uploading inspiration images:", urls);
      onAddInspiration(urls, roomId);
    }
  };

  const handleDeleteImage = (imageUrl: string) => {
    // Filter out the deleted image
    const updatedImages = inspirationImages.filter(url => url !== imageUrl);
    // Update with the new list (equivalent to adding the filtered list)
    onAddInspiration(updatedImages, roomId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Inspiration</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Upload Images
          </Button>
          <PinterestConnector 
            onBoardsSelected={(boards) => {
              onAddPinterestBoards(boards, currentRoom, roomId);
            }}
          />
        </div>
      </div>

      {/* Inspiration Images */}
      {(inspirationImages && inspirationImages.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Uploaded Images</h3>
          <InspirationImagesGrid 
            images={inspirationImages} 
            onDeleteImage={handleDeleteImage}
          />
        </div>
      )}

      {/* Pinterest Boards */}
      {pinterestBoards && pinterestBoards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Pinterest Boards</h3>
          <div className="space-y-4">
            {pinterestBoards.map((board, index) => (
              <div key={`${board.id}-${index}`} className="space-y-2">
                <PinterestBoardCard 
                  board={board}
                  isExpanded={expandedBoard === board.id}
                  onToggleExpand={() => {
                    setExpandedBoard(expandedBoard === board.id ? null : board.id);
                  }}
                />
                
                {expandedBoard === board.id && board.pins && (
                  <PinterestPinsGrid pins={board.pins} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      <UploadInspirationModal
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadComplete={handleUploadComplete}
        roomName={currentRoom}
      />
    </div>
  );
};

export default PinterestInspirationSection;
