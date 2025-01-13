import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthorRegister from "./pages/AuthorRegister";
import AuthorLogin from "./pages/AuthorLogin";
import AuthorDashboard from "./pages/AuthorDashboard";
import AuthorPublicProfile from "./pages/AuthorPublicProfile";
import CreateQRPage from "./pages/CreateQRPage";
import AuthorBankAccount from "./pages/AuthorBankAccount";
import SearchPage from "./pages/SearchPage";
import { Toaster } from "./components/ui/toaster";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/author/register" element={<AuthorRegister />} />
        <Route path="/author/login" element={<AuthorLogin />} />
        <Route path="/author/dashboard" element={<AuthorDashboard />} />
        <Route path="/author/profile/:id" element={<AuthorPublicProfile />} />
        <Route path="/author/create-qr" element={<CreateQRPage />} />
        <Route path="/author/bank-account" element={<AuthorBankAccount />} />
        <Route 
          path="/author/reset-password" 
          element={<AuthorLogin />} 
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;