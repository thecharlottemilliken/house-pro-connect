
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, TableHeader, TableBody, 
  TableHead, TableRow, TableCell 
} from "@/components/ui/table";
import { Search, MessageSquare, Info, Calendar } from "lucide-react";
import MessageDialog from "./MessageDialog";

interface Project {
  id: string;
  title: string;
  created_at: string;
  property: {
    property_name: string;
    address_line1: string;
    city: string;
    state: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProjectWithUserId extends Omit<Project, 'owner'> {
  user_id: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          created_at,
          property:property_id(
            property_name,
            address_line1,
            city,
            state
          ),
          user_id
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch owner information for each project
      if (data && data.length > 0) {
        const projectsWithOwners = await Promise.all(
          data.map(async (project) => {
            const { data: ownerData, error: ownerError } = await supabase
              .from('profiles')
              .select('id, name, email')
              .eq('id', project.user_id)
              .single();
            
            if (ownerError) {
              console.error("Error fetching project owner:", ownerError);
              return {
                ...project,
                owner: {
                  id: project.user_id,
                  name: 'Unknown',
                  email: 'unknown@example.com'
                }
              };
            }
            
            return {
              ...project,
              owner: ownerData
            };
          })
        );
        
        // Convert to the Project type
        const typedProjects: Project[] = projectsWithOwners
          .filter(project => 
            project !== null && 
            typeof project === 'object' && 
            project.property !== null &&
            typeof project.property === 'object' &&
            project.owner !== null &&
            typeof project.owner === 'object'
          )
          .map(project => ({
            id: project.id,
            title: project.title,
            created_at: project.created_at,
            property: project.property,
            owner: project.owner
          }));
        
        setProjects(typedProjects);
      } else {
        setProjects([]);
      }
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search projects..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
            </div>
          </CardContent>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              {searchQuery ? "No projects match your search" : "No projects found"}
            </p>
          </CardContent>
        </Card>
      ) : (
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
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>
                    <div className="max-w-[250px]">
                      <div>{project.property.property_name}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {project.property.address_line1}, {project.property.city}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{project.owner.name}</div>
                      <div className="text-sm text-gray-500">{project.owner.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(project.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMessageClick(project)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
