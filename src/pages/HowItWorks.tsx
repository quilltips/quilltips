
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

    <main className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-playfair font-medium text-center mb-12">How Quilltips Works</h1>
      
      <div className="space-y-10">
        <div className="space-y-6">
          <p className="text-lg text-center">
            Quilltips connects readers directly with authors through QR codes printed on books. It's simple, seamless, and meaningful:
          </p>
        </div>
        
        {/* Moved infographic here and shrunk by 40% */}
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/how-quilltips-works.webp" 
            alt="How Quilltips Works" 
            className="mx-auto max-w-full h-auto rounded-sm"
            style={{ maxWidth: '60%' }}
          />
        </div>
        
        {/* Improved layout for bullet points - using more horizontal width */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl font-playfair font-medium">For Authors</h2>
              <ul className="list-disc list-inside space-y-4 pl-2">
                <li className="text-lg">
                    <span className="font-medium">Join Quilltips and link with Stripe</span>
                    <p className="text-base ml-6 mt-1">
                      Create your quilltips account and go through Stripe onboarding. 
                      <Link to="/stripe-help" className="ml-1 text-[#19363C] underline hover:text-[#19363C]/80">
                        Learn more about Stripe setup.
                      </Link>
                    </p>
                  </li>
                <li className="text-lg">
                  <span className="font-medium">Create your Quilltips Jar </span> 
                  <p className="text-base ml-6 mt-1">Generate and download a unique Quilltips QR code for your book.</p>
                </li>
                <li className="text-lg">
                  <span className="font-medium">Put the QR code on your book</span>
                  <p className="text-base ml-6 mt-1">Work with your publisher or designer to print the QR code on the cover or inside the book. We recommend the back cover or on the About the Author page.</p>
                </li>
                <li className="text-lg">
                  <span className="font-medium">Reader scans it and sends a tip and message</span>
                  <p className="text-base ml-6 mt-1">Readers can easily support you by scanning the QR code and leaving you a tip and message.</p>
                </li>
                <li className="text-lg">
                  <span className="font-medium">Engage with your readers</span>
                  <p className="text-base ml-6 mt-1">Respond with likes or comments directly to your readers. Direct readers to your website and socials. Build your email list.</p>
                </li>
              </ul>
            </div>
          </div>
          
          {/* QR Code now takes up less space */}
          <div className="rounded-xl overflow-hidden flex justify-center items-center p-6">
            <StyledQRCode 
              value="https://quilltips.com/example" 
              size={180} 
              className="mx-auto"
            />
          </div>
        </div>

        <div className="mt-12 flex justify-center">
        <Button 
          onClick={handleCreateQRCode}
          className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] py-4 px-8 rounded-full font-medium text-lg"
        >
          Create a QR code
        </Button>
      </div>
        
        <div className="space-y-6 pt-10 pb-8">
          <h2 className="text-2xl md:text-4xl font-playfair font-medium text-center mb-12">How do QR codes work?</h2>
          
          <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Left: Image */}
              <div className="flex justify-center">
              <img 
                src={backCoverExample}
                alt="Back cover QR code example"
                className="max-w-full w-[300px] rounded-lg border border-gray-200 shadow-sm"
              />
            </div>

            {/* Right: Text Content */}
            <div className="space-y-4">
              <p className="text-lg">
                A QR code is like a barcode that readers can scan to open your virtual Quilltips Jar. Any author can create a QR code for a book using Quilltips. After you purchase the QR code, we generate a virtual Quilltips Jar associated with the QR code where readers can leave a tip and a message about the book. 
              </p>

              <p className="text-lg">
                Work with the publisher or designer to get the QR code printed on the book. We recommend printing the QR code directly on the cover or on the About the Author page. <strong>QR codes should be a minimum of 1 inch by 1 inch, which translates to 300x300 pixels at standard print resolution (300 PPI).</strong>
              </p>

              <p className="text-lg">
                You'll be able to access and download valuable reader information across all your Quilltips Jars.
              </p>
            </div>

          
          </div>

        </div>
      </div>
      
      <div className="mt-14 flex justify-center">
        <Button 
          onClick={handleCreateQRCode}
          className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] py-8 px-11 rounded-full font-medium text-2xl"
        >
          Create a QR code
        </Button>
      </div>
    </main>
    </>
  );
};

export default HowItWorks;
