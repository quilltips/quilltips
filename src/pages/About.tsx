
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24 flex-grow">
        <div className="max-w-3xl mx-auto prose">
          <h1 className="text-4xl font-bold mb-8">About Quilltips</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Supporting Authors A Worthwhile Cause</h2>
            <p>
              Authors are the architects of our literary world, crafting stories that inspire, educate, and transform lives. 
              However, in today's digital age and second-hand book market, many authors face increasing challenges in 
              receiving fair compensation for their work. Quilltips was created to bridge this gap, providing a direct 
              channel between readers and authors.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">The Hidden Reality of Used Book Sales</h2>
            <p>
              While used bookstores and online marketplaces offer affordable access to literature, authors receive no 
              royalties from these sales. This means that despite their books continuing to circulate and impact readers, 
              authors don't receive any financial recognition for their ongoing influence. Quilltips provides a solution 
              by enabling readers to directly support authors whose used books they've enjoyed.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Connecting Authors with Their Readers</h2>
            <p>
              Beyond financial support, Quilltips was designed to strengthen the bond between authors and their readers. Through our 
              platform, readers can share their appreciation, feedback, and personal stories about how a book has impacted them. This 
              direct connection creates a more meaningful and sustainable literary ecosystem where authors can better understand 
              and engage with their audience.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">How does it work?</h2>
            <p className="font-medium">Authors:</p>
            <ol className="list-decimal pl-5 mb-4">
              <li>Create a Quilltips account.</li>
              <li>Purchase a Quilltip jar, accessible by QR code.</li>
              <li>Print the code on their next book.</li>
            </ol>
            <p>Readers scan the QR code to open the book's Quilltip jar, where they can leave a tip and message.</p>
            
            <p className="mt-4">
              Publishers can also use Quilltips to get insights into the authors they work with and their readers. Check out the For 
              publishers section for more details.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">For Publishers</h2>
            <p>Publisher accounts are meant for publishers who want to have more data on their readers.</p>
            
            <p className="mt-4">With a publisher account you can:</p>
            <ul className="list-disc pl-5">
              <li>Purchase QR codes for your authors</li>
              <li>Support author payments without sacrificing your margins</li>
            </ul>
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
    </div>
  );
};

export default About;
