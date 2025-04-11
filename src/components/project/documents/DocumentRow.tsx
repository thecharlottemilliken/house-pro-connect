
import React from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Document {
  id: string;
  title: string;
  type: string;
  uploadedBy: string;
  uploadedDate: string;
  tags: string[];
}

interface DocumentRowProps {
  document: Document;
}

const DocumentRow: React.FC<DocumentRowProps> = ({ document }) => {
  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{document.title}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 text-sm text-gray-500">
            <span>{document.type}</span> 
            <span className="hidden sm:inline">•</span>
            <span>Uploaded by {document.uploadedBy}</span>
            <span className="hidden sm:inline">•</span>
            <span>Uploaded {document.uploadedDate}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {document.tags.map((tag) => (
              <div key={tag} className="flex items-center">
                <span className="text-[#F59E0B]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39.92 3.31 0l4.23-4.23a2.25 2.25 0 0 0 0-3.31l-9.58-9.581a3 3 0 0 0-2.12-.879H5.25Z" />
                    <path fillRule="evenodd" d="M9.75 8.25a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                  </svg>
                </span>
                <span className="ml-1 text-[#F59E0B] font-medium">{tag}</span>
              </div>
            ))}
            <div className="flex items-center ml-1">
              <span className="text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39.92 3.31 0l4.23-4.23a2.25 2.25 0 0 0 0-3.31l-9.58-9.581a3 3 0 0 0-2.12-.879H5.25Z" />
                  <path fillRule="evenodd" d="M9.75 8.25a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                </svg>
              </span>
              <span className="ml-1 text-gray-500">Tag</span>
            </div>
          </div>
        </div>
        <div className="mt-2 md:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-gray-100 hover:bg-gray-200">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Download</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DocumentRow;
