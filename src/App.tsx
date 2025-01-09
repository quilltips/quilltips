import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { Search } from "./components/Search";
import AuthorLogin from "./pages/AuthorLogin";
import AuthorRegister from "./pages/AuthorRegister";
import AuthorDashboard from "./pages/AuthorDashboard";
import AuthorPublicProfile from "./pages/AuthorPublicProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/author/:id" element={<AuthorPublicProfile />} />
          <Route path="/author/login" element={<AuthorLogin />} />
          <Route path="/author/register" element={<AuthorRegister />} />
          <Route path="/author/dashboard" element={<AuthorDashboard />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;