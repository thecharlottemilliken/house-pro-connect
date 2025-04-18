
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
import { type PinterestBoard } from "@/types/pinterest";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface PinterestConnectorProps {
  onBoardsSelected: (boards: PinterestBoard[]) => void;
}

const PinterestConnector: React.FC<PinterestConnectorProps> = ({ onBoardsSelected }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [boardUrls, setBoardUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const addBoardInput = () => {
    setBoardUrls(prev => [...prev, '']);
  };

  const removeBoardInput = (index: number) => {
    setBoardUrls(prev => prev.filter((_, i) => i !== index));
  };

  const updateBoardUrl = (index: number, value: string) => {
    setBoardUrls(prev => prev.map((url, i) => i === index ? value : url));
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const nonEmptyUrls = boardUrls.filter(url => url.trim() !== '');
      
      if (nonEmptyUrls.length === 0) {
        toast({
          title: "Error",
          description: "Please enter at least one Pinterest board URL",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const boardsData: PinterestBoard[] = await Promise.all(
        nonEmptyUrls.map(async (url) => {
          // Validate Pinterest board URL format
          const pinterestUrlRegex = /^https?:\/\/(?:www\.)?pinterest\.(?:\w+)\/([^\/]+)\/([^\/]+)/;
          const match = url.match(pinterestUrlRegex);

          if (!match) {
            throw new Error(`Invalid Pinterest URL: ${url}`);
          }

          const [, username, boardName] = match;
          const boardId = `${username}-${boardName}`;

          // Attempt to scrape the board cover image - use a fallback for CORS issues
          try {
            const response = await fetch(`https://www.pinterest.com/${username}/${boardName}`);
            const html = await response.text();
            
            // Extract og:image meta tag for cover photo
            const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/);
            const coverImage = ogImageMatch ? ogImageMatch[1] : null;

            return {
              id: boardId,
              name: boardName.replace(/-/g, ' '),
              url: url,
              imageUrl: coverImage || "https://placehold.co/600x400?text=Pinterest+Board",
              pins: [
                {
                  id: "1",
                  imageUrl: "https://placehold.co/600x400?text=Sample+Pin",
                  description: "Sample Pin"
                }
              ]
            };
          } catch (error) {
            console.error('Error scraping board cover:', error);
            // Return board with default cover image if scraping fails
            return {
              id: boardId,
              name: boardName.replace(/-/g, ' '),
              url: url,
              imageUrl: "https://placehold.co/600x400?text=Pinterest+Board",
              pins: [
                {
                  id: "1",
                  imageUrl: "https://placehold.co/600x400?text=Sample+Pin",
                  description: "Sample Pin"
                }
              ]
            };
          }
        })
      );

      onBoardsSelected(boardsData);
      setIsDialogOpen(false);
      setBoardUrls(['']);
      
      toast({
        title: "Success",
        description: `Added ${boardsData.length} Pinterest board${boardsData.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error("Error processing Pinterest boards:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add Pinterest boards",
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
            <DialogTitle>Add Pinterest Boards</DialogTitle>
            <DialogDescription>
              Share your Pinterest boards by entering their URLs.
            </DialogDescription>
            <div className="mt-2 text-sm text-muted-foreground">
              Example: https://pinterest.com/username/board-name
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {boardUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input 
                    placeholder="https://pinterest.com/username/board-name"
                    value={url}
                    onChange={(e) => updateBoardUrl(index, e.target.value)}
                  />
                </div>
                {boardUrls.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBoardInput(index)}
                    className="h-10 w-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              variant="outline"
              className="w-full"
              onClick={addBoardInput}
              type="button"
            >
              Add Another Board
            </Button>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConnect}
              disabled={isLoading || boardUrls.every(url => !url.trim())}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              {isLoading ? "Adding..." : "Add Boards"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PinterestConnector;
