
import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDashboard from "./pages/ProjectDashboard";
import ProjectDesign from "./pages/ProjectDesign";
import ProjectDocuments from "./pages/ProjectDocuments";
import ProjectMessages from "./pages/ProjectMessages";
import ProjectTeam from "./pages/ProjectTeam";
import ProjectMaterials from "./pages/ProjectMaterials";
import ProjectAccounting from "./pages/ProjectAccounting";
import ProjectManage from "./pages/ProjectManage";
import ProjectBidsProposals from "./pages/ProjectBidsProposals";
import ProjectSOW from "./pages/ProjectSOW";

function App() {
  const { user } = useAuth();
  const [activeSpecialty, setActiveSpecialty] = useState("");

  const RequireAuth = ({ children }: { children: JSX.Element }) => {
    return user ? children : <Navigate to="/signin" />;
  };

  const PublicRoute = ({ children }: { children: JSX.Element }) => {
    return user ? <Navigate to="/dashboard" /> : children;
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/projects"
        element={
          <RequireAuth>
            <Projects />
          </RequireAuth>
        }
      />
      <Route
        path="/project-dashboard/:projectId"
        element={
          <RequireAuth>
            <ProjectDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/project-design/:projectId"
        element={
          <RequireAuth>
            <ProjectDesign />
          </RequireAuth>
        }
      />
      <Route
        path="/project-documents/:projectId"
        element={
          <RequireAuth>
            <ProjectDocuments />
          </RequireAuth>
        }
      />
      <Route
        path="/project-messages/:projectId"
        element={
          <RequireAuth>
            <ProjectMessages />
          </RequireAuth>
        }
      />
      <Route
        path="/project-team/:projectId"
        element={
          <RequireAuth>
            <ProjectTeam />
          </RequireAuth>
        }
      />
      <Route
        path="/project-materials/:projectId"
        element={
          <RequireAuth>
            <ProjectMaterials />
          </RequireAuth>
        }
      />
      <Route
        path="/project-accounting/:projectId"
        element={
          <RequireAuth>
            <ProjectAccounting />
          </RequireAuth>
        }
      />
      <Route
        path="/project-manage/:projectId"
        element={
          <RequireAuth>
            <ProjectManage />
          </RequireAuth>
        }
      />
      <Route
        path="/project-bids-proposals/:projectId"
        element={
          <RequireAuth>
            <ProjectBidsProposals />
          </RequireAuth>
        }
      />
      <Route
        path="/project-sow/:projectId"
        element={
          <RequireAuth>
            <ProjectSOW />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
