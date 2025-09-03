import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, MessageSquare, DollarSign, Link as LinkIcon, BookOpen, Users, ChevronRight } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageModal } from "@/components/ui/image-modal";
import { VideoPlayer } from "@/components/ui/video-player";
import { Meta } from "@/components/Meta";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
const Index = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [expandedImage, setExpandedImage] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const handleCreateQRCode = () => {
    if (!user) {
      navigate("/author/login");
      return;
    }
    navigate("/author/create-qr");
  };
  const openImageModal = (src: string, alt: string, title: string) => {
    setExpandedImage({
      src,
      alt,
      title
    });
  };
  const closeImageModal = () => {
    setExpandedImage(null);
  };
  const carouselImages = [{
    src: "/lovable-uploads/screenshots/about_author_qr.webp",
    alt: "About the author example",
    title: "About author"
  }, {
    src: "/lovable-uploads/screenshots/crumble_screenshot.webp",
    alt: "Reader tip jar view",
    title: "Reader Tip Jar"
  }, {
    src: "/lovable-uploads/screenshots/public_profile_screenshot.webp",
    alt: "Quilltips public profile example",
    title: "Author Dashboard"
  }, {
    src: "/lovable-uploads/screenshots/QT_dashboard.webp",
    alt: "Author dashboard view",
    title: "Author Dashboard"
  }];
  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  return <>
    <Meta title="Quilltips – Engage readers with QR codes on your books" description="Quilltips lets readers support authors by scanning a QR code on their book and sending a tip with a personal message." url="https://quilltips.co" image="https://quilltips.co/og-image.png" jsonLd={[{
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Quilltips",
      "url": "https://quilltips.co",
      "logo": "https://quilltips.co/logo_nav.png",
      "sameAs": ["https://twitter.com/quilltips", "https://www.instagram.com/quilltips", "https://www.linkedin.com/company/quilltips", "https://www.threads.net/@quilltips", "https://www.reddit.com/user/quilltips_books", "https://www.tiktok.com/@quilltips"]
    }, {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": "https://quilltips.co",
      "name": "Quilltips",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://quilltips.co/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }]} />
    <Helmet>
      <script>
        {`!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_h5wzcimw9952');rdt('track', 'PageVisit');`}
      </script>
    </Helmet>

    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
      {/* Hero Section */}
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 py-8 lg:py-2">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-6 lg:space-y-10 max-w-xl">
            <div className="space-y-6 lg:space-y-8">
              <h1 className="font-playfair font-bold text-5xl sm:text-6xl lg:text-7xl text-[#333333] leading-tight">
                A better QR code for your books
              </h1>
             
              <p className="text-xl sm:text-2xl text-[#333333]/70 font-medium">Earn more from your work, connect with your biggest fans, and link back to your website and socials.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-2 lg:pt-4">
              <RouterLink to="/author/register">
                <Button size="lg" className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#333333] font-medium text-lg px-8 py-4 h-auto rounded-full transition-all duration-200 plausible-event-name=create-account-hero" data-plausible-event="create-account-hero">
                  Create my QR code
                </Button>
              </RouterLink>
              <RouterLink to="/how-it-works">
                <Button variant="outline" size="lg" className="border-[#333333] text-[#333333] hover:shadow-lg font-medium text-lg px-8 py-4 h-auto rounded-full transition-all duration-200 hover:bg-transparent plausible-event-name=how-it-works">
                  See how it works
                </Button>
              </RouterLink>
            </div>
          </div>

          {/* Right Visual - Product Demo Video */}
          <div className="flex-1 flex justify-center lg:justify-center max-w-sm lg:max-w-md">
            <div className="relative w-[220px] lg:w-[320px]">
              <VideoPlayer src="/lovable-uploads/quilltips-demo.mp4" posterTime={2} alt="Quilltips product demo video showing QR code scan and reader tipping and messaging interaction" autoPlay={false} muted={true} loop={true} aspectRatio="mobile" objectFit="cover" className="w-full plausible-event-name=watch-demo" />
            </div>
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="mx-auto w-full max-w-6xl mt-32 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
            icon: <DollarSign className="w-8 h-8 text-[#19363C]" />,
            title: "Earn More From Your Books",
            text: "Give readers an easy way to support you directly, even with used books and library copies."
          }, {
            icon: <MessageSquare className="w-8 h-8 text-[#19363C]" />,
            title: "Connect With Your Readers",
            text: "Receive messages from fans and build your email list with each tip your books generate."
          }, {
            icon: <LinkIcon className="w-8 h-8 text-[#19363C]" />,
            title: "Promote Your Platform",
            text: "Link to your website and socials - all from one centralized place."
          }].map(({
            icon,
            title,
            text
          }, idx) => <Card key={idx} className="bg-white/90 p-8 border border-[#19363C]/10 rounded-2xl">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-[#FFD166] rounded-full flex items-center justify-center">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold text-[#19363C]">{title}</h3>
                <p className="text-[#19363C]/80 leading-relaxed">{text}</p>
              </div>
            </Card>)}
        </div>
      </div>

      {/* What is Quilltips (Horizontal with carousel on right) */}
      <div className="mx-auto w-full max-w-6xl mt-16 lg:mt-28 px-4">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-[#333333] leading-[1.2]">Many <span className="text-[#FFD166] bg-[#19363C] px-3 py-0.5 rounded inline-block align-middle">authors</span> struggle to connect with their readers</h2>
            <p className="font-lato text-xl sm:text-xl text-[#333333] leading-relaxed font-bold">
              Quilltips is on a mission to change that.
            </p>
            <p className="font-lato text-lg sm:text-xl text-[#19363C]/80 leading-relaxed">
              With Quilltips QR codes and author profiles, your readers can send you tips and messages, you can build your email list, and link back to your website and socials. All in less than 5 minutes.
            </p>
       
          </div>
          {/* Right: Carousel */}
          <div className="relative">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {carouselImages.map((image, index) => <CarouselItem key={index}>
                    <div className="p-1">
                      <div className="rounded-2xl bg-transparent p-3 cursor-pointer transition-all duration-200 hover:shadow-none" onClick={() => openImageModal(image.src, image.alt, image.title)}>
                        <div className="w-full">
                          <img src={image.src} alt={image.alt} className="w-full h-[420px] lg:h-[460px] rounded-xl object-contain" />
                        </div>
                      </div>
                    </div>
                  </CarouselItem>)}
              </CarouselContent>
            </Carousel>
            {/* Dot indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {Array.from({
                length: count
              }).map((_, index) => <button key={index} className={`w-3 h-3 rounded-full transition-colors duration-200 plausible-event-name=carousel-images ${index + 1 === current ? 'bg-[#FFD166]' : 'bg-[#19363C]/20 hover:bg-[#19363C]/40'}`} onClick={() => api?.scrollTo(index)} aria-label={`Go to slide ${index + 1}`} />)}
            </div>
          </div>
        </div>
        {/* CTA below section */}
        <div className="flex justify-center mt-10">
          <RouterLink to="/author/register">
            <Button size="lg" className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#333333] font-medium px-10 py-4 h-auto rounded-full plausible-event-name=create-account-after-what">
              Create an account
            </Button>
          </RouterLink>
        </div>
      </div>

      

      {/* How It Works (condensed) */}
      <div className="mx-auto w-full max-w-5xl mt-28 px-4">
        <h2 className="text-4xl sm:text-5xl font-playfair font-medium text-center mb-12 text-[#19363C]">How Does It Work?</h2>

        {[{
          icon: <QrCode className="w-12 h-12 md:w-16 md:h-16 text-[#FFD166]" />,
          title: "Step 1. Create your Profile and Quilltips Jar",
          text: "Publish your author profile and create a virtual tip jar, accessible through a QR code. Download the code to print on the cover or inside the jacket of your next book. Link your bank account with Stripe.",
          reverse: false
        }, {
          icon: <Users className="w-12 h-12 md:w-16 md:h-16 text-[#FFD166]" />,
          title: "Step 2. Meet your readers",
          text: "Readers scan the QR code to open your virtual tip jar and leave tips and messages. From your profile, readers can find links to your website and social media accounts.",
          reverse: true
        }, {
          icon: <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-[#FFD166]" />,
          title: "Step 3. Build support",
          text: "Grow your e-mail list and understand your audience with Quilltips' Data dashboard. Add countdown clocks and reader signup forms to your profile to boost your next launch.",
          reverse: false
        }].map(({
          icon,
          title,
          text,
          reverse
        }, idx) => <div key={idx} className={`flex flex-col-reverse md:flex-row ${reverse ? "md:flex-row-reverse" : ""} items-center gap-8 mb-16`}>
            {/* Text */}
            <div className="text-center md:text-left max-w-lg space-y-4">
              <h3 className="font-semibold text-2xl text-[#19363C]">{title}</h3>
              <p className="text-[#19363C]/80 leading-relaxed">{text}</p>
            </div>

            {/* Icon */}
            <div className="flex justify-center md:justify-start">
              <div className="w-28 h-28 md:w-40 md:h-40 bg-[#19363C] rounded-full flex items-center justify-center">
               {icon}
              </div>
            </div>
          </div>)}

        <div className="flex justify-center mt-16">
          <RouterLink to="/how-it-works">
            <Button variant="outline" className="rounded-full px-10 border-[#19363C] text-[#19363C] hover:bg-transparent hover:shadow-lg plausible-event-name=how-it-works" data-plausible-event="how-it-works">
              Learn more
            </Button>
          </RouterLink>
        </div>
      </div>

     
      {/* For Readers (horizontal) */}
      <div className="mx-auto w-full max-w-6xl mt-24 px-4">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Image left on desktop */}
          <div className="order-1 md:order-1 flex justify-center md:justify-start">
            <img src="/lovable-uploads/reader_quilltips.webp" alt="Reader scanning a QR code to tip an author" className="w-full max-w-[260px] md:max-w-[300px] rounded-xl" />
          </div>
          {/* Text right on desktop */}
          <div className="order-2 md:order-2">
            <h2 className="text-4xl sm:text-5xl font-playfair font-medium mb-6 text-[#19363C]">Readers simply scan and submit</h2>
            <p className="text-lg sm:text-xl mb-8 text-[#19363C]/80 leading-relaxed">
              Readers can use Quilltips quickly and easily -- just scan the QR code on your book or search for it on Quilltips, add a message, and send a tip! No accounts or sign-up required.
            </p>
          </div>
        </div>
      </div>

 {/* Author Profile Promo with Prefill Form (horizontal) */}
 <div className="mx-auto w-full max-w-6xl mt-20 px-4">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <h2 className="text-3xl md:text-4xl font-playfair font-medium mb-4 text-[#19363C]">
              Dreading building your author website? 
            </h2>
            
            <p className="text-lg md:text-xl text-[#333333] mb-4">
              Use your Quilltips author profile instead.
            </p>
            <p className="text-lg md:text-xl text-[#333333]">
              Upload a bio & headshot, list your books, add reader signup forms, and link to your socials and e-commerce pages. The best part? It's completely free.
            </p>
          </div>

          {/* Right: Inline prefill form */}
          <Card className="bg-transparent rounded-2xl p-6 md:p-8">
            <form onSubmit={async e => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const formData = new FormData(form);
              const name = String(formData.get('prefill_name') || '');
              const bio = String(formData.get('prefill_bio') || '');
              const file = formData.get('prefill_avatar') as File | null || null;
              let avatarDataUrl: string | undefined = undefined;
              if (file && file.size > 0) {
                avatarDataUrl = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(String(reader.result));
                  reader.onerror = () => reject(new Error('Failed to read image'));
                  reader.readAsDataURL(file);
                });
              }
              const payload = {
                name,
                bio,
                avatarDataUrl
              };
              try {
                localStorage.setItem('qt_registration_prefill', JSON.stringify(payload));
              } catch (_) {}
              toast({
                title: "Info saved",
                description: "Continue to create account"
              });
              navigate('/author/register');
            }} className="flex flex-col gap-5 max-w-2xl">
              <div>
                <label htmlFor="prefill_name" className="block text-sm font-medium text-[#333333] mb-1">Name</label>
                <input id="prefill_name" name="prefill_name" className="w-full rounded-md bg-white text-[#19363C] px-3 py-2 border border-gray-300" />
              </div>

              <div>
                <label htmlFor="prefill_bio" className="block text-sm font-medium text-[#333333] mb-1">Bio</label>
                <textarea id="prefill_bio" name="prefill_bio" className="w-full rounded-md bg-white text-[#19363C] px-3 py-2 min-h-[90px] border border-gray-300"></textarea>
              </div>

              <div>
                <label htmlFor="prefill_avatar" className="block text-sm font-medium text-[#333333] mb-1">Headshot (optional)</label>
                <input id="prefill_avatar" name="prefill_avatar" type="file" accept="image/*" className="block w-full text-sm text-[#333333] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-white file:text-[#19363C] hover:file:bg-white/90" />
              </div>

              <div className="pt-1">
                <Button type="submit" className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#19363C] rounded-full px-6">
                  Continue to create account
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>


      {/* Pricing (Figma-style) */}
      <div className="mx-auto w-full max-w-5xl mt-32 px-4">
        <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-[#19363C] mb-4">Does this cost money?</h2>
        <p className="text-lg md:text-xl text-[#19363C]/90 leading-relaxed max-w-3xl">Sign up and publish your author profile for free. Pay a one-time $35 price for each QR code you create. No hidden charges or subscriptions. No credit card required to get started.</p>
      </div>

      

      {/* Final Call to Action */}
      <div className="mx-auto w-full max-w-6xl mt-20 text-center px-4 py-20">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl sm:text-5xl font-playfair font-medium text-[#333333]">Ready to get started?</h2>
          <p className="text-lg sm:text-xl text-[#333333]/80">Create an account to connect with readers and collect tips!</p>
        </div>
        <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
          <RouterLink to="/author/register">
            <Button size="lg" className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#19363C] font-medium transition-all duration-200 px-10 py-4 h-auto rounded-full plausible-event-name=create-account-bottom" data-plausible-event="create-account-bottom">
              Create my account
            </Button>
          </RouterLink>
         
        </div>
      </div>
    </div>

    {/* Image Modal */}
    {expandedImage && <ImageModal isOpen={!!expandedImage} onClose={closeImageModal} src={expandedImage.src} alt={expandedImage.alt} title={expandedImage.title} />}
    </>;
};
export default Index;