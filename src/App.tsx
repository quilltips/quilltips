
import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/integrations/supabase/client";
import Index from "@/pages/Index";
import About from "@/pages/About";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import TermsOfService from "@/pages/TermsOfService";
import SearchPage from "@/pages/SearchPage";
import AuthorRegister from "@/pages/AuthorRegister";
import AuthorLogin from "@/pages/AuthorLogin";
import AuthorDashboard from "@/pages/AuthorDashboard";
import AuthorSettings from "@/pages/AuthorSettings";
import CreateQRPage from "@/pages/CreateQRPage";
import QRCodeDesign from "@/pages/QRCodeDesign";
import AuthorBankAccount from "@/pages/AuthorBankAccount";
import AuthorPublicProfile from "@/pages/AuthorPublicProfile";
import QRCodeSummary from "@/pages/QRCodeSummary";
import QRCodeDetails from "@/pages/QRCodeDetails";

const queryClient = new QueryClient();

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is an author and redirect accordingly
    const checkAuthorAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && location.pathname === '/') {
        // Check if user is an author
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (profile?.role === 'author') {
          navigate('/author/dashboard');
        }
      }
    };

    checkAuthorAccess();
  }, [navigate, location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/author/register" element={<AuthorRegister />} />
        <Route path="/author/login" element={<AuthorLogin />} />
        <Route path="/author/dashboard" element={<AuthorDashboard />} />
        <Route path="/author/settings" element={<AuthorSettings />} />
        <Route path="/author/create-qr" element={<CreateQRPage />} />
        <Route path="/author/qr-design" element={<QRCodeDesign />} />
        <Route path="/author/bank-account" element={<AuthorBankAccount />} />
        <Route path="/author/profile/:id" element={<AuthorPublicProfile />} />
        <Route path="/qr-summary" element={<QRCodeSummary />} />
        <Route path="/qr/:id" element={<QRCodeDetails />} />
      </Routes>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
