
import React, { useState } from "react";
import { Download, Eye, X } from "lucide-react";
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface FileListItemProps {
  name: string;
  size: string;
  type: 'pdf' | 'xls' | 'jpg' | 'png';
  url?: string;
  onDownload: () => void;
  onView: () => void;
  onDelete: () => void;
}

export const FileListItem = ({ name, size, type, url, onDownload, onView, onDelete }: FileListItemProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  const handlePreview = () => {
    onView();
    setShowPreview(true);
  };

  const getFileTypeColor = () => {
    switch (type) {
      case 'pdf':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'xls':
        return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'jpg':
      case 'png':
        return { bg: 'bg-purple-100', text: 'text-purple-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const fileTypeColors = getFileTypeColor();

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${fileTypeColors.bg}`}>
            <span className={`text-xs font-medium uppercase ${fileTypeColors.text}`}>
              {type}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{name}</p>
            <p className="text-xs text-gray-500">{size}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onDownload}
            className="p-1.5 text-gray-500 hover:text-gray-700"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowDeleteDialog(true)}
            className="p-1.5 text-gray-500 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
          <button 
            onClick={handlePreview}
            className="p-1.5 text-gray-500 hover:text-gray-700"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Drawer open={showPreview} onOpenChange={setShowPreview}>
        <DrawerContent className="h-[90vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle>{name}</DrawerTitle>
            <DrawerDescription>
              {type === 'pdf' ? 'PDF Document' : 
               type === 'xls' ? 'Excel Sheet' : 
               'Image'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 h-full">
            {type === 'pdf' && url ? (
              <iframe
                src={`https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}`}
                className="w-full h-[70vh]"
                title="PDF Preview"
              />
            ) : (type === 'jpg' || type === 'png') && url ? (
              <img 
                src={url} 
                alt={name} 
                className="max-w-full max-h-[70vh] mx-auto object-contain" 
              />
            ) : (
              <div className="flex items-center justify-center h-[70vh] bg-gray-100 rounded-lg">
                <p className="text-gray-500">Preview not available for this file type</p>
              </div>
            )}
          </div>
          <DrawerFooter className="border-t">
            <DrawerClose asChild>
              <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
                Close
              </button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
