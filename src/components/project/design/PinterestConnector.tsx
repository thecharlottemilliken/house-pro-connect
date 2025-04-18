
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PinterestLogo } from "@/components/icons/PinterestLogo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PinterestBoard } from "@/hooks/useProjectData";

interface PinterestConnectorProps {
  onBoardsSelected: (boards: PinterestBoard[]) => void;
}

const PinterestConnector: React.FC<PinterestConnectorProps> = ({ onBoardsSelected }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [boardUrl, setBoardUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      if (!boardUrl) {
        toast({
          title: "Error",
          description: "Please enter a Pinterest board URL",
          variant: "destructive",
        });
        return;
      }

      // Validate Pinterest board URL format
      const pinterestUrlRegex = /^https?:\/\/(?:www\.)?pinterest\.(?:\w+)\/([^\/]+)\/([^\/]+)/;
      const match = boardUrl.match(pinterestUrlRegex);

      if (!match) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid Pinterest board URL",
          variant: "destructive",
        });
        return;
      }

      const [, username, boardName] = match;
      const boardId = `${username}-${boardName}`;
      
      const board: PinterestBoard = {
        id: boardId,
        name: boardName.replace(/-/g, ' '),
        url: boardUrl,
        imageUrl: "https://i.pinimg.com/236x/1e/3f/58/1e3f587572dd30f9d242b3674482503b.jpg" // Default Pinterest logo or preview
      };
      
      onBoardsSelected([board]);
      setIsDialogOpen(false);
      setBoardUrl("");
      
      toast({
        title: "Success",
        description: "Pinterest board added successfully!",
      });
    } catch (error) {
      console.error("Error processing Pinterest board:", error);
      toast({
        title: "Error",
        description: "Failed to add Pinterest board",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2 border-pink-500 text-pink-500 hover:bg-pink-50"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-pink-500 text-white">
          <PinterestLogo className="w-3 h-3" />
        </div>
        Add Pinterest Board
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Pinterest Board</DialogTitle>
            <DialogDescription>
              Share your Pinterest board by entering its URL.
              <div className="mt-2 text-sm text-muted-foreground">
                Example: https://pinterest.com/username/board-name
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pinterest Board URL</label>
              <Input 
                placeholder="https://pinterest.com/username/board-name"
                value={boardUrl}
                onChange={(e) => setBoardUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Open your Pinterest board, copy the URL from your browser, and paste it here
              </p>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConnect}
              disabled={isLoading || !boardUrl}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              Add Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PinterestConnector;
