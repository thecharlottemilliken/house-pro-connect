import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import ProjectActivity from "./pages/ProjectActivity";
import ProjectBidsProposals from "./pages/ProjectBidsProposals";
import ProjectSOW from "./pages/ProjectSOW";

function App() {
  const { currentUser } = useAuth();
  const [activeSpecialty, setActiveSpecialty] = useState("");

  const RequireAuth = ({ children }: { children: JSX.Element }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  const PublicRoute = ({ children }: { children: JSX.Element }) => {
    return currentUser ? <Navigate to="/" /> : children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
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
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/"
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
              <ProjectAccounting
                activeSpecialty={activeSpecialty}
                setActiveSpecialty={setActiveSpecialty}
              />
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
          path="/project-activity/:projectId"
          element={
            <RequireAuth>
              <ProjectActivity />
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
    </BrowserRouter>
  );
}

export default App;
