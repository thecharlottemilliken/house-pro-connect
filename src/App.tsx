
import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import ForgotPassword from "@/pages/ForgotPassword";
import UpdateProfile from "@/pages/UpdateProfile";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import NewProject from "@/pages/NewProject";
import ProjectDashboard from "@/pages/ProjectDashboard";
import ProjectDesign from "@/pages/ProjectDesign";
import ProjectDocuments from "@/pages/ProjectDocuments";
import ProjectMessages from "@/pages/ProjectMessages";
import ProjectTeam from "@/pages/ProjectTeam";
import ProjectMaterials from "@/pages/ProjectMaterials";
import ProjectAccounting from "@/pages/ProjectAccounting";
import ProjectManage from "@/pages/ProjectManage";
import ProjectActivityHistory from "@/pages/ProjectActivityHistory";
import ProjectBidsProposals from "@/pages/ProjectBidsProposals";
import ProjectSOW from "@/pages/ProjectSOW";
import PublicRoute from "@/components/routes/PublicRoute";
import PrivateRoute from "@/components/routes/PrivateRoute";

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // You can add any global initialization logic here
    // For example, fetching user settings or initializing analytics
  }, []);

  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-white flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Private Routes */}
        <Route
          path="/update-profile"
          element={
            <PrivateRoute>
              <UpdateProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          }
        />
        <Route
          path="/new-project"
          element={
            <PrivateRoute>
              <NewProject />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<PrivateRoute><Navigate to="/dashboard" replace /></PrivateRoute>} />
        <Route path="/project-dashboard/:projectId" element={<ProjectDashboard />} />
        <Route path="/project-design/:projectId" element={<ProjectDesign />} />
        <Route path="/project-documents/:projectId" element={<ProjectDocuments />} />
        <Route path="/project-messages/:projectId" element={<ProjectMessages />} />
        <Route path="/project-team/:projectId" element={<ProjectTeam />} />
        <Route path="/project-materials/:projectId" element={<ProjectMaterials />} />
        <Route path="/project-accounting/:projectId" element={<ProjectAccounting />} />
        <Route path="/project-manage/:projectId" element={<ProjectManage />} />
        <Route path="/project-activity/:projectId" element={<ProjectActivityHistory />} />
        <Route path="/project-bids-proposals/:projectId" element={<ProjectBidsProposals />} />
        <Route path="/project-sow/:projectId" element={<ProjectSOW />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
