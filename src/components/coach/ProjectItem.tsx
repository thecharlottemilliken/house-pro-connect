
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Project } from "@/hooks/useCoachProjects";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ProjectItemProps {
  project: Project;
  onMessageClick: (project: Project) => void;
}

const ProjectItem = ({ project, onMessageClick }: ProjectItemProps) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/project-dashboard/${project.id}`);
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when clicking message button
    onMessageClick(project);
  };

  return (
    <TableRow 
      key={project.id} 
      className="cursor-pointer hover:bg-gray-50"
      onClick={handleRowClick}
    >
      <TableCell className="font-medium">{project.title}</TableCell>
      <TableCell>
        <div className="max-w-[250px]">
          <div className="font-medium">{project.property.property_name}</div>
          <div className="text-sm text-gray-500 truncate">
            {project.property.address_line1}, {project.property.city}, {project.property.state}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{project.owner.name}</div>
          <div className="text-sm text-gray-500">{project.owner.email}</div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={project.state === 'active' ? 'secondary' : 'default'}>
          {project.state}
        </Badge>
      </TableCell>
      <TableCell>
        {new Date(project.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMessageClick}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProjectItem;
