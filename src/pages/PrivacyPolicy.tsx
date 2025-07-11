import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Meta } from "@/components/Meta"; 


const PrivacyPolicy = () => {
  return (
    <>
    <Meta
      title="Quilltips - Privacy Policy"
      description="Your privacy is important to us. Learn how Quilltips handles your data and protects your information."
      url="https://quilltips.co/privacy"
    />

    <div className="min-h-screen flex flex-col">
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <div className="prose prose-slate max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8">Privacy Policy</h1>
          
          <section className="mb-8">
            <p className="mb-4">Effective date: April 15, 2025</p>
            <p>Quilltips LLC ("we," "our," or "us") provides a platform that allows authors to receive tips and messages from readers using QR codes placed in books. This privacy policy explains how we collect, use, and protect your personal information when you use our services.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. What Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account information:</strong> When authors sign up, we collect their name, email address, and other details needed to create a profile.</li>
              <li><strong>Payment information:</strong> We use Stripe Connect to handle payouts. We do not store full bank or card details — all payment processing is handled by Stripe.</li>
              <li><strong>Reader interactions:</strong> When a reader sends a tip or message, we collect the content of the message, the tip amount, and the time it was sent. If provided, we also collect the reader's email address.</li>
              <li><strong>User-generated content:</strong> This includes book titles, cover images, ISBN numbers, profile pictures, bios, and any other content authors choose to upload.</li>
              <li><strong>Usage data:</strong> We may collect basic analytics (e.g. page views, clicks) to improve the platform.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Deliver core Quilltips functionality (e.g. showing tips, sending email notifications)</li>
              <li>Process payments through Stripe</li>
              <li>Share select reader data with the author they tipped, to enable direct engagement and attribution</li>
              <li>Notify authors and readers regarding tips, messages, and likes.</li>
              <li>Improve the user experience and troubleshoot issues</li>
              <li>Send occasional service-related messages (e.g. onboarding reminders or updates)</li>
            </ul>
            <p className="mt-4">We do not sell your personal data to third parties.</p>
            <p className="mt-4">Your data may be stored and processed in the United States or other locations where our infrastructure providers operate.</p>

          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Protect Your Information</h2>
            <p>We use secure cloud infrastructure (including Supabase and Stripe) to store and manage your data. Access is limited to authorized users and is protected by authentication and encryption where appropriate.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
            <p>We use trusted third-party providers to power core parts of the app:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Stripe – for payment processing</li>
              <li>Supabase – for data storage and user authentication</li>
              <li>Resend – for e-mail notifications</li>
              <li>Lovable – for engineering improvements</li>
            </ul>
            <p className="mt-4">These services have their own privacy policies, which govern their handling of data.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Email Notifications</h2>
            <p>We send transactional emails to authors and readers when tips are sent, comments are posted, or onboarding steps need attention.</p>
            <p>Resend is used solely for transactional messaging and does not access or store user data beyond what is required to send the message.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention and Deletion</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Authors can delete their accounts by contacting us at hello@quilltips.co</li>
              <li>Tip and comment data may be retained as part of the author's profile and analytics history, unless deletion is requested</li>
              <li>We retain minimal logs for fraud prevention and security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p>Depending on your location, you may have rights under laws like GDPR or CCPA. These include the right to access, correct, or delete your personal data. Contact us to make a request.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
            <p>If you have questions or requests related to this privacy policy, please contact:</p>
            <p className="mt-4">
              hello@quilltips.co<br />
              Quilltips LLC<br />
              Stamford, Connecticut, USA
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p>We may update this policy as our platform evolves. We'll notify users via email or through the app if we make significant changes.</p>
          </section>
        </div>
      </main>
    </div>
    </>
  );
};

export default PrivacyPolicy;
