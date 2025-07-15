
import { Meta } from "@/components/Meta"; 

const Pricing = () => {
  return (
    <>
    <Meta
      title="Quilltips Pricing – Always Free for Readers"
      description="Quilltips is free for readers. Authors pay a small transaction fee to collect tips through our Stripe-powered system."
      url="https://quilltips.co/pricing"
    />

    <div className="flex-grow">
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-semibold text-center mb-12">Simple, transparent pricing. Free signup.</h1>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Create Your Quilltips Jar</h2>
              <p className="text-3xl font-bold text-primary mb-4">$35</p>
              <p className=" mb-2">One-time fee includes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Custom QR code generation</li>
                <li>Author profile setup</li>
                <li>Unlimited tip collection</li>
                <li>Analytics dashboard</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Transaction Fees</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-medium">Quilltips Fee</p>
                  <p className="">5% per transaction</p>
                </div>
                <div>
                  <p className="text-lg font-medium">Payment Processing</p>
                  <p className="">Stripe fee: 2.9% + $0.30 per transaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default Pricing;
