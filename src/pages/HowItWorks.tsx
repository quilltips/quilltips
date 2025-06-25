
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
      title="Turn Your Book Into An Asset – Quilltips"
      description="Learn how to turn your book into a revenue-generating asset with Quilltips QR codes. Simple steps to connect with readers and earn tips."
      url="https://quilltips.co/how-it-works"
    />

    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-playfair font-medium mb-8 text-[#19363C]">
            Turn your book into an asset
          </h1>
          <p className="text-xl md:text-2xl text-[#19363C]/80 max-w-3xl mx-auto leading-relaxed">
            Transform your published books into ongoing revenue streams that connect you directly with readers
          </p>
        </div>

        {/* Step 1: Create Account & Link Stripe */}
        <div className="mb-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#FFD166] rounded-full flex items-center justify-center text-[#19363C] font-bold text-xl">
                  1
                </div>
                <h2 className="text-3xl md:text-4xl font-playfair font-medium text-[#19363C]">
                  Create your Quilltips account, and link to Stripe
                </h2>
              </div>
              <p className="text-lg text-[#19363C]/80 leading-relaxed">
                Sign up for Quilltips and connect your Stripe account to start receiving payments. Our secure integration ensures your earnings go directly to your bank account.
              </p>
              <div className="pt-4">
                <Link 
                  to="/stripe-help" 
                  className="text-[#19363C] underline hover:text-[#19363C]/80 transition-colors"
                >
                  Learn more about Stripe setup →
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <img 
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&h=400"
                  alt="Laptop showing account setup"
                  className="w-full rounded-2xl shadow-lg"
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
                <div className="w-12 h-12 bg-[#FFD166] rounded-full flex items-center justify-center text-[#19363C] font-bold text-xl">
                  2
                </div>
                <h2 className="text-3xl md:text-4xl font-playfair font-medium text-[#19363C]">
                  Generate and download your QR code
                </h2>
              </div>
              <p className="text-lg text-[#19363C]/80 leading-relaxed">
                Create a custom QR code for each of your books. Each code links to your personalized Quilltips Jar where readers can leave tips and messages.
              </p>
              <div className="pt-4">
                <Button 
                  onClick={handleCreateQRCode}
                  className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#19363C] font-medium"
                >
                  Create your QR code
                </Button>
              </div>
            </div>
            <div className="md:order-1 flex justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#19363C]/10">
                <div className="text-center mb-6">
                  <img
                    src="/lovable-uploads/10fa88e1-a2e8-4fab-88e1-653243b34b34.png"
                    alt="QR Code preview showing tip jar interface"
                    className="w-full max-w-[280px] mx-auto rounded-xl"
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
                <div className="w-12 h-12 bg-[#FFD166] rounded-full flex items-center justify-center text-[#19363C] font-bold text-xl">
                  3
                </div>
                <h2 className="text-3xl md:text-4xl font-playfair font-medium text-[#19363C]">
                  Put it on your book
                </h2>
              </div>
              <p className="text-lg text-[#19363C]/80 leading-relaxed">
                Work with your publisher or designer to print the QR code on your book cover or About the Author page. <strong>QR codes should be minimum 1 inch by 1 inch for optimal scanning.</strong>
              </p>
              <div className="bg-[#FFD166]/10 p-6 rounded-xl border border-[#FFD166]/20">
                <p className="text-[#19363C] font-medium">
                  💡 <strong>Pro tip:</strong> We recommend placing QR codes on the back cover or About the Author page for maximum visibility.
                </p>
              </div>
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
                <div className="w-12 h-12 bg-[#FFD166] rounded-full flex items-center justify-center text-[#19363C] font-bold text-xl">
                  4
                </div>
                <h2 className="text-3xl md:text-4xl font-playfair font-medium text-[#19363C]">
                  Receive tips and messages, build your email list, and link readers to your website and socials
                </h2>
              </div>
              <p className="text-lg text-[#19363C]/80 leading-relaxed">
                Readers scan your QR code to leave tips and personal messages. Use your Quilltips profile to link to your website and social media, growing your audience with every interaction.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#FFD166] rounded-full"></div>
                  <span className="text-[#19363C]">Direct tips from readers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#FFD166] rounded-full"></div>
                  <span className="text-[#19363C]">Personal messages and feedback</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#FFD166] rounded-full"></div>
                  <span className="text-[#19363C]">Email list growth</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#FFD166] rounded-full"></div>
                  <span className="text-[#19363C]">Social media and website traffic</span>
                </div>
              </div>
            </div>
            <div className="md:order-1 flex justify-center">
              <div className="w-full max-w-md">
                <img 
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&h=400"
                  alt="Dashboard showing tips and messages from readers"
                  className="w-full rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-20">
          <div className="bg-[#19363C] rounded-3xl p-12 md:p-16">
            <h3 className="text-3xl md:text-4xl font-playfair font-medium text-white mb-6">
              Ready to turn your book into an asset?
            </h3>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of authors who are already earning tips and building stronger connections with their readers.
            </p>
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
        <div className="text-center mt-20">
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
