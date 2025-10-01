// src/routes/routes.tsx

import Index from "@/pages/Index";
import About from "@/pages/About";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import TermsOfService from "@/pages/TermsOfService";
import SearchPage from "@/pages/SearchPage";
import AuthorRegister from "@/pages/AuthorRegister";
import AuthorLogin from "@/pages/AuthorLogin";
import AuthorPasswordReset from "@/pages/AuthorPasswordReset";
import AuthorDashboard from "@/pages/AuthorDashboard";
import AuthorSettings from "@/pages/AuthorSettings";
import QRCodeDesign from "@/pages/QRCodeDesign";
import AuthorBankAccount from "@/pages/AuthorBankAccount";
import AuthorPublicProfile from "@/pages/AuthorPublicProfile";
import QRCodeSummary from "@/pages/QRCodeSummary";
import QRCodeDetails from "@/pages/QRCodeDetails";
import AuthorQRCodeDetails from "@/pages/AuthorQRCodeDetails";
import BookQRCodesPage from "@/pages/BookQRCodesPage";
import TipFeedPage from "@/pages/TipFeedPage";
import AuthorDataPage from "@/pages/AuthorDataPage";
import HowItWorks from "@/pages/HowItWorks";
import PublicProfilePage from "@/pages/PublicProfilePage";
import TipSuccessPage from "@/pages/TipSuccessPage";
import UnsubscribePage from "@/pages/UnsubscribePage";
import StripeHelp from "@/pages/StripeHelp";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Pricing from "@/pages/Pricing";
import AdminDashboard from "@/pages/AdminDashboard";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import { Navigate } from "react-router-dom";

export const routes = [
  { path: "/", component: Index },
  { path: "/about", component: About },
  { path: "/faq", component: FAQ },
  { path: "/contact", component: Contact },
  { path: "/terms", component: TermsOfService },
  { path: "/search", component: SearchPage },
  
  // New slug-based routes
  { path: "/author/:nameSlug", component: PublicProfilePage },
  { path: "/book/:bookSlug", component: QRCodeDetails },
  { path: "/author/book/:bookSlug", component: AuthorQRCodeDetails },
  
  // Legacy UUID routes for backward compatibility
  { path: "/profile/:id", component: PublicProfilePage },
  { path: "/qr/:id", component: QRCodeDetails },
  { path: "/author/qr/:id", component: AuthorQRCodeDetails },
  
  { path: "/author/register", component: AuthorRegister },
  { path: "/author/login", component: AuthorLogin },
  { path: "/author/reset-password", component: AuthorPasswordReset },
  { path: "/author/dashboard", component: AuthorDashboard },
  { path: "/author/settings", component: AuthorSettings },
  { path: "/author/qr-design", component: QRCodeDesign },
  { path: "/author/bank-account", component: AuthorBankAccount },
  { path: "/author/profile/:id", component: AuthorPublicProfile },
  { path: "/author/book-qr-codes", component: BookQRCodesPage },
  { path: "/author/tip-feed", component: TipFeedPage },
  { path: "/author/data", component: AuthorDataPage },
  { path: "/how-it-works", component: HowItWorks },
  { path: "/qr-summary", component: QRCodeSummary },
  { path: "/tip-success", component: TipSuccessPage },
  { path: "/unsubscribe", component: UnsubscribePage },
  { path: "/stripe-help", component: StripeHelp },
  { path: "/privacy", component: PrivacyPolicy },
  { path: "/pricing", component: Pricing },
  
  // Blog routes
  { path: "/blog", component: BlogPage },
  { path: "/blog/:slug", component: BlogPostPage },
  
  // Admin route
  { path: "/admin", component: AdminDashboard },

  // Redirects (still using JSX for Navigate)
  { path: "/author/create-qr", element: <Navigate to="/author/book-qr-codes?tab=new" replace /> },
];