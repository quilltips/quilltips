import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24 flex-grow">
        <div className="max-w-3xl mx-auto prose">
          <h1 className="text-4xl font-bold mb-8">About Quilltips</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Supporting Authors: A Worthwhile Cause</h2>
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
              Beyond financial support, Quilltips was designed to strengthen the bond between authors and their readers. 
              Through our platform, readers can share their appreciation, feedback, and personal stories about how a book 
              has impacted them. This direct connection creates a more meaningful and sustainable literary ecosystem where 
              authors can better understand and engage with their audience.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;