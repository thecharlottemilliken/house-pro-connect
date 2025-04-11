
import React from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentRow from "./DocumentRow";

interface DocumentListProps {
  searchQuery: string;
  selectedTag: string | null;
}

const mockDocuments = [
  {
    id: "1",
    title: "interior-design-insurance-overview",
    type: "PDF",
    uploadedBy: "Sophia Jackson",
    uploadedDate: "09/15/23",
    tags: ["Insurance"]
  },
  {
    id: "2",
    title: "tile-insurance-considerations",
    type: "PDF",
    uploadedBy: "John Smith",
    uploadedDate: "11/02/23",
    tags: ["Insurance"]
  },
  {
    id: "3",
    title: "plumbing-insurance-effective-strategies",
    type: "PDF",
    uploadedBy: "Gary Fisher",
    uploadedDate: "01/10/24",
    tags: ["Insurance"]
  },
  {
    id: "4",
    title: "electricity-insurance-best-practices",
    type: "PDF",
    uploadedBy: "Doug Martin",
    uploadedDate: "02/20/24",
    tags: ["Insurance"]
  },
];

const DocumentList: React.FC<DocumentListProps> = ({ searchQuery, selectedTag }) => {
  // Filter documents based on search query and selected tag
  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = !searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || doc.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-4">
      {filteredDocuments.map((doc) => (
        <DocumentRow key={doc.id} document={doc} />
      ))}
    </div>
  );
};

export default DocumentList;
