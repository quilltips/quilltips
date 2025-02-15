import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import { Index } from "@/pages";
import { About } from "@/pages/About";
import { FAQ } from "@/pages/FAQ";
import { Contact } from "@/pages/Contact";
import { TermsOfService } from "@/pages/TermsOfService";
import { SearchPage } from "@/pages/SearchPage";
import { AuthorRegister } from "@/pages/AuthorRegister";
import { AuthorLogin } from "@/pages/AuthorLogin";
import { AuthorDashboard } from "@/pages/AuthorDashboard";
import { AuthorSettings } from "@/pages/AuthorSettings";
import { CreateQRPage } from "@/pages/CreateQRPage";
import QRCodeDesign from "@/pages/QRCodeDesign";
import { AuthorBankAccount } from "@/pages/AuthorBankAccount";
import { AuthorPublicProfile } from "@/pages/AuthorPublicProfile";
import QRCodeSummary from "@/pages/QRCodeSummary";

const queryClient = new QueryClient();

function App() {
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
      </Routes>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
