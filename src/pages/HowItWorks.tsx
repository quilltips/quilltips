
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { StyledQRCode } from "@/components/qr/StyledQRCode";

const HowItWorks = () => {
  return (
    <Layout>
      <main className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-playfair font-medium text-center mb-12">How Quilltips Works</h1>
        
        <div className="space-y-10">
          {/* Step-by-step process graphic */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
            <img 
              src="/lovable-uploads/e61940da-332b-465f-96ad-e81de947389e.png" 
              alt="Quilltips How It Works: 4 Step Process" 
              className="w-full h-auto"
            />
          </div>
          
          {/* Detailed explanation */}
          <div className="space-y-6">
            <p className="text-lg text-center">
              Quilltips connects readers directly with authors through QR codes printed on books. It's simple, seamless, and meaningful:
            </p>
          </div>
          
          {/* Detailed steps section */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-8 order-2 md:order-1">
              <div className="space-y-3">
                <h2 className="text-2xl font-playfair font-medium">For Authors</h2>
                <ol className="list-decimal list-inside space-y-4 pl-2">
                  <li className="text-lg">
                    <span className="font-medium">Create and download a QR code</span> 
                    <p className="text-base ml-6 mt-1">Generate a unique Quilltips QR code for your book.</p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Put it on your book</span>
                    <p className="text-base ml-6 mt-1">Work with your publisher to print the QR code on the cover or inside the book.</p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Reader scans it and sends a tip</span>
                    <p className="text-base ml-6 mt-1">Readers can easily support you by scanning the QR code.</p>
                  </li>
                  <li className="text-lg">
                    <span className="font-medium">Receive tips and connect with readers</span>
                    <p className="text-base ml-6 mt-1">Collect support and messages directly from your readers.</p>
                  </li>
                </ol>
              </div>
            </div>
            
            {/* QR code example */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden order-1 md:order-2 flex justify-center">
              <StyledQRCode 
                value="https://quilltips.com/example" 
                size={180} 
                className="mx-auto"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-12 flex justify-center">
          <Link 
            to="/author/create-qr" 
            className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#2D3748] py-4 px-8 rounded-full font-medium text-lg"
          >
            Create a QR code
          </Link>
        </div>
      </main>
    </Layout>
  );
};

export default HowItWorks;
