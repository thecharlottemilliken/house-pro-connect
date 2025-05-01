
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, Folder } from "lucide-react";

interface SelectProjectFilesDialogProps {
  files: Array<{name: string; url: string; type?: string}>;
  onSelect: (selectedUrls: string[]) => void;
  type?: string;
}

const SelectProjectFilesDialog = ({ files, onSelect, type }: SelectProjectFilesDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  
  const handleToggleSelect = (url: string) => {
    if (selectedFiles.includes(url)) {
      setSelectedFiles(selectedFiles.filter(fileUrl => fileUrl !== url));
    } else {
      setSelectedFiles([...selectedFiles, url]);
    }
  };
  
  const handleConfirm = () => {
    onSelect(selectedFiles);
    setIsOpen(false);
    setSelectedFiles([]);
  };
  
  const handleCancel = () => {
    setIsOpen(false);
    setSelectedFiles([]);
  };
  
  // Filter files by type if needed
  const filteredFiles = type 
    ? files.filter(file => file.type?.includes(type)) 
    : files;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex gap-2">
          <Folder className="h-4 w-4" />
          <span>Select from Project Files</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Project Files</DialogTitle>
        </DialogHeader>
        
        {filteredFiles.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-gray-500">No project files available to select from.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              {filteredFiles.map((file, index) => (
                <div 
                  key={index} 
                  className={`
                    relative aspect-square border rounded-md overflow-hidden cursor-pointer transition-all
                    ${selectedFiles.includes(file.url) ? 'ring-2 ring-offset-2 ring-primary' : 'hover:opacity-90'}
                  `}
                  onClick={() => handleToggleSelect(file.url)}
                >
                  {file.type?.includes('image') || file.url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                    <img 
                      src={file.url} 
                      alt={file.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4 text-center">
                      <div>
                        <div className="flex justify-center mb-2">
                          {file.type?.includes('pdf') ? (
                            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 384 512">
                              <path d="M181.9 256.1c-5-16-4.9-46.9-2-46.9 8.4 0 7.6 36.9 2 46.9zm-1.7 47.2c-7.7 20.2-17.3 43.3-28.4 62.7 18.3-7 39-17.2 62.9-21.9-12.7-9.6-24.9-23.4-34.5-40.8zM86.1 428.1c0 .8 13.2-5.4 34.9-40.2-6.7 6.3-29.1 24.5-34.9 40.2zM248 160h136v328c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V24C0 10.7 10.7 0 24 0h200v136c0 13.2 10.8 24 24 24zm-8 171.8c-20-12.2-33.3-29-42.7-53.8 4.5-18.5 11.6-46.6 6.2-64.2-4.7-29.4-42.4-26.5-47.8-6.8-5 18.3-.4 44.1 8.1 77-11.6 27.6-28.7 64.6-40.8 85.8-.1 0-.1.1-.2.1-27.1 13.9-73.6 44.5-54.5 68 5.6 6.9 16 10 21.5 10 17.9 0 35.7-18 61.1-61.8 25.8-8.5 54.1-19.1 79-23.2 21.7 11.8 47.1 19.5 64 19.5 29.2 0 31.2-32 19.7-43.4-13.9-13.6-54.3-9.7-73.6-7.2zM377 105L279 7c-4.5-4.5-10.6-7-17-7h-6v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-74.1 255.3c4.1-2.7-2.5-11.9-42.8-9 37.1 15.8 42.8 9 42.8 9z"/>
                            </svg>
                          ) : (
                            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 384 512">
                              <path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm160-14.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"/>
                            </svg>
                          )}
                        </div>
                        <p className="text-xs truncate">{file.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedFiles.includes(file.url) && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button 
                onClick={handleConfirm}
                disabled={selectedFiles.length === 0}
              >
                Select {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelectProjectFilesDialog;
