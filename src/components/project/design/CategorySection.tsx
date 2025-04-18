
import React from "react";
import { Download } from "lucide-react";
import FileListItem from "./FileListItem";

interface CategorySectionProps {
  title: string;
  files?: { name: string; size: string; type: 'pdf' | 'xls' }[];
  onUpload: () => void;
}

const CategorySection = ({ title, files = [], onUpload }: CategorySectionProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <button 
          onClick={onUpload}
          className="p-1.5 text-gray-500 hover:text-gray-700"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
      
      {files.length > 0 ? (
        <div className="space-y-1">
          {files.map((file, index) => (
            <FileListItem
              key={index}
              {...file}
              onDownload={() => console.log('Download:', file.name)}
              onView={() => console.log('View:', file.name)}
              onDelete={() => console.log('Delete:', file.name)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">None uploaded.</p>
      )}
    </div>
  );
};

export default CategorySection;
