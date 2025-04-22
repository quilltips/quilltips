import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, MessageSquare, DollarSign, Link as LinkIcon, BookOpen, Users, ChevronRight } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateQRCode = () => {
    if (!user) {
      navigate("/author/login");
      return;
    }
    navigate("/author/create-qr");
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
      {/* Hero Section */}
      <div className="mx-auto w-full max-w-5xl text-center space-y-8 animate-enter">
        <div className="space-y-4">
          <OptimizedImage
            src="/lovable-uploads/logo_nav.png"
            alt="Quilltips"
            width={144}
            height={144}
            className="mx-auto"
            priority={true}
            sizes="144px"
            objectFit="contain"
          />
          <h1 className="font-playfair font-medium text-6xl text-[#19363C]">Quilltips</h1>
          <h2 className="text-muted-foreground text-xl py-6 px-4">
            Helping authors get paid
          </h2>
        </div>

        <RouterLink to="/author/register">
          <Button size="lg" className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] hover:shadow-lg transition-all duration-200 px-12 py-[9px] my-[10px]">
            Create an account
          </Button>
        </RouterLink>
      </div>

      {/* What is Quilltips */}
      <div className="mx-auto w-full max-w-6xl mt-24 text-center space-y-6">
        <h2 className="text-4xl font-playfair font-medium">What is Quilltips?</h2>
        <p className="text-lg text-muted-foreground max-w-4xl mx-auto pb-10">
          With Quilltips, authors can add a QR code to their books for readers to scan. Scanning opens a Quilltips Jar, where readers can leave a tip and message!
        </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-start gap-4 mt-5 px-2">
          {/* Author Dashboard */}
          <div className="max-w-3xl w-full rounded-xl shadow-lg hover:shadow-2xl transition-all bg-[#19363C] p-3">
            <img
              src="/lovable-uploads/screenshots/QT_dashboard.png"
              alt="Author dashboard view"
              className="w-full rounded-lg object-contain"
            />
          </div>

          {/* Reader Crumble View */}
          <div className="max-w-lg w-full rounded-xl shadow-lg hover:shadow-2xl transition-all bg-[#FFD166] p-3">
            <img
              src="/lovable-uploads/screenshots/crumble_screenshot.png"
              alt="Reader tip jar view"
              className="w-full rounded-lg object-contain"
            />
          </div>
        </div>


      {/* Value Props */}
      <div className="mx-auto w-full max-w-7xl mt-24 px-4">
        <h2 className="text-4xl font-playfair font-medium text-center mb-12">Why Do Authors Love Quilltips?</h2>
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
            <Card key={idx} className="bg-white p-8 hover:shadow-md transition-all duration-200 border border-[#FFD166]/20 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-[#FFD166] rounded-full flex items-center justify-center mb-2">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground">{text}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mx-auto w-full max-w-6xl mt-24 px-4">
        <h2 className="text-4xl font-playfair font-medium text-center mb-20">How Does It Work?</h2>
        {[{
          icon: <QrCode className="w-20 h-20 text-[#FFD166]" />,
          title: "Step 1. Create your Quilltips Jar",
          text: "Create a virtual tip jar, accessible through a QR code. Download the code to print on the cover or inside the jacket of your next book. Link your bank account with Stripe.",
          reverse: true
        }, {
          icon: <Users className="w-20 h-20 text-[#FFD166]" />,
          title: "Step 2. Meet your readers",
          text: "Readers scan the QR code to open your virtual tip jar and leave tips and messages. From your profile, readers can find links to your website and social media accounts.",
          reverse: false
        }, {
          icon: <BookOpen className="w-20 h-20 text-[#FFD166]" />,
          title: "Step 3. Build support",
          text: "Grow your e-mail list and understand your audience with Quilltips' Data dashboard.",
          reverse: true
        }].map(({ icon, title, text, reverse }, idx) => (
          <div key={idx} className={`grid md:grid-cols-2 gap-10 items-center mb-24 ${reverse ? 'md:flex-row-reverse' : ''}`}>
            <div className={`flex justify-center ${reverse ? 'order-last' : ''}`}>
              <div className="w-48 h-48 bg-[#19363C] rounded-full flex items-center justify-center">
                {icon}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-2xl mb-4">{title}</h3>
              <p className="text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-12">
          <RouterLink to="/how-it-works">
            <Button variant="outline" className="rounded-full px-10">
              Learn more
            </Button>
          </RouterLink>
        </div>
      </div>

      {/* Message for Readers */}
      <div className="mx-auto w-full max-w-4xl lg:max-w-6xl mt-24 px-4 text-center">
        <div className="max-w-3xl lg:max-w-4xl mx-auto rounded-2xl p-8">
          <h2 className="text-4xl font-playfair font-medium mb-6">For Readers</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Readers can use Quilltips quickly and easily—just scan the QR code on your book or search for it on Quilltips, add a message, and send a tip! No accounts or sign-up required.
          </p>
          <div className="flex justify-center">
            <img
              src="/lovable-uploads/reader_quilltips.png"
              alt="Reader scanning a QR code to tip an author"
              className="max-w-md w-full rounded-xl shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Why Quilltips Story */}
      <div className="mx-auto w-full max-w-5xl mt-24 px-4">
        <h2 className="text-4xl font-playfair font-medium text-center mb-12">Why Quilltips?</h2>
        <div className="text-lg text-muted-foreground space-y-4 text-left max-w-3xl mx-auto">
          <p>Fair author compensation is really hard to achieve given the structure of the book industry, where royalties on used books and reused library copies are nonexistent.</p>
          <p>As the demand for used books grows, books can have an active and adventurous life for years after they are printed, providing joy to readers in an environmentally sustainable and accessible way. Most readers would be happy to directly support their favorite authors, if only there was a way to do it!</p>
          <p>This is the idea that hatched Quilltips, a platform that supports fair author compensation and connects authors directly with their audience.</p>
          <p>Join us on our journey, and launch your first Quilltips Jar today!</p>
        </div>

        <div className="flex justify-center mt-8">
          <RouterLink to="/about">
            <Button variant="outline" className="rounded-full px-10 flex items-center gap-2">
              Learn more about us
              <ChevronRight className="h-4 w-4" />
            </Button>
          </RouterLink>
        </div>
      </div>

      {/* Get Started Section */}
      <div className="mx-auto w-full max-w-5xl mt-24 text-center space-y-8 animate-enter py-[75px] px-4">
        <div className="space-y-4">
          <h2 className="text-4xl font-playfair font-medium">Ready to get started?</h2>
          <h3 className="text-muted-foreground text-xl py-[24px]">
            Create an account to connect with readers and earn tips!
          </h3>
        </div>
        <RouterLink to="/author/register">
          <Button size="lg" className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] hover:shadow-lg transition-all duration-200 px-12 py-[9px] my-[10px]">
            Create an account
          </Button>
        </RouterLink>
      </div>
    </div>
  );
};

export default Index;
