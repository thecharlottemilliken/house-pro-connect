
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import pages directly from their files
import LandingPage from "@/pages/LandingPage";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/NotFound";
import ResidentDashboard from "@/pages/ResidentDashboard";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import Properties from "@/pages/Properties";
import AddProperty from "@/pages/AddProperty";
import PropertyDetails from "@/pages/PropertyDetails";
import Projects from "@/pages/Projects";
import CreateProject from "@/pages/CreateProject";
import ProjectPreferences from "@/pages/ProjectPreferences";
import DesignPreferences from "@/pages/DesignPreferences";
import ManagementPreferences from "@/pages/ManagementPreferences";
import ConstructionPreferences from "@/pages/ConstructionPreferences";
import RenovationAreas from "@/pages/RenovationAreas";
import PriorExperience from "@/pages/PriorExperience";
import ProjectDashboard from "@/pages/ProjectDashboard";
import ProjectDesign from "@/pages/ProjectDesign";
import ProjectManage from "@/pages/ProjectManage";
import ProjectTeam from "@/pages/ProjectTeam";
import ProjectMessages from "@/pages/ProjectMessages";
import ProjectActivityHistory from "@/pages/ProjectActivityHistory";
import ProjectCalendar from "@/pages/ProjectCalendar";
import ProjectAccounting from "@/pages/ProjectAccounting";
import ProjectSOW from "@/pages/ProjectSOW";
import ProjectBidsProposals from "@/pages/ProjectBidsProposals";
import ProjectMaterials from "@/pages/ProjectMaterials";
import ProjectDocuments from "@/pages/ProjectDocuments";
import ProjectSummary from "@/pages/ProjectSummary";
import Jobs from "@/pages/Jobs";
import JobDetails from "@/pages/JobDetails";
import CoachDashboard from "@/pages/CoachDashboard";
import ServiceProDashboard from "@/pages/ServiceProDashboard";
import ServiceProJobs from "@/pages/ServiceProJobs";
import ServiceProMessages from "@/pages/ServiceProMessages";
import ServiceProProfile from "@/pages/ServiceProProfile";
import ServiceProProfileEdit from "@/pages/ServiceProProfileEdit";

// Import auth components directly
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CoachRoute from "@/components/auth/CoachRoute";
import ServiceProRoute from "@/components/auth/ServiceProRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<ResidentDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/add-property" element={<AddProperty />} />
                <Route path="/property/:propertyId" element={<PropertyDetails />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/create-project" element={<CreateProject />} />
                <Route path="/project-preferences" element={<ProjectPreferences />} />
                <Route path="/design-preferences" element={<DesignPreferences />} />
                <Route path="/management-preferences" element={<ManagementPreferences />} />
                <Route path="/construction-preferences" element={<ConstructionPreferences />} />
                <Route path="/renovation-areas" element={<RenovationAreas />} />
                <Route path="/prior-experience" element={<PriorExperience />} />
                <Route path="/project-dashboard/:projectId" element={<ProjectDashboard />} />
                <Route path="/project-design/:projectId" element={<ProjectDesign />} />
                <Route path="/project-manage/:projectId" element={<ProjectManage />} />
                <Route path="/project-team/:projectId" element={<ProjectTeam />} />
                <Route path="/project-messages/:projectId" element={<ProjectMessages />} />
                <Route path="/project-activity/:projectId" element={<ProjectActivityHistory />} />
                <Route path="/project-calendar/:projectId" element={<ProjectCalendar />} />
                <Route path="/project-accounting/:projectId" element={<ProjectAccounting />} />
                <Route path="/project-sow/:projectId" element={<ProjectSOW />} />
                <Route path="/project-bids/:projectId" element={<ProjectBidsProposals />} />
                <Route path="/project-materials/:projectId" element={<ProjectMaterials />} />
                <Route path="/project-documents/:projectId" element={<ProjectDocuments />} />
                <Route path="/project-summary/:projectId" element={<ProjectSummary />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/job/:jobId" element={<JobDetails />} />
              </Route>
              
              {/* Coach only routes */}
              <Route element={<CoachRoute />}>
                <Route path="/coach-dashboard" element={<CoachDashboard />} />
              </Route>
              
              {/* Service Pro only routes */}
              <Route element={<ServiceProRoute />}>
                <Route path="/service-pro-dashboard" element={<ServiceProDashboard />} />
                <Route path="/service-pro-profile" element={<ServiceProProfile />} />
                <Route path="/service-pro-profile/edit" element={<ServiceProProfileEdit />} />
                <Route path="/service-pro-jobs" element={<ServiceProJobs />} />
                <Route path="/service-pro-messages" element={<ServiceProMessages />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ThemeProvider>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
