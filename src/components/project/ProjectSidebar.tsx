
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Pencil, Users, MessageSquare, FileText, File, Scissors, CreditCard, History } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectSidebarProps {
  projectId: string;
  projectTitle?: string;
}

const ProjectSidebar = ({ projectId, projectTitle = "Kitchen Project" }: ProjectSidebarProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="w-64 bg-[#dce6ea] h-full">
      <div className="border-b border-gray-300">
        <button 
          className="flex items-center text-[#0f3a4d] font-medium p-4 text-base w-full"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft className="mr-3 h-5 w-5" /> All Projects
        </button>
      </div>
      
      <div className="border-b border-gray-300 p-4">
        <div className="flex items-center text-[#0f3a4d] font-medium">
          <span className="w-6 h-6">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 stroke-[#0f3a4d]">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="ml-3">{projectTitle}</span>
        </div>
      </div>
      
      <nav className="pt-1">
        <ul>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#cad9df] transition-colors">
              <Home className="h-5 w-5 mr-3" />
              Manage
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#cad9df] transition-colors">
              <Pencil className="h-5 w-5 mr-3" />
              Design
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#cad9df] transition-colors">
              <Users className="h-5 w-5 mr-3" />
              Team
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#cad9df] transition-colors">
              <MessageSquare className="h-5 w-5 mr-3" />
              Messages
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#cad9df] transition-colors">
              <FileText className="h-5 w-5 mr-3" />
              Bids & Proposals
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#cad9df] transition-colors">
              <File className="h-5 w-5 mr-3" />
              Documents
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#cad9df] transition-colors">
              <Scissors className="h-5 w-5 mr-3" />
              Materials
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#cad9df] transition-colors">
              <CreditCard className="h-5 w-5 mr-3" />
              Accounting
            </button>
          </li>
          <li>
            <button className="flex items-center text-[#0f3a4d] w-full p-4 hover:bg-[#cad9df] transition-colors">
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
