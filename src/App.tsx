
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ResidentDashboard from "./pages/ResidentDashboard";
import CreateProject from "./pages/CreateProject";
import RenovationAreas from "./pages/RenovationAreas";
import ProjectPreferences from "./pages/ProjectPreferences";
import ConstructionPreferences from "./pages/ConstructionPreferences";
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
