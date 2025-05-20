
import React, { useState, useEffect } from 'react';
import PinterestConnector from './PinterestConnector';
import PinterestBoardCard from './PinterestBoardCard';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUp } from 'lucide-react';
import InspirationImagesGrid from './InspirationImagesGrid';
import UploadInspirationModal from './UploadInspirationModal';
import PinterestPinsGrid from './PinterestPinsGrid';

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

  // Debug when props change
  useEffect(() => {
    console.log(`PinterestInspirationSection - Room: ${currentRoom}, RoomId: ${roomId}`);
    console.log(`PinterestInspirationSection - Inspiration images count: ${inspirationImages?.length || 0}`);
    if (inspirationImages && inspirationImages.length > 0) {
      console.log("First few inspiration images:", inspirationImages.slice(0, 3));
    }
    console.log(`PinterestInspirationSection - Pinterest boards count: ${pinterestBoards?.length || 0}`);
  }, [currentRoom, roomId, inspirationImages, pinterestBoards]);

  const handleUploadComplete = (urls: string[]) => {
    if (urls.length > 0) {
      console.log(`Uploading inspiration images for room: ${currentRoom}, roomId: ${roomId || 'undefined'}`);
      console.log(`Number of images being uploaded: ${urls.length}`);
      console.log("Image URLs being uploaded:", urls);
      onAddInspiration(urls, roomId);
    }
  };

  const handleDeleteImage = (imageUrl: string) => {
    // Filter out the deleted image
    const updatedImages = inspirationImages.filter(url => url !== imageUrl);
    // Update with the new list (equivalent to adding the filtered list)
    console.log(`Deleting image for room: ${currentRoom}, roomId: ${roomId || 'undefined'}`);
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
              console.log(`Adding Pinterest boards for room: ${currentRoom}, roomId: ${roomId || 'undefined'}`);
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
                  onOpenBoard={(url) => window.open(url, '_blank')}
                  onRequestDelete={(board) => {
                    const updatedBoards = pinterestBoards.filter(b => b.id !== board.id);
                    console.log(`Removing Pinterest board for room: ${currentRoom}, roomId: ${roomId || 'undefined'}`);
                    onAddPinterestBoards(updatedBoards, currentRoom, roomId);
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
