import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <div className="prose prose-slate max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold mb-8">Terms of Service</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>Welcome to Quilltips. By using our service, you agree to these terms. Please read them carefully.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Data Collection and Usage</h2>
            <p>We collect and process the following types of information:</p>
            <ul>
              <li>Account information (name, email, profile details)</li>
              <li>Author-provided content (book information, QR codes)</li>
              <li>Transaction data (tip amounts, likes, messages)</li>
              <li>Usage data (interactions, preferences)</li>
            </ul>
            <p>This information is used to:</p>
            <ul>
              <li>Facilitate tips and messages between readers and authors</li>
              <li>Improve our services</li>
              <li>Provide customer support</li>
              <li>Send important updates</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Payment Processing</h2>
            <p>Payment processing is handled securely through Stripe. <br></br></p>
            <ul>
              <li>We never store complete credit card information</li>
              <li>We maintain transaction records for legal and accounting purposes</li>
            </ul>
            <p>Authors receive tips, minus our processing fee (currently 5% per transaction) and Stripe's standard payment processing fees.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Author Obligations</h2>
            <p>Authors using Quilltips agree to:</p>
            <ul>
              <li>Provide accurate information about themselves and their work</li>
              <li>Only create QR codes for books they have authored</li>
              <li>Communicate appropriately with their readers</li>
              <li>Not misuse the platform for fraudulent purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Reader Guidelines</h2>
            <p>Readers using Quilltips agree to:</p>
            <ul>
              <li>Provide accurate payment information</li>
              <li>Not abuse the messaging system</li>
              <li>Respect authors' privacy and intellectual property</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Content Guidelines</h2>
            <p>All content posted on Quilltips must:</p>
            <ul>
              <li>Be appropriate and professional</li>
              <li>Not violate any laws or third-party rights</li>
              <li>Not contain harmful or malicious material</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Privacy and Security</h2>
            <p>We are committed to protecting your privacy and security:</p>
            <ul>
              <li>Data is encrypted in transit and at rest</li>
              <li>Access to personal information is strictly controlled</li>
              <li>We never sell your personal information to third parties</li>
              <li>You can request account deletion at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Eligibility</h2>
            <p>You must be at least 13 years old (or the minimum legal age in your country) to use Quilltips.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Account termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms or pose a risk to the community or service integrity.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitations of liability</h2>
            <p>Quilltips is provided “as is” without warranties of any kind. We are not liable for any damages resulting from use of the platform, including lost earnings or data.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>We may update these terms from time to time. We will notify users of any significant changes via email or through the platform.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p>If you have any questions about these terms, please contact us through our contact page.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
