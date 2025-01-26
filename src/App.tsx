import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import AuthorLogin from "./pages/AuthorLogin";
import AuthorRegister from "./pages/AuthorRegister";
import AuthorDashboard from "./pages/AuthorDashboard";
import AuthorBankAccount from "./pages/AuthorBankAccount";
import CreateQRPage from "./pages/CreateQRPage";
import AuthorPublicProfile from "./pages/AuthorPublicProfile";
import QRCodeDetails from "./pages/QRCodeDetails";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/author/login" element={<AuthorLogin />} />
          <Route path="/author/register" element={<AuthorRegister />} />
          <Route path="/author/dashboard" element={<AuthorDashboard />} />
          <Route path="/author/bank-account" element={<AuthorBankAccount />} />
          <Route path="/author/create-qr" element={<CreateQRPage />} />
          <Route path="/author/profile/:id" element={<AuthorPublicProfile />} />
          <Route path="/qr/:id" element={<QRCodeDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;