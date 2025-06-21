
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, MessageSquare, DollarSign, Link as LinkIcon, BookOpen, Users, ChevronRight } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageModal } from "@/components/ui/image-modal";
import { Meta } from "@/components/Meta"; 
import { useState } from "react";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [expandedImage, setExpandedImage] = useState<{src: string, alt: string, title: string} | null>(null);

  const handleCreateQRCode = () => {
    if (!user) {
      navigate("/author/login");
      return;
    }
    navigate("/author/create-qr");
  };

  const openImageModal = (src: string, alt: string, title: string) => {
    setExpandedImage({ src, alt, title });
  };

  const closeImageModal = () => {
    setExpandedImage(null);
  };

  return (
    <>
    <Meta
      title="Quilltips – Instantly Tip Your Favorite Authors"
      description="Quilltips lets readers support authors by scanning a QR code on their book and sending a tip with a personal message."
      url="https://quilltips.co"
    />

    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      {/* Hero Section */}
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 py-16 lg:py-24">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-10 max-w-xl">
            <div className="space-y-8">
              <h1 className="font-playfair font-bold text-5xl sm:text-6xl lg:text-7xl text-[#19363C] leading-tight">
                Helping authors grow
              </h1>
              <p className="text-xl sm:text-2xl text-[#19363C]/70 font-medium">
                Powerful QR codes for your books
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
              <RouterLink to="/author/register">
                <Button 
                  size="lg" 
                  className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#19363C] font-medium text-lg px-8 py-4 h-auto rounded-full transition-all duration-200 plausible-event-name=create-account-hero" 
                  data-plausible-event="create-account-hero"
                >
                  Create an account
                </Button>
              </RouterLink>
              <RouterLink to="/how-it-works">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-[#19363C] text-[#19363C] hover:shadow-lg font-medium text-lg px-8 py-4 h-auto rounded-full transition-all duration-200"
                >
                  See how it works
                </Button>
              </RouterLink>
            </div>
          </div>

          {/* Right Visual */}
          <div className="flex-1 flex justify-center lg:justify-center max-w-md lg:max-w-lg">
            <div className="relative">
              {/* Phone mockup with QR code */}
              <div className="relative bg-white rounded-[2.5rem] p-4 border-4 border-[#19363C] max-w-sm mx-auto">
                <div className="bg-gray-50 rounded-[1.5rem] p-6 h-96 flex flex-col items-center justify-center space-y-4">
                  {/* Quill icon */}
                  <div className="w-16 h-16 bg-[#19363C] rounded-full flex items-center justify-center mb-2">
                    <BookOpen className="w-8 h-8 text-[#FFD166]" />
                  </div>
                  
                  {/* Heart */}
                  <div className="text-[#19363C] mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  
                  {/* QR Code placeholder */}
                  <div className="w-32 h-32 bg-white border-2 border-[#19363C] rounded-lg flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-[#19363C]" />
                  </div>
                </div>
              </div>
              
              {/* Book base */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-64 h-8 bg-[#19363C] rounded-lg opacity-20"></div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-56 h-6 bg-[#19363C] rounded-lg opacity-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* What is Quilltips */}
      <div className="mx-auto w-full max-w-5xl mt-32 text-center space-y-8">
        <h2 className="text-4xl sm:text-5xl font-playfair font-medium text-[#19363C]">What is Quilltips?</h2>
        <p className="font-lato text-lg sm:text-xl max-w-4xl mx-auto text-[#19363C]/80 leading-relaxed">
          With Quilltips, authors can add a QR code to their books for readers to scan. Scanning opens a Quilltips Jar, where readers can leave a tip and message!
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-start gap-6 mt-16 px-2">
        {/* Author Dashboard */}
        <div 
          className="max-w-3xl w-full rounded-2xl bg-white border border-[#19363C]/10 p-3 cursor-pointer transition-all duration-200"
          onClick={() => openImageModal(
            "/lovable-uploads/screenshots/QT_dashboard.webp",
            "Author dashboard view",
            "Author Dashboard"
          )}
        >
          <img
            src="/lovable-uploads/screenshots/QT_dashboard.webp"
            alt="Author dashboard view"
            className="w-full rounded-xl object-contain"
          />
        </div>

        {/* Reader Crumble View */}
        <div 
          className="max-w-lg w-full rounded-2xl bg-white border border-[#FFD166]/20 p-3 cursor-pointer transition-all duration-200"
          onClick={() => openImageModal(
            "/lovable-uploads/screenshots/crumble_screenshot.webp",
            "Reader tip jar view",
            "Reader Tip Jar"
          )}
        >
          <img
            src="/lovable-uploads/screenshots/crumble_screenshot.webp"
            alt="Reader tip jar view"
            className="w-full rounded-xl object-contain"
          />
        </div>
      </div>

      {/* Value Props */}
      <div className="mx-auto w-full max-w-6xl mt-32 px-4">
        <h2 className="text-4xl sm:text-5xl font-playfair font-medium text-center mb-16 text-[#19363C]">Why Do Authors Love Quilltips?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
            icon: <DollarSign className="w-8 h-8 text-[#19363C]" />,
            title: "Earn More From Your Books",
            text: "Give readers an easy way to support you directly, even with used books and library copies."
          }, {
            icon: <MessageSquare className="w-8 h-8 text-[#19363C]" />,
            title: "Connect With Your Readers",
            text: "Receive messages from fans and build your email list with each tip your books generate."
          }, {
            icon: <LinkIcon className="w-8 h-8 text-[#19363C]" />,
            title: "Promote Your Platform",
            text: "Link to your website and socials - all from one centralized place."
          }].map(({ icon, title, text }, idx) => (
            <Card key={idx} className="bg-white/90 p-8 border border-[#19363C]/10 rounded-2xl">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-[#FFD166] rounded-full flex items-center justify-center">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold text-[#19363C]">{title}</h3>
                <p className="text-[#19363C]/80 leading-relaxed">{text}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mx-auto w-full max-w-5xl mt-32 px-4">
        <h2 className="text-4xl sm:text-5xl font-playfair font-medium text-center mb-20 text-[#19363C]">How Does It Work?</h2>

        {[{
          icon: <QrCode className="w-16 h-16 md:w-20 md:h-20 text-[#FFD166]" />,
          title: "Step 1. Create your Quilltips Jar",
          text: "Create a virtual tip jar, accessible through a QR code. Download the code to print on the cover or inside the jacket of your next book. Link your bank account with Stripe.",
          reverse: false
        }, {
          icon: <Users className="w-16 h-16 md:w-20 md:h-20 text-[#FFD166]" />,
          title: "Step 2. Meet your readers",
          text: "Readers scan the QR code to open your virtual tip jar and leave tips and messages. From your profile, readers can find links to your website and social media accounts.",
          reverse: true
        }, {
          icon: <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-[#FFD166]" />,
          title: "Step 3. Build support",
          text: "Grow your e-mail list and understand your audience with Quilltips' Data dashboard.",
          reverse: false
        }].map(({ icon, title, text, reverse }, idx) => (
          <div
            key={idx}
            className={`flex flex-col-reverse md:flex-row ${reverse ? "md:flex-row-reverse" : ""} items-center gap-12 mb-24`}
          >
            {/* Text */}
            <div className="text-center md:text-left max-w-lg space-y-4">
              <h3 className="font-semibold text-2xl text-[#19363C]">{title}</h3>
              <p className="text-[#19363C]/80 leading-relaxed">{text}</p>
            </div>

            {/* Icon */}
            <div className="flex justify-center md:justify-start">
              <div className="w-32 h-32 md:w-48 md:h-48 bg-[#19363C] rounded-full flex items-center justify-center">
               {icon}
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-16">
          <RouterLink to="/how-it-works">
            <Button variant="outline" className="rounded-full px-10 border-[#19363C] text-[#19363C] hover:bg-[#19363C] hover:text-white plausible-event-name=how-it-works" data-plausible-event="how-it-works">
              Learn more
            </Button>
          </RouterLink>
        </div>
      </div>

      {/* Message for Readers */}
      <div className="mx-auto w-full max-w-4xl lg:max-w-5xl mt-32 px-4 text-center">
        <div className="max-w-3xl lg:max-w-4xl mx-auto p-12">
          <h2 className="text-4xl sm:text-5xl font-playfair font-medium mb-8 text-[#19363C]">For Readers</h2>
          <p className="text-lg sm:text-xl mb-12 text-[#19363C]/80 leading-relaxed">
            Readers can use Quilltips quickly and easily—just scan the QR code on your book or search for it on Quilltips, add a message, and send a tip! No accounts or sign-up required.
          </p>
          <div className="flex justify-center">
            <img
              src="/lovable-uploads/reader_quilltips.webp"
              alt="Reader scanning a QR code to tip an author"
              className="max-w-md w-full rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Why Quilltips Story */}
      <div className="mx-auto w-full max-w-4xl mt-32 px-4">
        <h2 className="text-4xl sm:text-5xl font-playfair font-medium text-center mb-16 text-[#19363C]">Why Quilltips?</h2>
        <div className="text-lg sm:text-xl space-y-6 text-left max-w-3xl mx-auto text-[#19363C]/80 leading-relaxed p-12">
          <p>Fair author compensation is really hard to achieve given the structure of the book industry, where royalties on used books and reused library copies are nonexistent.</p>
          <p>As the demand for used books grows, books can have an active and adventurous life for years after they are printed, providing joy to readers in an environmentally sustainable and accessible way. Most readers would be happy to directly support their favorite authors, if only there was a way to do it!</p>
          <p>This is the idea that hatched Quilltips, a platform that supports fair author compensation and connects authors directly with their audience.</p>
          <p className="font-semibold text-[#19363C]">Join us on our journey, and launch your first Quilltips Jar today!</p>
        </div>

        <div className="flex justify-center mt-12">
          <RouterLink to="/about">
            <Button variant="outline" className="rounded-full px-10 flex items-center gap-2 border-[#19363C] text-[#19363C] hover:bg-[#19363C] hover:text-white plausible-event-name=about-quilltips" >
              Learn more about us
            </Button>
          </RouterLink>
        </div>
      </div>

      {/* Get Started Section */}
      <div className="mx-auto w-full max-w-4xl mt-32 text-center space-y-12 animate-enter py-24 px-4">
        <div className="space-y-8">
          <h2 className="text-4xl sm:text-5xl font-playfair font-medium text-[#19363C]">Ready to get started?</h2>
          <h3 className="text-xl sm:text-2xl text-[#19363C]/80">
            Create an account to connect with readers and earn tips!
          </h3>
        </div>
        <RouterLink to="/author/register">
          <Button size="lg" className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#19363C] font-semibold transition-all duration-200 px-12 py-4 h-auto rounded-full plausible-event-name=create-account-bottom" data-plausible-event="create-account-bottom">
            Create an account
          </Button>
        </RouterLink>
      </div>
    </div>

    {/* Image Modal */}
    {expandedImage && (
      <ImageModal
        isOpen={!!expandedImage}
        onClose={closeImageModal}
        src={expandedImage.src}
        alt={expandedImage.alt}
        title={expandedImage.title}
      />
    )}
    </>
  );
};

export default Index;
