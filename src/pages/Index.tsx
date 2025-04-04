
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, MessageSquare, Share, DollarSign, Link as LinkIcon, BookOpen, Users, ChevronRight } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateQRCode = () => {
    if (!user) {
      // Redirect to login page instead of showing an error
      navigate("/author/login");
      return;
    }
    navigate("/author/create-qr");
  };

  return <Layout>
      <div className="container mx-auto px-4 pt-16 pb-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-enter">
          <div className="space-y-4">
            <img src="/lovable-uploads/8718ff3b-2170-4226-b088-575917507a51.png" alt="Quilltips" className="h-36 mx-auto" />
            <h1 className="font-playfair font-medium text-6xl">Quilltips</h1>
            <h2 className="text-muted-foreground mx-[62px] px-[4px] text-xl py-[24px]">
              Helping authors get paid
            </h2>
          </div>

          <RouterLink to="/author/register">
            <Button size="lg" className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] hover:shadow-lg transition-all duration-200 px-12 py-[9px] my-[10px]">
              Create an account
            </Button>
          </RouterLink>
        </div>

        {/* Connecting Authors Section */}
        <div className="max-w-4xl mx-auto mt-24 text-center space-y-6">
          <h2 className="text-4xl font-playfair font-medium">What is Quilltips?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            With Quilltips, authors can add a QR code to their books for readers to scan. Scanning opens a Quilltips Jar, where readers can leave a tip and message!
          </p>
          <div className="flex justify-center mt-8">
            <img src="/lovable-uploads/0b6b9cb2-dc5c-46e3-be9f-1f761dd356cf.png" alt="Quilltips app showing tip feed on mobile phones" className="w-full max-w-2xl rounded-lg object-scale-down" />
          </div>
        </div>

        {/* Value Proposition Section - NEW */}
        <div className="max-w-4xl mx-auto mt-24">
          <h2 className="text-4xl font-playfair font-medium text-center mb-12">Why Do Authors Love Quilltips?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value Prop 1 */}
            <Card className="bg-white p-8 hover:shadow-md transition-all duration-200 border border-[#FFD166]/20 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-[#FFF8E7] rounded-full flex items-center justify-center mb-2">
                  <DollarSign className="w-8 h-8 text-[#FFD166]" />
                </div>
                <h3 className="text-xl font-semibold">Earn More From Your Books</h3>
                <p className="text-muted-foreground">
                  Give readers an easy way to support you directly, even with used books and library copies.
                </p>
              </div>
            </Card>
            
            {/* Value Prop 2 */}
            <Card className="bg-white p-8 hover:shadow-md transition-all duration-200 border border-[#FFD166]/20 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-[#FFF8E7] rounded-full flex items-center justify-center mb-2">
                  <MessageSquare className="w-8 h-8 text-[#FFD166]" />
                </div>
                <h3 className="text-xl font-semibold">Connect With Your Readers</h3>
                <p className="text-muted-foreground">
                  Receive messages from fans and build your email list with each tip your books generate.
                </p>
              </div>
            </Card>
            
            {/* Value Prop 3 */}
            <Card className="bg-white p-8 hover:shadow-md transition-all duration-200 border border-[#FFD166]/20 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-[#FFF8E7] rounded-full flex items-center justify-center mb-2">
                  <LinkIcon className="w-8 h-8 text-[#FFD166]" />
                </div>
                <h3 className="text-xl font-semibold">Promote Your Platform</h3>
                <p className="text-muted-foreground">
                  Link to your website, social media, and newsletter - all from one centralized place.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* How it works Section - Redesigned with staggered layout */}
        <div className="max-w-3xl mx-auto mt-24">
          <h2 className="text-4xl font-playfair font-medium text-center mb-20">How Does It Work?</h2>

          {/* Step 1 - Right aligned with QR code icon */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-24">
            <div className="order-last md:order-first flex justify-center">
              <div className="w-48 h-48 bg-[#FFF8E7] rounded-full flex items-center justify-center">
                <QrCode className="w-20 h-20 text-[#FFD166]" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-2xl mb-4">Step 1. Create your Quilltips Jar</h3>
              <p className="text-muted-foreground">
                Create a virtual tip jar, accessible through a QR code. Download the code to print on the cover or inside the jacket of your next book.
              </p>
            </div>
          </div>

          {/* Step 2 - Left aligned with reader icon */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-24">
            <div>
              <h3 className="font-semibold text-2xl mb-4">Step 2. Meet your readers</h3>
              <p className="text-muted-foreground">
                Readers scan the QR code to open your virtual tip jar and leave tips and messages. From your profile, readers can find links to your website and social media accounts.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-[#FFF8E7] rounded-full flex items-center justify-center">
                <Users className="w-20 h-20 text-[#FFD166]" />
              </div>
            </div>
          </div>

          {/* Step 3 - Right aligned with book/data icon */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-12">
            <div className="order-last md:order-first flex justify-center">
              <div className="w-48 h-48 bg-[#FFF8E7] rounded-full flex items-center justify-center">
                <BookOpen className="w-20 h-20 text-[#FFD166]" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-2xl mb-4">Step 3. Build support</h3>
              <p className="text-muted-foreground">
                Use information gathered from your readers to market your future books.
              </p>
            </div>
          </div>

          {/* Learn More Button */}
          <div className="flex justify-center mt-12">
            <RouterLink to="/how-it-works">
              <Button variant="outline" className="rounded-full px-10">
                Learn more
              </Button>
            </RouterLink>
          </div>
        </div>

        {/* Why Quilltips Section */}
        <div className="max-w-4xl mx-auto mt-24">
          <h2 className="text-4xl font-playfair font-medium text-center mb-12">Why Quilltips?</h2>
          <div className="grid md:grid-cols-1 gap-8 items-center">
            <div className="text-lg text-muted-foreground space-y-4 text-left">
              <p>Fair author compensation is really hard to achieve given the structure of the book industry, where royalties on used books and reused library copies are nonexistent.</p>
              <p>As the demand for used books grows, books can have an active and adventurous life for years after they are printed, providing joy to readers in an environmentally sustainable and accessible way. Most readers would be happy to directly support their favorite authors, if only there was a way to do it!</p>
              <p>
                This is the idea that hatched Quilltips, a platform that supports fair author compensation and connects authors directly with their audience.
              </p>
              <p>
                Join us on our journey, and launch your first Quilltips Jar today!
              </p>
            </div>
            <div className="relative w-full h-full flex justify-center items-center">
             
            </div>
            
            {/* About page link */}
            <div className="flex justify-center mt-8">
              <RouterLink to="/about">
                <Button variant="outline" className="rounded-full px-10 flex items-center gap-2">
                  Learn more about us
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </RouterLink>
            </div>
          </div>
        </div>

        {/* Get Started Section */}
        <div className="max-w-4xl mx-auto mt-24 text-center space-y-8 animate-enter py-[75px]">
          <div className="space-y-4">
            <h2 className="text-4xl font-playfair font-medium">Ready to get started?</h2>
            <h3 className="text-muted-foreground mx-[62px] px-[4px] text-xl py-[24px]">
              Create an account to connect with readers and collect tips!
            </h3>
          </div>
          <Button 
            onClick={handleCreateQRCode}
            size="lg" 
            className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] hover:shadow-lg transition-all duration-200 px-12 py-[9px] my-[10px]"
          >
            Create a QR code
          </Button>
        </div>
      </div>
    </Layout>;
};
export default Index;
