
import ProjectCard from "./ProjectCard";
import { Project } from "@/types/project";

interface ProjectGridProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
}

const ProjectGrid = ({ projects, onProjectClick }: ProjectGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onProjectClick={onProjectClick}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
