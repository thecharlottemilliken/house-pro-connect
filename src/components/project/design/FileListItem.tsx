import React, { useState } from "react";
import { Download, Eye, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

interface FileListItemProps {
  name: string;
  size: string;
  type: 'pdf' | 'xls';
  onDownload: () => void;
  onView: () => void;
  onDelete: () => void;
}

export const FileListItem = ({ name, size, type, onDownload, onView, onDelete }: FileListItemProps) => {
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

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${type === 'pdf' ? 'bg-blue-100' : 'bg-green-100'}`}>
            <span className={`text-xs font-medium uppercase ${type === 'pdf' ? 'text-blue-600' : 'text-green-600'}`}>
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

      <Sheet open={showPreview} onOpenChange={setShowPreview}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{name}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {type === 'pdf' ? (
              <iframe
                src={`https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(name)}`}
                className="w-full h-[80vh]"
                title="PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-[80vh] bg-gray-100 rounded-lg">
                <p className="text-gray-500">Preview not available for this file type</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

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
