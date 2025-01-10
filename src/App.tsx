import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import AuthorLogin from "@/pages/AuthorLogin";
import AuthorRegister from "@/pages/AuthorRegister";
import AuthorDashboard from "@/pages/AuthorDashboard";
import AuthorPublicProfile from "@/pages/AuthorPublicProfile";
import CreateQRPage from "@/pages/CreateQRPage";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/author/login" element={<AuthorLogin />} />
            <Route path="/author/register" element={<AuthorRegister />} />
            <Route path="/author/dashboard" element={<AuthorDashboard />} />
            <Route path="/author/:id" element={<AuthorPublicProfile />} />
            <Route path="/author/create-qr" element={<CreateQRPage />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;