
import { Link } from "react-router-dom";
import { StyledQRCode } from "@/components/qr/StyledQRCode";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import backCoverExample from "@/assets/back_cover_example.png";
import { Meta } from "@/components/Meta"; 
import { QRCodePreview } from "@/components/qr/QRCodePreview";

const HowItWorks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateQRCode = () => {
    if (!user) {
      navigate("/author/login");
      return;
    }
    navigate("/author/book-qr-codes?tab=new");
  };
  
  return (
    <>
    <Meta
      title="Quilltips - How it works"
      description="Learn how to engage with your readers through QR codes on your books. Simple steps to enhance your reader experience and grow your platform."
      url="https://quilltips.co/how-it-works"
    />

    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-10 text-[#333333]">
            How Quilltips Works
          </h1>
          <p className="text-xl md:text-2xl text-[#333333] max-w-3xl mx-auto leading-relaxed">
            Create a Quilltips Jar, add the QR code to your book and enhance your reader experience
          </p>
        </div>

        {/* Step 1: Create Account & Link Stripe */}
        <div className="mb-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
              
                <h2 className="text-3xl md:text-4xl font-playfair font-medium text-[#333333]">
                  Create your Quilltips account and link to Stripe
                </h2>
              </div>
              <p className="text-lg text-[#333333]/80 leading-relaxed">
                Sign up for Quilltips and complete Stripe onboarding to enable tips from your fanbase (optional). Learn more about our <Link to="/pricing" className="text-[#333333] underline hover:text-[#333333]/80 transition-colors">pricing</Link> and <Link to="/about" className="text-[#333333] underline hover:text-[#333333]/80 transition-colors">mission</Link>.
              </p>
              <div className="pt-4">
                <Link 
                  to="/stripe-help" 
                  className="text-[#333333] underline hover:text-[#333333]/80 transition-colors"
                >
                  Learn more about Stripe setup →
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <img 
                  src="/lovable-uploads/screenshots/QT_dashboard.webp"
                  alt="Quilltips dashboard view"
                  className="w-full rounded-2xl border border-[#333333]/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Generate QR Code */}
        <div className="mb-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-3xl md:text-4xl font-playfair font-medium text-[#333333]">
                  Generate and download your QR code
                </h2>
              </div>
              <p className="text-lg text-[#333333]/80 leading-relaxed">
                Create a custom QR code for each of your books. Each code links to your personalized Quilltips Jar where readers can see more about your book, message you, leave a tip and more. You can configure your Quilltips Jar to include a thank-you video, character art, and book recommendations during the creation process or afterwards from your dashboard.
              </p>
              
            </div>
            <div className="md:order-1 flex justify-center">
              <div className="bg-transparent p-8 rounded-2xl shadow-none">
                <div className="text-center mb-6">
                <StyledQRCode 
              value="https://quilltips.com/example" 
              size={180} 
              className="mx-auto"
            />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Put it on your book */}
        <div className="mb-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
               
                <h2 className="text-3xl md:text-4xl font-playfair font-medium text-[#19363C]">
                  Put it on your book
                </h2>
              </div>
              <p className="text-lg text-[#19363C]/80 leading-relaxed">
                Work with your publisher or designer to print the QR code on your book cover or About the Author page. <strong>QR codes should be minimum 1 inch by 1 inch for optimal scanning.</strong>
              </p>
            
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <img 
                  src={backCoverExample}
                  alt="Book back cover with QR code example"
                  className="w-full rounded-2xl shadow-lg border border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Receive tips and build audience */}
        <div className="mb-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2 space-y-6">
              <div className="flex items-center gap-4 mb-6">
               
                <h2 className="text-3xl md:text-4xl font-playfair font-medium text-[#19363C]">
                  Engage with your readers 
                </h2>
              </div>
              <p className="text-lg text-[#19363C]/80 leading-relaxed">
                Readers scan your QR code to learn more about your book and to leave tips and messages. Use your Quilltips profile to link to your website and socials, growing your audience with every interaction.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#FFD166] rounded-full"></div>
                  <span className="text-[#19363C]">Share a video with your readers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#FFD166] rounded-full"></div>
                  <span className="text-[#19363C]">Like and reply to messages from your fans and allow them to thank you with tips</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#FFD166] rounded-full"></div>
                  <span className="text-[#19363C]">Grow your email list with reader signups</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#FFD166] rounded-full"></div>
                  <span className="text-[#19363C]">Link back to your website and socials</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#FFD166] rounded-full"></div>
                  <span className="text-[#19363C]">...and more!</span>
                </div>
              </div>
            </div>
            <div className="md:order-1 flex justify-center">
              <div className="w-full max-w-md">
                <img 
                  src="/lovable-uploads/screenshots/book-page-1.webp"
                  alt="Dashboard showing tips and messages from readers"
                  className="w-full rounded-2xl border border-[#333333]/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-20">
          <div className=" rounded-3xl p-12 md:p-16">
            <h3 className="text-3xl md:text-4xl font-playfair font-medium text-[#333333] mb-12">
              Ready to launch your next book?
            </h3>
            
            <Button 
              onClick={handleCreateQRCode}
              size="lg"
              className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#19363C] font-medium text-lg px-12 py-6 h-auto rounded-full"
            >
              Create your first QR code
            </Button>
          </div>
        </div>

        {/* How do QR codes work section */}
        <div className="space-y-8 pt-16 border-t border-[#19363C]/10">
          <h2 className="text-3xl md:text-4xl font-playfair font-medium text-center mb-16 text-[#19363C]">How do QR codes work?</h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img 
                src={backCoverExample}
                alt="Back cover QR code example"
                className="max-w-full w-[300px] rounded-2xl border border-gray-200 shadow-lg"
              />
            </div>

            <div className="space-y-6">
              <p className="text-lg text-[#19363C]/80 leading-relaxed">
                A QR code is like a barcode that readers can scan to open your virtual Quilltips Jar. Any author can create a QR code for a book using Quilltips. After you purchase the QR code, we generate a virtual Quilltips Jar associated with the QR code where readers can leave a tip and a message about the book.
              </p>

              <p className="text-lg text-[#19363C]/80 leading-relaxed">
                Work with the publisher or designer to get the QR code printed on the book. We recommend printing the QR code directly on the cover or on the About the Author page. <strong>QR codes should be a minimum of 1 inch by 1 inch, which translates to 300x300 pixels at standard print resolution (300 PPI).</strong>
              </p>

              <p className="text-lg text-[#19363C]/80 leading-relaxed">
                You'll be able to access and download valuable reader information across all your Quilltips Jars.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-32 mb-20">
          <Button 
            onClick={handleCreateQRCode}
            size="lg"
            className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#19363C] font-medium text-xl px-16 py-8 h-auto rounded-full"
          >
            Get started today
          </Button>
        </div>
      </div>
    </main>
    </>
  );
};

export default HowItWorks;
