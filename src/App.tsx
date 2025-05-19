import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  LandingPage,
  SignIn,
  SignUp,
  NotFound,
  ResidentDashboard,
  Profile,
  Notifications,
  Properties,
  AddProperty,
  PropertyDetails,
  Projects,
  CreateProject,
  ProjectPreferences,
  DesignPreferences,
  ManagementPreferences,
  ConstructionPreferences,
  RenovationAreas,
  PriorExperience,
  ProjectDashboard,
  ProjectDesign,
  ProjectManage,
  ProjectTeam,
  ProjectMessages,
  ProjectActivityHistory,
  ProjectCalendar,
  ProjectAccounting,
  ProjectSOW,
  ProjectBidsProposals,
  ProjectMaterials,
  ProjectDocuments,
  ProjectSummary,
  Jobs,
  JobDetails,
  CoachDashboard,
  ServiceProDashboard,
  ServiceProJobs,
  ServiceProMessages,
} from "@/pages";
import { ProtectedRoute, CoachRoute, ServiceProRoute } from "@/components/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "react-query";
import ServiceProProfile from "@/pages/ServiceProProfile";
import ServiceProProfileEdit from "@/pages/ServiceProProfileEdit";

const queryClient = new QueryClient();
  
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
