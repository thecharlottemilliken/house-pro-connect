
import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { Card } from '@/components/ui/card';
import CalendarView from '@/components/project/manage/Calendar/CalendarView';
import { useProjectData } from '@/hooks/useProjectData';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const ProjectCalendar = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projectData, isLoading } = useProjectData(projectId);
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <DashboardNavbar />
        <main className="flex-1 p-4">
          <div className="py-8 text-center">Loading project calendar...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardNavbar />
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex flex-1">
          <ProjectSidebar projectId={projectId || ''} activePage="calendar" />
          <main className="flex-1 p-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Project Calendar</h1>
              <p className="text-gray-500">
                Schedule and manage project events and meetings
              </p>
            </div>
            
            <Card className="p-6">
              <CalendarView project_id={projectId || ''} />
            </Card>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default ProjectCalendar;
