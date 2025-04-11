
import React from "react";
import { 
  Table, TableHeader, TableBody, 
  TableHead, TableRow
} from "@/components/ui/table";
import ProjectItem from "./ProjectItem";
import { Project } from "@/hooks/useCoachProjects";

interface ProjectTableProps {
  projects: Project[];
  onMessageClick: (project: Project) => void;
}

const ProjectTable = ({ projects, onMessageClick }: ProjectTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Resident</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <ProjectItem 
              key={project.id} 
              project={project} 
              onMessageClick={onMessageClick} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectTable;
