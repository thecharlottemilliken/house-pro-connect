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
  const [availableBoards, setAvailableBoards] = useState<PinterestBoard[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<Record<string, boolean>>({});

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

      const boardId = boardUrl.split("/").filter(Boolean).pop() || "";
      const boardName = boardId.replace(/-/g, " ");
      
      const mockedBoard: PinterestBoard = {
        id: boardId,
        name: boardName,
        url: boardUrl,
        imageUrl: "https://i.pinimg.com/236x/1e/3f/58/1e3f587572dd30f9d242b3674482503b.jpg"
      };
      
      setAvailableBoards([mockedBoard]);
      setSelectedBoards({[boardId]: true});
      toast({
        title: "Success",
        description: "Pinterest board found!",
      });
    } catch (error) {
      console.error("Error connecting to Pinterest:", error);
      toast({
        title: "Error",
        description: "Failed to connect to Pinterest",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoardSelection = (boardId: string) => {
    setSelectedBoards(prev => ({
      ...prev,
      [boardId]: !prev[boardId]
    }));
  };

  const handleImportBoards = () => {
    const boards = availableBoards.filter(board => selectedBoards[board.id]);
    onBoardsSelected(boards);
    setIsDialogOpen(false);
    toast({
      title: "Boards imported",
      description: `Successfully imported ${boards.length} Pinterest board(s)`,
    });
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
        Connect Pinterest
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Pinterest</DialogTitle>
            <DialogDescription>
              Import inspiration from your Pinterest boards.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pinterest Board URL</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="https://pinterest.com/username/boardname" 
                  value={boardUrl}
                  onChange={(e) => setBoardUrl(e.target.value)}
                />
                <Button 
                  onClick={handleConnect} 
                  disabled={isLoading}
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                >
                  Find
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Enter the URL of your Pinterest board
              </p>
            </div>
            
            {availableBoards.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium">Available Boards</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableBoards.map(board => (
                    <div 
                      key={board.id}
                      className={`p-2 border rounded flex items-center gap-3 cursor-pointer ${
                        selectedBoards[board.id] ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleBoardSelection(board.id)}
                    >
                      {board.imageUrl && (
                        <div className="w-10 h-10 overflow-hidden rounded">
                          <img 
                            src={board.imageUrl} 
                            alt={board.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{board.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {board.url}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImportBoards}
              disabled={!Object.values(selectedBoards).some(Boolean)}
              className="bg-pink-500 hover:bg-pink-600"
            >
              Import Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PinterestConnector;
