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
import { useState } from "react";
import { FeaturedAuthorsCarousel } from "@/components/FeaturedAuthorsCarousel";
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
        <div className="flex flex-col items-center justify-center text-center py-2 lg:py-12">
          <div className="space-y-6 lg:space-y-8 max-w-4xl">
            <h1 className="font-playfair font-medium text-5xl sm:text-6xl lg:text-7xl text-[#333333] leading-tight">
              A homepage for your book
            </h1>
           
            <p className="text-xl sm:text-2xl text-[#333333]/70 font-medium">Share bonus content, get tips & messages, connect with readers—all via your Quilltips QR code.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6 lg:pt-8">
            <RouterLink to="/author/register">
              <Button size="lg" className="min-w-[180px] bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#333333] font-medium text-lg px-8 py-4 h-auto rounded-full transition-all duration-200 plausible-event-name=create-account-hero" data-plausible-event="create-account-hero">
                Sign up
              </Button>
            </RouterLink>
            <RouterLink to="/how-it-works">
              <Button variant="outline" size="lg" className="border-[#333333] text-[#333333] hover:shadow-lg font-medium text-lg px-8 py-4 h-auto rounded-full transition-all duration-200 hover:bg-transparent plausible-event-name=how-it-works">
                See how it works
              </Button>
            </RouterLink>
          </div>

          {/* Social Proof Section - Compact */}
          <div className="w-full pt-6 lg:pt-8">
            <div className="w-full bg-transparent py-2">
              <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <FeaturedAuthorsCarousel compact={true} showFirstNameOnly={true} />
              </div>
            </div>
          </div>

          {/* Problem Section with Video */}
          <div className="w-full pt-6 lg:pt-8">
            <div className="mx-auto w-full max-w-6xl">
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
                {/* Left: Problem Copy */}
                <div className="space-y-4 text-left">
                  <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-[#333333] leading-[1.2]">Many <span className="text-[#FFD166] bg-[#19363C] px-3 py-0.5 rounded inline-block align-middle">authors</span> struggle to connect with their readers</h2>
                  <p className="font-lato text-lg sm:text-lg text-[#333333] leading-relaxed font-bold">
                    Quilltips is on a mission to change that.
                  </p>
                  <p className="font-lato text-base sm:text-lg text-[#333333] leading-relaxed">
                    With Quilltips, authors can create a hub for their book, share thank-you videos, upload character art, and receive tips and messages directly from readers. Readers can access that book page through QR codes printed right on the book's back cover.
                  </p>
                </div>
                {/* Right: Product Demo Video */}
                <div className="flex justify-center">
                  <div className="relative w-[220px] lg:w-[320px]">
                    <VideoPlayer src="/lovable-uploads/quilltips-demo.mp4" posterTime={2} alt="Quilltips product demo video showing QR code scan and reader tipping and messaging interaction" autoPlay={false} muted={true} loop={true} aspectRatio="mobile" objectFit="cover" className="w-full plausible-event-name=watch-demo" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="mx-auto w-full max-w-6xl mt-24 px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-medium text-center text-[#19363C]">
          We help authors engage with their biggest fans
        </h2>
      </div>

      {/* Value Props */}
      <div className="mx-auto w-full max-w-6xl mt-12 mb-36 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{
            icon: <BookOpen className="w-8 h-8 text-[#19363C]" />,
            title: "Enhance your reader's experience",
            text: "Thank your readers with a video, share extra book content, and write them back when they message you."
          }, {
            icon: <DollarSign className="w-8 h-8 text-[#19363C]" />,
            title: "Earn more from your work",
            text: "Give readers an easy way to support you directly, even with used books and library copies."
          }, {
            icon: <LinkIcon className="w-8 h-8 text-[#19363C]" />,
            title: "Grow your platform",
            text: "Link to your website and socials and add reader signup forms - all from one centralized place."
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

      {/* Overview Section - Video */}
      <div className="mx-auto w-full max-w-6xl mt-16 px-4">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left: Image */}
          <div className="flex justify-center order-2 md:order-1">
            <div className="rounded-2xl bg-transparent p-2 cursor-pointer transition-all duration-200 hover:shadow-lg" onClick={() => openImageModal(carouselImages[0].src, carouselImages[0].alt, carouselImages[0].title)}>
              <img src={carouselImages[0].src} alt={carouselImages[0].alt} className="w-full max-w-sm rounded-xl object-contain" />
            </div>
          </div>
          {/* Right: Copy */}
          <div className="space-y-4 order-1 md:order-2 text-left md:text-right">
            <h2 className="text-3xl sm:text-4xl font-playfair font-medium text-[#333333]">
             Upload a thank-you video
            </h2>
           
            <p className="text-base sm:text-lg text-[#333333]">
              It's like a hidden easter egg for your readers once they've finished your book
            </p>
          </div>
        </div>
      </div>

      {/* Tipping Section */}
      <div className="mx-auto w-full max-w-6xl mt-12 px-4">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left: Copy */}
          <div className="space-y-4 text-left">
            <h2 className="text-3xl sm:text-4xl font-playfair font-medium text-[#333333]">
              Connect with Stripe and allow readers to send tips
            </h2>
            <p className="text-lg sm:text-xl text-[#333333] font-medium">
              They'll appreciate the chance to support your work
            </p>
          </div>
          {/* Right: Image */}
          <div className="flex justify-center">
            <div className="rounded-2xl bg-transparent p-2 cursor-pointer transition-all duration-200 hover:shadow-lg" onClick={() => openImageModal(carouselImages[1].src, carouselImages[1].alt, carouselImages[1].title)}>
              <img src={carouselImages[1].src} alt={carouselImages[1].alt} className="w-full max-w-sm rounded-xl object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Messaging Section */}
      <div className="mx-auto w-full max-w-6xl mt-12 px-4">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left: Image */}
          <div className="flex justify-center order-2 md:order-1">
            <div className="rounded-2xl bg-transparent p-2 cursor-pointer transition-all duration-200 hover:shadow-lg" onClick={() => openImageModal(carouselImages[2].src, carouselImages[2].alt, carouselImages[2].title)}>
              <img src={carouselImages[2].src} alt={carouselImages[2].alt} className="w-full max-w-sm rounded-xl object-contain" />
            </div>
          </div>
          {/* Right: Copy */}
          <div className="space-y-4 order-1 md:order-2 text-left md:text-right">
            <h2 className="text-3xl sm:text-4xl font-playfair font-medium text-[#333333]">
              Hear directly from readers, like and reply to their messages
            </h2>
            <p className="text-lg sm:text-xl text-[#333333] font-medium">
              It's like signing autographs from your couch
            </p>
          </div>
        </div>
      </div>

      {/* Bonus Content Section */}
      <div className="mx-auto w-full max-w-6xl mt-12 px-4">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left: Copy */}
          <div className="space-y-4 text-left">
            <h2 className="text-3xl sm:text-4xl font-playfair font-medium text-[#333333]">
              Add art and book recommendations to delight your fans even more
            </h2>
          </div>
          {/* Right: Image */}
          <div className="flex justify-center">
            <div className="rounded-2xl bg-transparent p-2 cursor-pointer transition-all duration-200 hover:shadow-lg" onClick={() => openImageModal(carouselImages[3].src, carouselImages[3].alt, carouselImages[3].title)}>
              <img src={carouselImages[3].src} alt={carouselImages[3].alt} className="w-full max-w-sm rounded-xl object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Author Profile Promo with Prefill Form (horizontal) */}
 <div className="mx-auto w-full max-w-6xl mt-12 px-4">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left: Inline prefill form */}
          <Card className="bg-transparent rounded-2xl p-6 md:p-8 order-1 md:order-1">
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
          {/* Right: Copy */}
          <div className="order-2 md:order-2 text-left md:text-right">
            <h2 className="text-2xl md:text-3xl font-playfair font-medium mb-3 text-[#333333]">
              Link back to your website and socials
            </h2>
            
            <p className="text-base md:text-lg text-[#333333]">
              Build your email list with easy reader signup forms
            </p>
          </div>
        </div>
      </div>

      {/* For Readers (horizontal) */}
      <div className="mx-auto w-full max-w-6xl mt-16 px-4">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Text left on desktop */}
          <div className="order-1 md:order-1">
            <h2 className="text-3xl sm:text-4xl font-playfair font-medium mb-4 text-[#19363C]">Readers simply scan and submit</h2>
            <p className="text-base sm:text-lg text-[#19363C]/80 leading-relaxed">
              Readers can use Quilltips quickly and easily -- just scan the QR code on your book or search for it on Quilltips! No accounts or sign-up required.
            </p>
          </div>
          {/* Image right on desktop */}
          <div className="order-2 md:order-2 flex justify-center md:justify-end">
            <img src="/lovable-uploads/reader_quilltips.webp" alt="Reader scanning a QR code to tip an author" className="w-full max-w-[240px] md:max-w-[280px] rounded-xl" />
          </div>
        </div>
      </div>



      {/* Pricing (Figma-style) */}
      <div className="mx-auto w-full max-w-6xl mt-20 px-4">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left: Empty spacer to maintain alternating pattern */}
          <div className="order-1 md:order-1"></div>
          {/* Right: Pricing text */}
          <div className="order-2 md:order-2 text-left md:text-right">
            <h2 className="text-2xl md:text-3xl font-playfair font-semibold text-[#19363C] mb-3">Does this cost money?</h2>
            <p className="text-base md:text-lg text-[#19363C]/90 leading-relaxed">Sign up and publish your author profile for free. Pay a one-time $35 price for each QR code you create. No hidden charges or subscriptions. No credit card required to get started. <RouterLink to="/pricing" className="text-[#19363C] underline hover:no-underline">Read more about pricing</RouterLink>.</p>
          </div>
        </div>
      </div>


      {/* Final Call to Action */}
      <div className="mx-auto w-full max-w-6xl mt-16 text-center px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-playfair font-medium text-[#333333]">Ready to get started?</h2>
          <p className="text-base sm:text-lg text-[#333333]/80">Create an account to connect with readers and collect tips!</p>
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