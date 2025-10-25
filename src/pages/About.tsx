import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Meta } from "@/components/Meta"; // 👈 Add this import

const About = () => {
  return <>
    <Meta title="About Quilltips – Built to Support Authors" description="Quilltips helps authors earn more by connecting them directly with readers who want to show appreciation with a tip." url="https://quilltips.co/about" />

    <main className="container mx-auto px-4 py-24 flex-grow">
      <div className="max-w-2xl mx-auto prose prose-lg" style={{
        maxWidth: '42rem'
      }}>

        <h1 className="text-center text-5xl font-bold mb-10 text-[#19363C]">About Quilltips</h1>
    
        <OptimizedImage src="/lovable-uploads/QT_about_image.webp" alt="Quilltips book landscape" className="w-full max-w-md rounded-xl mx-auto" priority={true} sizes="(max-width: 768px) 100vw, 600px" objectFit="cover" />


        <section className="mb-12 mt-20">
          <h2 className="text-2xl font-semibold mb-4">A way to say "thanks" to all the great authors out there</h2>
          <p>Quilltips was founded to give readers a way to say thanks to the authors of books they love and to help bring those author-reader connections to life by allowing readers to easily send tips and message to authors. With royalties on new books hovering around 10% for published authors, and royalties on used books and library copies 0%, authors receive only a minute share of the value they create with their stories despite their books circulating for decades after the first sale.</p>
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
            The upshot of putting powerful QR codes on physical books and adding a platform behind it is that those books are now a live window between the reader and author and a tool for readers to voice support and appreciation. They can also give authors a view into the when, where, and why of their reader base. Authors can use Quilltips QR codes to convert their offline book into a digital asset. 
          </p>
          <br></br>
          <p>
            With Quilltips, Authors can create Quilltips Jars for each of their books, allowing them to receive tips and messages from their readers, respond directly to those tips, direct readers to their author website and socials, and build their e-mail list. 
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