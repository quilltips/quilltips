
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
import AuthorQRCodeDetails from "@/pages/AuthorQRCodeDetails";
import BookQRCodesPage from "@/pages/BookQRCodesPage";
import TipFeedPage from "@/pages/TipFeedPage";
import AuthorDataPage from "@/pages/AuthorDataPage";
import HowItWorks from "@/pages/HowItWorks";
import PublicProfilePage from "@/pages/PublicProfilePage";
import TipSuccessPage from "@/pages/TipSuccessPage";

export const routes = [
  { path: "/", element: <Index /> },
  { path: "/about", element: <About /> },
  { path: "/faq", element: <FAQ /> },
  { path: "/contact", element: <Contact /> },
  { path: "/terms", element: <TermsOfService /> },
  { path: "/search", element: <SearchPage /> },
  { path: "/profile/:id", element: <PublicProfilePage /> },
  { path: "/author/register", element: <AuthorRegister /> },
  { path: "/author/login", element: <AuthorLogin /> },
  { path: "/author/dashboard", element: <AuthorDashboard /> },
  { path: "/author/settings", element: <AuthorSettings /> },
  { path: "/author/create-qr", element: <CreateQRPage /> },
  { path: "/author/qr-design", element: <QRCodeDesign /> },
  { path: "/author/bank-account", element: <AuthorBankAccount /> },
  { path: "/author/profile/:id", element: <AuthorPublicProfile /> },
  { path: "/author/qr/:id", element: <AuthorQRCodeDetails /> },
  { path: "/author/book-qr-codes", element: <BookQRCodesPage /> },
  { path: "/author/tip-feed", element: <TipFeedPage /> },
  { path: "/author/data", element: <AuthorDataPage /> },
  { path: "/how-it-works", element: <HowItWorks /> },
  { path: "/qr-summary", element: <QRCodeSummary /> },
  { path: "/qr/:id", element: <QRCodeDetails /> },
  { path: "/tip-success", element: <TipSuccessPage /> },
];
