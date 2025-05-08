
import React from 'react';
import { Button } from "@/components/ui/button";

interface AssetUploadButtonsProps {
  onOpenFileSelector: () => void;
  onOpenFileUpload: () => void;
}

const AssetUploadButtons: React.FC<AssetUploadButtonsProps> = ({
  onOpenFileSelector,
  onOpenFileUpload
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      <Button 
        variant="outline" 
        className="w-full py-1 text-xs text-[#174c65] border-[#174c65] hover:bg-[#174c65]/5"
        onClick={onOpenFileSelector}
      >
        SELECT FROM FILES
      </Button>
      <Button 
        variant="outline" 
        className="w-full py-1 text-xs text-[#174c65] border-[#174c65] hover:bg-[#174c65]/5"
        onClick={onOpenFileUpload}
      >
        UPLOAD
      </Button>
    </div>
  );
};

export default AssetUploadButtons;
