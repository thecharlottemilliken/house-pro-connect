
import { useState } from "react";
import { useCoachProjects, Project } from "@/hooks/useCoachProjects";
import ProjectSearch from "./ProjectSearch";
import ProjectTable from "./ProjectTable";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import MessageDialog from "./MessageDialog";

const ProjectList = () => {
  const { projects, isLoading } = useCoachProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  const handleMessageClick = (project: Project) => {
    setSelectedProject(project);
    setIsMessageDialogOpen(true);
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.property.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.owner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">All Projects</h2>
        <ProjectSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filteredProjects.length === 0 ? (
        <EmptyState searchQuery={searchQuery} />
      ) : (
        <ProjectTable 
          projects={filteredProjects}
          onMessageClick={handleMessageClick}
        />
      )}

      {selectedProject && (
        <MessageDialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
          project={selectedProject}
        />
      )}
    </div>
  );
};

export default ProjectList;
