
import React from 'react';
import { FileText, X } from 'lucide-react';

interface FileListItemProps {
  name: string;
  url: string;
  onRemove: () => void;
  tags?: string[];
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  type?: 'pdf' | 'xls' | 'jpg' | 'png';
  size?: string;
}

export const FileListItem = ({ 
  name, 
  url, 
  onRemove, 
  tags = [],
  onView,
  onDownload,
  onDelete,
  type,
  size
}: FileListItemProps) => {
  return (
    <div className="flex items-center justify-between p-2 border rounded-lg">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium truncate max-w-[180px]">{name}</span>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <span 
                key={tag}
                className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
      <button 
        onClick={onRemove} 
        className="p-1 text-gray-400 hover:text-gray-700"
        title="Remove"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
