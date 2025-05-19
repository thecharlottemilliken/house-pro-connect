
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
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
import ProjectSummary from "./pages/ProjectSummary";
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
import Profile from "./pages/Profile";
import CoachDashboard from "./pages/CoachDashboard";
import ServiceProDashboard from "./pages/ServiceProDashboard";
import ServiceProProfile from "./pages/ServiceProProfile";
import ServiceProJobs from "./pages/ServiceProJobs";
import ServiceProMessages from "./pages/ServiceProMessages";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CoachRoute from "./components/auth/CoachRoute";
import ServiceProRoute from "./components/auth/ServiceProRoute";
import ProjectSOW from "./pages/ProjectSOW";
import SOWReviewPage from "@/components/project/sow/SOWReviewPage";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Notifications from "./pages/Notifications";
import ProjectCalendar from "./pages/ProjectCalendar";

function App() {
  return (
    <>
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
        <Route path="/coach-dashboard" element={
          <CoachRoute>
            <TooltipProvider>
              <CoachDashboard />
            </TooltipProvider>
          </CoachRoute>
        } />
        <Route path="/service-pro-dashboard" element={
          <ServiceProRoute>
            <TooltipProvider>
              <ServiceProDashboard />
            </TooltipProvider>
          </ServiceProRoute>
        } />
        <Route path="/service-pro-profile" element={
          <ServiceProRoute>
            <TooltipProvider>
              <ServiceProProfile />
            </TooltipProvider>
          </ServiceProRoute>
        } />
        <Route path="/service-pro-jobs" element={
          <ServiceProRoute>
            <TooltipProvider>
              <ServiceProJobs />
            </TooltipProvider>
          </ServiceProRoute>
        } />
        <Route path="/service-pro-messages" element={
          <ServiceProRoute>
            <TooltipProvider>
              <ServiceProMessages />
            </TooltipProvider>
          </ServiceProRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <TooltipProvider>
              <Profile />
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
        <Route path="/project-summary" element={
          <ProtectedRoute>
            <TooltipProvider>
              <ProjectSummary />
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
        <Route path="/project-calendar/:projectId" element={
          <ProtectedRoute>
            <TooltipProvider>
              <ProjectCalendar />
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
        <Route path="/project-sow/:projectId" element={
          <ProtectedRoute>
            <TooltipProvider>
              <ProjectSOW />
            </TooltipProvider>
          </ProtectedRoute>
        } />
        <Route path="/project-sow/:projectId/review" element={
          <ProtectedRoute>
            <TooltipProvider>
              <SOWReviewPage />
            </TooltipProvider>
          </ProtectedRoute>
        } />
        <Route path="/jobs" element={
          <ProtectedRoute>
            <TooltipProvider>
              <Jobs />
            </TooltipProvider>
          </ProtectedRoute>
        } />
        <Route path="/job-details/:jobId" element={
          <ProtectedRoute>
            <TooltipProvider>
              <JobDetails />
            </TooltipProvider>
          </ProtectedRoute>
        } />
        <Route path="/properties" element={<Properties />} />
        <Route path="/your-properties" element={<Properties />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <Sonner />
    </>
  );
}

export default App;
