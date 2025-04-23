
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onProjectClick: (projectId: string) => void;
}

const ProjectCard = ({ project, onProjectClick }: ProjectCardProps) => {
  const formatAddress = (project: Project) => {
    const property = project.property;
    return `${property.address_line1}, ${property.city}, ${property.state} ${property.zip_code}`;
  };

  return (
    <div 
      key={project.id} 
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={project.property.image_url} 
          alt={project.property.property_name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between mb-1">
          <h2 className="text-lg font-semibold">{project.title}</h2>
          {!project.is_owner && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {project.team_role || 'Team Member'}
            </span>
          )}
        </div>
        <h3 className="text-base text-gray-700 mb-2">{project.property.property_name}</h3>
        <p className="text-sm text-gray-600 mb-4">{formatAddress(project)}</p>
        <p className="text-xs text-gray-500 mb-3">
          Created on {new Date(project.created_at).toLocaleDateString()}
        </p>
        <Button 
          className="w-full bg-[#174c65] hover:bg-[#174c65]/90 justify-between"
          onClick={() => onProjectClick(project.id)}
        >
          VIEW PROJECT <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;
