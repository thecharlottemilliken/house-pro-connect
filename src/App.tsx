
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResidentDashboard from "./pages/ResidentDashboard";
import CreateProject from "./pages/CreateProject";
import RenovationAreas from "./pages/RenovationAreas";
import ProjectPreferences from "./pages/ProjectPreferences";
import ConstructionPreferences from "./pages/ConstructionPreferences";
import DesignPreferences from "./pages/DesignPreferences";
import ManagementPreferences from "./pages/ManagementPreferences";
import PriorExperience from "./pages/PriorExperience";
import ProjectDashboard from "./pages/ProjectDashboard";
import ProjectManage from "./pages/ProjectManage";
import ProjectDesign from "./pages/ProjectDesign";
import ProjectTeam from "./pages/ProjectTeam";
import ProjectMessages from "./pages/ProjectMessages";
import ProjectBidsProposals from "./pages/ProjectBidsProposals";
import ProjectDocuments from "./pages/ProjectDocuments";
import ProjectMaterials from "./pages/ProjectMaterials";
import ProjectAccounting from "./pages/ProjectAccounting";
import ProjectActivityHistory from "./pages/ProjectActivityHistory";
import Projects from "./pages/Projects";
import AddProperty from "./pages/AddProperty";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ResidentDashboard />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/create-project" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <CreateProject />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/renovation-areas" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <RenovationAreas />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/project-preferences" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ProjectPreferences />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/construction-preferences" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ConstructionPreferences />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/design-preferences" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <DesignPreferences />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/management-preferences" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ManagementPreferences />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/prior-experience" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <PriorExperience />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/project-dashboard" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ProjectDashboard />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/project-dashboard/:projectId" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ProjectDashboard />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/project-manage/:projectId" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ProjectManage />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/project-design/:projectId" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ProjectDesign />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/project-team/:projectId" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ProjectTeam />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/project-messages/:projectId" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ProjectMessages />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/project-bids-proposals/:projectId" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ProjectBidsProposals />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/project-documents/:projectId" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ProjectDocuments />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/project-materials/:projectId" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ProjectMaterials />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/project-accounting/:projectId" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ProjectAccounting />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/project-activity-history/:projectId" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <ProjectActivityHistory />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <Projects />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            <Route path="/add-property" element={
              <ProtectedRoute>
                <TooltipProvider>
                  <AddProperty />
                </TooltipProvider>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
