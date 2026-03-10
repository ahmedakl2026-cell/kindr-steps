import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import KidsCorner from "./pages/KidsCorner";
import Library from "./pages/Library";
import Specialists from "./pages/Specialists";
import ParentDashboard from "./pages/ParentDashboard";
import Community from "./pages/Community";
import Login from "./pages/Login";
import SetupRole from "./pages/SetupRole";
import NotFound from "./pages/NotFound";
import Team from "./pages/Team";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kids" element={<KidsCorner />} />
            <Route path="/library" element={<Library />} />
            <Route path="/specialists" element={<Specialists />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/community" element={<Community />} />
            <Route path="/login" element={<Login />} />
            <Route path="/setup-role" element={<SetupRole />} />
            <Route path="/team" element={<Team />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
