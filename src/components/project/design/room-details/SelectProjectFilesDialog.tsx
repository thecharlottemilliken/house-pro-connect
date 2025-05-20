
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SelectProjectFilesDialog from "../SelectProjectFilesDialog";

interface FileSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  onSelect: (files: string[]) => void;
}

const FileSelectionDialog: React.FC<FileSelectionDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  onSelect
}) => {
  if (!projectId) return null;

  return (
    <SelectProjectFilesDialog
      open={open}
      onOpenChange={onOpenChange}
      projectId={projectId}
      onSelect={onSelect}
    />
  );
};

export default FileSelectionDialog;
