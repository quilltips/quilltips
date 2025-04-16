
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const About = () => {
  return <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24 flex-grow">
        <div className="max-w-3xl mx-auto prose">
            <h1 className="text-4xl font-bold mb-8 text-[#19363C]">About Quilltips</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">A way to say "thanks" to all the great authors out there</h2>
            <p>
            Quilltips was founded to give readers a way to say thanks to the authors of books they love and to help bring those author-reader connections to life by allowing readers to easiliy send tips and message to authors. With royalties on new books hovering around 10% for published authors, and royalties on used books and library copies 0%, authors receive only a minute share of the value they create with their stories despite their books circulating for decades after the first sale.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">The Hidden Reality of Used Book Sales</h2>
            <p>
            The used book market is huge and growing thanks to convenient e-commerce distribution from the likes of Amazon. With a more accessible price point and environmental sustainability benefits, the used book market is amazing, except for the fact that only the platforms and sellers make money on these transactions. <strong>Quilltips wants to give readers the power to voice their appreciation and connect directly with the authors of their favorite titles, while improving author economics in a completely voluntary way.</strong>
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Connecting Authors with Their Readers</h2>
            <p>
            The upshot of putting powerful QR codes on physical books and adding a platform behind it is that those books are now a live window between the reader and author and a tool for readers to voice support and appreciation. They can also give authors a view into the when, where, and why of their reader base. Authors can use Quilltips QR codes to convert their offline book into a long-lived digitally enabled asset. 
            </p>
            <br></br>
            <p>
            With Quilltips, Authors can create Quilltips Jars for each of their books, allowing them to receive tips and messages from their readers, respond directly to those tips, direct readers to their author website and socials, and build their e-mail list. 
            </p>
          
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">How does it work?</h2>
            <p className="font-medium">Authors:</p>
            <ul className="list-disc pl-5 mb-4">
              <li>Create a Quilltips account and link your bank account with Stripe.</li>
              <li>Purchase a Quilltips Jar, accessible through a downloadable QR code.</li>
              <li>Work with your publisher or designer to get the QR code on your next book - we recommend placing it somewhere on the book jacket or on the About the Author page and keeping it larger than 1 inch by 1 inch.</li>
              <li>Readers scan the QR code to open the book's Quilltips Jar, where they can leave a tip and message.</li>
              <li>Authors can comment on tips and send messages directly to their readers (if they choose to do so), and can use the data gleaned from these interactions. </li>
              <li>Quilltips collects a one-time fee of $35 for each Quilltips Jar created, and takes a 5% fee per transaction. Stripe  charges a separate fee to process payments.</li>
            </ul>
        
            <p></p>
            <p className="mt-4">
              Publishers can also use Quilltips to get insights into the authors they work with and their readers.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">For Publishers</h2>
            <p>If you represent a publisher and would like to speak with someone from Quilltips, we'd love to hear from you. Please submit a request through the Contact page or e-mail us directly at gabriel@quilltips.co.</p>
          </section>
          
          <section className="text-center my-16">
            <h2 className="text-4xl font-bold mb-6">Get Started</h2>
            <p className="mb-8 text-lg">Create an account to connect with readers and collect tips!</p>
            <Link to="/author/register">
              <Button className="bg-[#FFD166] text-[#2D3748] hover:bg-[#FFD166]/90 px-8 py-3 text-base font-medium rounded-full">
                Create an account
              </Button>
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>;
};
export default About;
