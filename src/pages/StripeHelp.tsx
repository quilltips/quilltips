
import { Layout } from "@/components/Layout";

const StripeHelp = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-playfair font-medium mb-8">
          Get set up with Stripe to receive payments through Quilltips
        </h1>
        
        <div className="space-y-6 text-gray-600">
        <section className="space-y-4">
            <h2 className="text-2xl font-playfair text-[#19363C]">*IMPORTANT*</h2>
            <p>
              Stripe is required by law to verify user identity. Please make sure to fill out all identify verification requirements  during Stripe onboarding to ensure proper account setup. If this is missed the first time, no biggie. You will see a prompt in your author dashboard to complete Stripe setup which will bring you back into their onboarding. 
            </p>
            <img src="/lovable-uploads/Stripe_onboarding_example.png" alt="Stripe onboarding example" />

          </section>
          <section className="space-y-4">
            <h2 className="text-2xl font-playfair text-[#19363C]">What to expect during Stripe Connect setup</h2>
            <p>
              To receive payments through Quilltips, you'll need to connect a Stripe account. Here's what you
              can expect during the setup process:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You'll be redirected to Stripe's secure platform</li>
              <li>You'll need to provide basic information about yourself</li>
              <li>You'll need to connect a bank account to receive payments</li>
              <li>The entire process typically takes 5-10 minutes</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-playfair text-[#19363C]">Required Information</h2>
            <p>Please have the following information ready:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Legal name</li>
              <li>Address and phone number</li>
              <li>Banking details for receiving payments</li>
              <li>Tax identification number (SSN)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-playfair text-[#19363C]">Security & Privacy</h2>
            <p>
              Stripe is a trusted payment processor used by millions of businesses worldwide. All sensitive
              information is handled directly by Stripe's secure platform, and Quilltips never has access
              to your banking details.
            </p>
          </section>

          <section className="mt-8 p-6 bg-[#19363C]/5 rounded-lg">
            <h2 className="text-xl font-playfair text-[#19363C] mb-4">Need Help?</h2>
            <p>
              If you have any questions about the Stripe setup process or encounter any issues,
              please don't hesitate to contact our support team. We're here to help ensure you
              can start receiving tips from your readers as quickly as possible.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default StripeHelp;
