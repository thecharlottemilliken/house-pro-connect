
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SelectProjectFilesDialog from "./SelectProjectFilesDialog";

interface FileSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  propertyId?: string;
  onSelect: (files: string[]) => void;
}

const FileSelectionDialog: React.FC<FileSelectionDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  propertyId,
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
