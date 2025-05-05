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
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CoachRoute from "./components/auth/CoachRoute";
import ProjectSOW from "./pages/ProjectSOW";
import SOWReviewPage from "@/components/project/sow/SOWReviewPage";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Notifications from "./pages/Notifications";
import ProjectCalendar from "./pages/ProjectCalendar";
import ProjectSummary from "./pages/ProjectSummary";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <ResidentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Projects */}
      <Route path="/projects" element={
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      } />
      <Route path="/project-dashboard/:projectId" element={
        <ProtectedRoute>
          <ProjectDashboard />
        </ProtectedRoute>
      } />
      <Route path="/project-design/:projectId" element={
        <ProtectedRoute>
          <ProjectDesign />
        </ProtectedRoute>
      } />
      <Route path="/project-calendar/:projectId" element={
        <ProtectedRoute>
          <ProjectCalendar />
        </ProtectedRoute>
      } />
      <Route path="/project-messages/:projectId" element={
        <ProtectedRoute>
          <ProjectMessages />
        </ProtectedRoute>
      } />
      <Route path="/project-team/:projectId" element={
        <ProtectedRoute>
          <ProjectTeam />
        </ProtectedRoute>
      } />
      <Route path="/project-activity/:projectId" element={
        <ProtectedRoute>
          <ProjectActivityHistory />
        </ProtectedRoute>
      } />
      <Route path="/project-accounting/:projectId" element={
        <ProtectedRoute>
          <ProjectAccounting />
        </ProtectedRoute>
      } />
      <Route path="/project-documents/:projectId" element={
        <ProtectedRoute>
          <ProjectDocuments />
        </ProtectedRoute>
      } />
      <Route path="/project-materials/:projectId" element={
        <ProtectedRoute>
          <ProjectMaterials />
        </ProtectedRoute>
      } />
      <Route path="/project-bids/:projectId" element={
        <ProtectedRoute>
          <ProjectBidsProposals />
        </ProtectedRoute>
      } />
      <Route path="/project-manage/:projectId" element={
        <ProtectedRoute>
          <ProjectManage />
        </ProtectedRoute>
      } />
      <Route path="/project-sow/:projectId" element={
        <ProtectedRoute>
          <ProjectSOW />
        </ProtectedRoute>
      } />
      
      {/* Properties */}
      <Route path="/properties" element={
        <ProtectedRoute>
          <Properties />
        </ProtectedRoute>
      } />
      <Route path="/property/:propertyId" element={
        <ProtectedRoute>
          <PropertyDetails />
        </ProtectedRoute>
      } />
      <Route path="/add-property" element={
        <ProtectedRoute>
          <AddProperty />
        </ProtectedRoute>
      } />
      
      {/* Create Project Flow */}
      <Route path="/create-project" element={
        <ProtectedRoute>
          <CreateProject />
        </ProtectedRoute>
      } />
      <Route path="/renovation-areas" element={
        <ProtectedRoute>
          <RenovationAreas />
        </ProtectedRoute>
      } />
      <Route path="/project-preferences" element={
        <ProtectedRoute>
          <ProjectPreferences />
        </ProtectedRoute>
      } />
      <Route path="/construction-preferences" element={
        <ProtectedRoute>
          <ConstructionPreferences />
        </ProtectedRoute>
      } />
      <Route path="/design-preferences" element={
        <ProtectedRoute>
          <DesignPreferences />
        </ProtectedRoute>
      } />
      <Route path="/management-preferences" element={
        <ProtectedRoute>
          <ManagementPreferences />
        </ProtectedRoute>
      } />
      <Route path="/prior-experience" element={
        <ProtectedRoute>
          <PriorExperience />
        </ProtectedRoute>
      } />
      <Route path="/project-summary" element={
        <ProtectedRoute>
          <ProjectSummary />
        </ProtectedRoute>
      } />
      
      {/* Coach Routes */}
      <Route path="/coach-dashboard" element={
        <CoachRoute>
          <CoachDashboard />
        </CoachRoute>
      } />
      
      {/* Jobs */}
      <Route path="/jobs" element={
        <ProtectedRoute>
          <Jobs />
        </ProtectedRoute>
      } />
      <Route path="/job/:jobId" element={
        <ProtectedRoute>
          <JobDetails />
        </ProtectedRoute>
      } />
      
      {/* Auth */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
