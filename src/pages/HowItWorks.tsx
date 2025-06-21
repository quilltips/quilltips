
import { Link } from "react-router-dom";
import { StyledQRCode } from "@/components/qr/StyledQRCode";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import backCoverExample from "@/assets/back_cover_example.png";
import { Meta } from "@/components/Meta"; 

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
      title="How Quilltips Works – Scan, Tip, Support"
      description="Quilltips lets authors print QR codes in their books so readers can scan and send tips with a message in seconds."
      url="https://quilltips.co/how-it-works"
    />

    <main className="w-full">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <h1 className="text-4xl md:text-5xl font-playfair font-medium mb-8 text-[#19363C]">
          How Quilltips Works
        </h1>
        <p className="text-xl max-w-3xl mx-auto text-[#19363C]/80 leading-relaxed mb-12">
          Quilltips connects readers directly with authors through QR codes printed on books. It's simple, seamless, and meaningful.
        </p>
      </div>

      {/* Infographic - moved to top and made smaller */}
      <div className="w-full bg-gray-50/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <img 
            src="/lovable-uploads/how-quilltips-works.webp" 
            alt="How Quilltips Works" 
            className="mx-auto max-w-2xl w-full h-auto rounded-lg"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        
        {/* For Authors Section */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl font-playfair font-medium text-[#19363C]">For Authors</h2>
              <div className="space-y-8">
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-[#19363C]">1. Join Quilltips and link with Stripe</h3>
                  <p className="text-lg text-[#19363C]/80 leading-relaxed">
                    Create your quilltips account and go through Stripe onboarding. 
                    <Link to="/stripe-help" className="ml-1 text-[#19363C] underline hover:text-[#19363C]/80">
                      Learn more about Stripe setup.
                    </Link>
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-[#19363C]">2. Create your Quilltips Jar</h3>
                  <p className="text-lg text-[#19363C]/80 leading-relaxed">
                    Generate and download a unique Quilltips QR code for your book.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-[#19363C]">3. Put the QR code on your book</h3>
                  <p className="text-lg text-[#19363C]/80 leading-relaxed">
                    Work with your publisher or designer to print the QR code on the cover or inside the book. We recommend the back cover or on the About the Author page.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-[#19363C]">4. Reader scans and sends a tip</h3>
                  <p className="text-lg text-[#19363C]/80 leading-relaxed">
                    Readers can easily support you by scanning the QR code and leaving you a tip and message.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-[#19363C]">5. Engage with your readers</h3>
                  <p className="text-lg text-[#19363C]/80 leading-relaxed">
                    Respond with likes or comments directly to your readers. Direct readers to your website and socials. Build your email list.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center items-center">
              <div className="bg-white rounded-2xl p-8 border border-[#19363C]/10">
                <StyledQRCode 
                  value="https://quilltips.com/example" 
                  size={200} 
                  className="mx-auto"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <Button 
              onClick={handleCreateQRCode}
              className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#19363C] py-4 px-8 rounded-full font-medium text-lg"
            >
              Create a QR code
            </Button>
          </div>
        </div>

        {/* QR Code Details Section */}
        <div className="space-y-16">
          <div className="text-center">
            <h2 className="text-3xl font-playfair font-medium text-[#19363C] mb-16">
              How do QR codes work?
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img 
                src={backCoverExample}
                alt="Back cover QR code example"
                className="max-w-sm w-full rounded-xl border border-gray-200"
              />
            </div>

            <div className="space-y-8">
              <p className="text-lg text-[#19363C]/80 leading-relaxed">
                A QR code is like a barcode that readers can scan to open your virtual Quilltips Jar. Any author can create a QR code for a book using Quilltips.
              </p>

              <p className="text-lg text-[#19363C]/80 leading-relaxed">
                After you purchase the QR code, we generate a virtual Quilltips Jar associated with the QR code where readers can leave a tip and a message about the book.
              </p>

              <div className="bg-[#FFD166]/10 border border-[#FFD166]/30 rounded-xl p-6">
                <p className="text-lg text-[#19363C] font-medium">
                  <strong>Important:</strong> QR codes should be a minimum of 1 inch by 1 inch, which translates to 300x300 pixels at standard print resolution (300 PPI).
                </p>
              </div>

              <p className="text-lg text-[#19363C]/80 leading-relaxed">
                You'll be able to access and download valuable reader information across all your Quilltips Jars from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="w-full bg-[#19363C] py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-playfair font-medium text-white mb-8">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join thousands of authors who are already connecting with their readers through Quilltips.
          </p>
          <Button 
            onClick={handleCreateQRCode}
            className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#19363C] py-6 px-12 rounded-full font-medium text-xl"
          >
            Create your first QR code
          </Button>
        </div>
      </div>
    </main>
    </>
  );
};

export default HowItWorks;
