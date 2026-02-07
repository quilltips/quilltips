import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, MessageSquare, DollarSign, Link as LinkIcon, BookOpen, Users, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
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
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FeaturedAuthorsCarousel } from "@/components/FeaturedAuthorsCarousel";
import backCoverExample from "@/assets/back_cover_example.png";
const FEATURED_AUTHOR_IDS = ["485c1a1f-5bf0-4c0d-b51c-c97af069fabd",
// Gabriel Nardi-Huffman
"2964531d-4ba6-4b61-8716-8c63a80f3cae",
// Tyler Tarter
"55056f35-3a44-4d79-8558-69e003be17b0",
// Kelly Schweiger
"51c62b82-f4ed-42d2-83e5-8d73d77482a4",
// T.M. Thomas
"78a82f38-ca14-430d-9ab4-2fc3423edff3",
// Author MG
"3f6b03df-9231-451c-ac2e-491fe9be584c",
// Melize Smit
"e14f7979-c1ca-4a91-9eb7-df4098759bac" // Frank Eugene Dukes Jr
];
const Index = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedImage, setExpandedImage] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [activeReaderImageIndex, setActiveReaderImageIndex] = useState(0);

  // Prefetch featured authors data to prevent loading lag
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["featured-authors"],
      queryFn: async () => {
        const {
          data,
          error
        } = await supabase.from("public_profiles").select("id, name, avatar_url, slug, created_at").in("id", FEATURED_AUTHOR_IDS);
        if (error) throw error;

        // Sort by the order in FEATURED_AUTHOR_IDS
        return (data || []).sort((a, b) => FEATURED_AUTHOR_IDS.indexOf(a.id) - FEATURED_AUTHOR_IDS.indexOf(b.id));
      },
      staleTime: 5 * 60 * 1000 // 5 minutes
    });
  }, [queryClient]);
  const readerImages = [{
    src: "/lovable-uploads/screenshots/about_author_qr.webp",
    alt: "Reader scanning a QR code to tip an author"
  }, {
    src: backCoverExample,
    alt: "Book back cover with QR code"
  }];
  const features = [{
    title: "Upload a thank you video",
    description: "It's like a hidden easter egg for your readers once they've finished your book",
    image: "/lovable-uploads/screenshots/book-page-1.webp",
    imageAlt: "Book page with thank you video",
    imageTitle: "Upload a thank-you video"
  }, {
    title: "Like and reply to reader messages",
    description: "It's like signing autographs from your couch",
    image: "/lovable-uploads/screenshots/message-reply-1.webp",
    imageAlt: "Message reply interface",
    imageTitle: "Hear directly from readers"
  }, {
    title: "Connect with Stripe to receive tips (optional)",
    description: "They'll appreciate the chance to support your work",
    image: "/lovable-uploads/screenshots/tipping-1.webp",
    imageAlt: "Reader tipping interface",
    imageTitle: "Connect with Stripe"
  }, {
    title: "Add character art and book recommendations",
    description: "Delight your fans even more",
    image: "/lovable-uploads/screenshots/character-art-recs.webp",
    imageAlt: "Author dashboard with art and recommendations",
    imageTitle: "Add art and book recommendations"
  }, {
    title: "Link to your website and socials",
    description: "Build your email list with easy reader signup forms",
    image: "/lovable-uploads/screenshots/links-section.webp",
    imageAlt: "Reader signup forms",
    imageTitle: "Link back to your website"
  }];
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
    <Meta title="Quilltips – Engage readers with QR codes on your books" description="Quilltips helps authors engage their readers through QR codes on their books." url="https://quilltips.co" image="https://quilltips.co/og-image.png" jsonLd={[{
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
            <h1 className="font-playfair font-medium text-5xl sm:text-6xl lg:text-7xl text-[#333333] leading-tight">A home for your book</h1>
           
            <p className="text-xl sm:text-2xl text-[#333333]/70 font-medium max-w-3xl mx-auto">Engage readers with bonus content, get tips & messages, and build your email list.</p>
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
            text: "Give readers an easy way to support you directly through voluntary tips."
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

      {/* Features Carousel Section */}
      <div className="mx-auto w-full max-w-5xl mt-16 px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Feature Tiles */}
          <div className="flex flex-col justify-center space-y-3 min-h-[530px]">
            {features.map((feature, index) => <div key={index} onClick={() => setActiveFeatureIndex(index)} className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${activeFeatureIndex === index ? "bg-[#19363C] text-[#FFD166]" : "bg-transparent text-[#333333] hover:bg-gray-100"}`}>
                <h3 className={`font-playfair font-semibold text-xl ${activeFeatureIndex === index ? "text-[#FFD166]" : "text-[#333333]"}`}>
                  {feature.title}
                </h3>
              </div>)}
          </div>
          
          {/* Right: Image Carousel */}
          <div className="flex justify-center items-center min-h-[530px]">
            <div className="rounded-2xl bg-transparent p-2 cursor-pointer transition-all duration-300 hover:shadow-lg" onClick={() => openImageModal(features[activeFeatureIndex].image, features[activeFeatureIndex].imageAlt, features[activeFeatureIndex].imageTitle)}>
              <img src={features[activeFeatureIndex].image} alt={features[activeFeatureIndex].imageAlt} className="w-full max-w-[370px] md:max-w-[425px] max-h-[530px] rounded-lg object-contain transition-opacity duration-300" />
            </div>
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
          {/* Image carousel right on desktop */}
          <div className="order-2 md:order-2 flex flex-col items-center md:items-end">
            <img src={readerImages[activeReaderImageIndex].src} alt={readerImages[activeReaderImageIndex].alt} className="w-full max-w-[320px] md:max-w-[375px] rounded-xl transition-opacity duration-300" />
            {/* Navigation arrows underneath */}
            <div className="flex justify-center items-center gap-2 mt-3">
              <button onClick={() => setActiveReaderImageIndex(prev => (prev - 1 + readerImages.length) % readerImages.length)} className="h-6 w-6 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-200" aria-label="Previous image">
                <ArrowLeft className="h-4 w-4 text-[#19363C]" />
              </button>
              <button onClick={() => setActiveReaderImageIndex(prev => (prev + 1) % readerImages.length)} className="h-6 w-6 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-200" aria-label="Next image">
                <ArrowRight className="h-4 w-4 text-[#19363C]" />
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* Pricing (Figma-style) */}
      <div className="mx-auto w-full max-w-4xl mt-20 px-4">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-[#19363C] mb-5">Does this cost money?</h2>
        </div>
        <div className="flex items-start gap-4 max-w-2xl mx-auto">
          <p className="text-base md:text-lg text-[#19363C]/90 leading-relaxed text-left flex-1">Sign up and publish your author profile for free. Pay a one-time $35 price for each QR code you create. No hidden charges or subscriptions. No credit card required to get started. <RouterLink to="/pricing" className="text-[#19363C] underline hover:no-underline">Read more about pricing</RouterLink>.</p>
         
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