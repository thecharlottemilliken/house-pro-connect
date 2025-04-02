
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Home, Pencil, Users, MessageSquare, FileText, File, Scissors, CreditCard, History } from "lucide-react";

interface ProjectSidebarProps {
  projectId: string;
  projectTitle?: string;
}

const ProjectSidebar = ({ projectId, projectTitle = "Kitchen Project" }: ProjectSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Get the first part of the path for simple matching
  const isOverviewActive = currentPath.includes(`/project-dashboard/${projectId}`) && 
    !currentPath.includes('/design') && 
    !currentPath.includes('/team') && 
    !currentPath.includes('/messages');
  
  return (
    <div className="w-64 bg-[#dce6ea] h-screen sticky top-0 flex flex-col">
      <div className="border-b border-[#c7d3d9]">
        <button 
          className="flex items-center text-[#0f3a4d] font-medium p-4 text-base w-full hover:bg-[#c7d3d9] transition-colors"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="mr-3 h-5 w-5" /> All Projects
        </button>
      </div>
      
      <div className="border-b border-[#c7d3d9] p-4">
        <div className="flex items-center text-[#0f3a4d] font-medium">
          <span className="w-6 h-6">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 stroke-[#0f3a4d]">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="ml-3">{projectTitle}</span>
        </div>
      </div>
      
      <nav className="flex-grow">
        <ul className="w-full">
          <li>
            <button 
              className={`flex items-center text-[#0f3a4d] w-full p-4 transition-colors ${
                isOverviewActive ? "bg-[#c7d3d9]" : "hover:bg-[#c7d3d9]"
              }`}
              onClick={() => navigate(`/project-dashboard/${projectId}`)}
            >
              <Home className="h-5 w-5 mr-3" />
              Overview
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#c7d3d9] transition-colors">
              <span className="mr-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-[#0f3a4d]">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Manage
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#c7d3d9] transition-colors">
              <Pencil className="h-5 w-5 mr-3" />
              Design
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#c7d3d9] transition-colors">
              <Users className="h-5 w-5 mr-3" />
              Team
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#c7d3d9] transition-colors">
              <MessageSquare className="h-5 w-5 mr-3" />
              Messages
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#c7d3d9] transition-colors">
              <FileText className="h-5 w-5 mr-3" />
              Bids & Proposals
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#c7d3d9] transition-colors">
              <File className="h-5 w-5 mr-3" />
              Documents
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#c7d3d9] transition-colors">
              <Scissors className="h-5 w-5 mr-3" />
              Materials
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#c7d3d9] transition-colors">
              <CreditCard className="h-5 w-5 mr-3" />
              Accounting
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#c7d3d9] transition-colors">
              <History className="h-5 w-5 mr-3" />
              Activity History
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ProjectSidebar;
