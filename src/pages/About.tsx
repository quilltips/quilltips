import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Meta } from "@/components/Meta"; // 👈 Add this import

const About = () => {
  return <>
    <Meta title="About Quilltips – Built to Support Authors" description="Quilltips connects authors and readers by establishing a hub for their books that readers can access through QR codes." url="https://quilltips.co/about" />

    <main className="container mx-auto px-4 py-24 flex-grow">
      <div className="max-w-2xl mx-auto prose prose-lg" style={{
        maxWidth: '42rem'
      }}>

        <h1 className="text-center text-5xl font-bold mb-10 text-[#19363C]">About Quilltips</h1>
    
        <OptimizedImage src="/lovable-uploads/QT_about_image.webp" alt="Quilltips book landscape" className="w-full max-w-md rounded-xl mx-auto" priority={true} sizes="(max-width: 768px) 100vw, 600px" objectFit="cover" />


        <section className="mb-12 mt-20">
          <h2 className="text-2xl font-semibold mb-8 pb-4">Bringing authors and readers together</h2>
          <p>Quilltips was created to deepen connections between authors and readers. Despite the huge value and enjoyment that books provide, the author and reader often sit many layers apart. Our goal is to create a seamless way for readers to dive deeper into the books they love and to connect with and support the authors who write them. </p>
          <p>The idea that drove Quilltips to launch was to take something very simple - a QR code on the back of a book - and to use that to enrich the reader experience and to help authors grow their platform.  </p>

          <p>
            The upshot of putting powerful QR codes on physical books with the Quilltips platform behind it is that those books are now a live window between the reader and author. Authors can also learn more about the when, where, and why of their fanbase. 
          </p>
       
        
        </section>

       
      
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 pb-4">The Hidden Reality of Used Book Sales</h2>
          <p>
            The used book market is huge and growing thanks to convenient e-commerce distribution from the likes of Amazon. With a more accessible price point and environmental sustainability benefits, the used book market is amazing, except for the fact that only the platforms and sellers make money on these transactions. 
          </p>
          <p>
          Quilltips wants to give readers the power to voice their appreciation and connect directly with the authors of their favorite titles, while improving author economics in a completely voluntary way.
          </p>
        </section>

       
          
          
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">For Publishers</h2>
          <p>If you represent a publisher and would like to speak with someone from Quilltips, we'd love to hear from you. Please submit a request through the <Link to="/contact" className="text-[#19363C] hover:underline">Contact page</Link> or e-mail us directly at hello@quilltips.co.</p>
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
    </>;
};
export default About;