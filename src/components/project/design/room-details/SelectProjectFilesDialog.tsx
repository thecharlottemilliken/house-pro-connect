
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SelectProjectFilesDialog from "../SelectProjectFilesDialog";

interface FileSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  propertyId?: string; // Added propertyId prop
  onSelect: (files: string[]) => void;
}

const FileSelectionDialog: React.FC<FileSelectionDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  propertyId, // Pass propertyId to the inner dialog
  onSelect
}) => {
  if (!projectId) return null;

  return (
    <SelectProjectFilesDialog
      open={open}
      onOpenChange={onOpenChange}
      projectId={projectId}
      propertyId={propertyId}
      onSelect={onSelect}
    />
  );
};

export default FileSelectionDialog;
