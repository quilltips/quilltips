
import { QRCodePublisherInvite } from "@/components/qr/QRCodePublisherInvite";
import { PublicTipHistory } from "@/components/tips/PublicTipHistory";
import { QRCodeLoading } from "@/components/qr/QRCodeLoading";
import { QRCodeNotFound } from "@/components/qr/QRCodeNotFound";
import { useQRCodeDetails } from "@/hooks/use-qr-code-details";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { QRCodeTipForm } from "@/components/qr/QRCodeTipForm";
import { MessageForm } from "@/components/MessageForm";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getAuthorUrl, getCanonicalUrl } from "@/lib/url-utils";
import { VideoCarousel, BookVideo } from "@/components/book/VideoCarousel";
import { VideoThumbnailWithModal } from "@/components/book/VideoThumbnailWithModal";
import { CollapsibleBookDescription } from "@/components/book/CollapsibleBookDescription";
import { CharacterArtCarousel } from "@/components/book/CharacterArtCarousel";
import { BookRecommendationsCarousel } from "@/components/book/BookRecommendationsCarousel";
import { AuthorOtherBooksCarousel } from "@/components/book/AuthorOtherBooksCarousel";
import { ARCSignupCard } from "@/components/author/ARCSignupCard";
import { BetaReaderSignupCard } from "@/components/author/BetaReaderSignupCard";
import { NewsletterSignupCard } from "@/components/author/NewsletterSignupCard";
import { BookClubInviteCard } from "@/components/author/BookClubInviteCard";
import { useState } from "react";
import { ChevronRight, Mail, Video, FileText, Image, MessageCircle } from "lucide-react";
import { Meta } from "@/components/Meta";

const QRCodeDetails = () => {
  const {
    id,
    qrCode,
    qrCodeLoading,
    showPublisherInvite,
    setShowPublisherInvite,
    amount,
    setAmount,
    customAmount,
    setCustomAmount,
    message,
    setMessage,
    name,
    setName,
    email,
    setEmail,
    isPrivate,
    setIsPrivate,
    isLoading,
    handleSubmit,
    showTipForm,
    setShowTipForm,
    authorFirstName,
    stripeSetupComplete,
    hasStripeAccount,
    isQRCodePaid
  } = useQRCodeDetails();

  const [showMessageForm, setShowMessageForm] = useState(false);

  if (qrCodeLoading) {
    return <QRCodeLoading />;
  }

  if (!qrCode) {
    return <QRCodeNotFound />;
  }

  const canonicalUrl = getCanonicalUrl('book', qrCode);
  const bookDescription = qrCode.book_description 
    ? (qrCode.book_description.length > 160 ? qrCode.book_description.substring(0, 157) + '...' : qrCode.book_description)
    : `Support ${qrCode.author?.name || 'the author'} by tipping them for ${qrCode.book_title} on Quilltips.`;
  const ogImage = qrCode.cover_image || 'https://quilltips.co/og-image.png';

  // Individual signup forms are rendered separately below

  return (
    <>
      <Meta
        title={`${qrCode.book_title} by ${qrCode.author?.name || 'Unknown Author'} – Quilltips`}
        description={bookDescription}
        url={canonicalUrl}
        canonical={canonicalUrl}
        image={ogImage}
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Book",
          "name": qrCode.book_title,
          "author": {
            "@type": "Person",
            "name": qrCode.author?.name || "Unknown Author",
            "url": qrCode.author ? getCanonicalUrl('author', qrCode.author) : undefined
          },
          "url": canonicalUrl,
          "image": qrCode.cover_image,
          "publisher": qrCode.publisher ? {
            "@type": "Organization",
            "name": qrCode.publisher
          } : undefined,
          "datePublished": qrCode.release_date || undefined,
          "description": bookDescription
        }}
      />
      <main className="container mx-auto px-4 pt-4 md:pt-8 pb-12">
        <div className="max-w-md md:max-w-2xl mx-auto space-y-8 md:space-y-10">
          {/* Hero: centered */}
          <div className="space-y-6 md:space-y-8">
          {/* Book details: centered stack on all viewports (match mobile) */}
          <div className="flex flex-col items-center text-center">
            <div className="w-[90px] md:w-36 aspect-[2/3] relative shrink-0 rounded-md overflow-hidden">
              <OptimizedImage
                src={qrCode.cover_image || "/lovable-uploads/logo_nav.svg"}
                alt={qrCode.book_title}
                className="w-full h-full"
                objectFit={qrCode.cover_image ? "cover" : "contain"}
                fallbackSrc="/lovable-uploads/logo_nav.svg"
                sizes="(max-width: 768px) 90px, 144px"
                priority={true}
              />
            </div>
            <div className="space-y-3 pt-3 w-full">
              <h1 className="text-xl md:text-4xl font-bold">{qrCode.book_title}</h1>
              <p className="text-sm md:text-Ixl">
                by <Link 
                    to={getAuthorUrl({ id: qrCode.author_id, slug: qrCode.author?.slug })}
                    className="hover:underline hover:text-primary transition-colors"
                  >
                    {qrCode.author?.name || 'Unknown Author'}
                  </Link>
                {qrCode.release_date && (
                  <> · {format(new Date(qrCode.release_date), 'MMMM yyyy')}</>
                )}
              </p>
              {/* Inline actions: Buy, Support, Fan Mail */}
              {!showTipForm && !showMessageForm && (
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {qrCode.buy_now_link && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(qrCode.buy_now_link, '_blank')}
                      className="bg-transparent border-border text-[#333333] hover:underline hover:bg-transparent hover:shadow-none hover:font-bold hover:border-[#333333]/50 text-xs px-3 py-1.5 h-8"
                    >
                      Buy
                    </Button>
                  )}
                  {stripeSetupComplete && hasStripeAccount && isQRCodePaid && qrCode.tipping_enabled !== false && (
                    <Button 
                      onClick={() => setShowTipForm(true)} 
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 py-1.5 h-8 bg-transparent border-border text-[#333333] hover:underline hover:bg-transparent hover:shadow-none hover:font-bold hover:border-[#333333]/50"
                    >
                      Support
                    </Button>
                  )}
                  <Button 
                    onClick={() => setShowMessageForm(true)} 
                    variant="outline"
                    size="sm"
                    className="text-xs px-3 py-1.5 h-8 bg-transparent border-border text-[#333333] hover:underline hover:bg-transparent hover:shadow-none hover:font-bold hover:border-[#333333]/50"
                  >
                    Fan Mail
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile section nav: jump to video, letter, description, art, feed */}
          {qrCode.is_paid && (() => {
            const bookVideos = qrCode.book_videos as BookVideo[] | null;
            const hasVideos = (bookVideos && Array.isArray(bookVideos) && bookVideos.length > 0) || (qrCode.thank_you_video_url || qrCode.video_title);
            const hasLetter = !!qrCode.letter_to_readers;
            const hasDescription = !!qrCode.book_description;
            const hasArt = qrCode.character_images && Array.isArray(qrCode.character_images) && qrCode.character_images.length > 0;
            const sections = [
              hasVideos && { id: 'section-video', icon: Video, label: 'Video' },
              hasLetter && { id: 'section-letter', icon: Mail, label: 'Letter' },
              hasArt && { id: 'section-art', icon: Image, label: 'Art' },
              hasDescription && { id: 'section-description', icon: FileText, label: 'Description' },
              { id: 'section-feed', icon: MessageCircle, label: 'Fan Mail' },
            ].filter(Boolean) as { id: string; icon: typeof Video; label: string }[];
            if (sections.length <= 1) return null;
            return (
              <div className="flex md:hidden justify-center">
                <nav className="w-fit flex justify-center gap-3 py-1.5 border-y border-border">
                {sections.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
                </nav>
              </div>
            );
          })()}

          {/* Message form (conditionally rendered) */}
          {showMessageForm && (
            <div className="max-w-md mx-auto w-full">
              <MessageForm
                authorId={qrCode.author_id}
                authorName={qrCode.author?.name}
                bookTitle={qrCode.book_title}
                qrCodeId={qrCode.id}
                onCancel={() => setShowMessageForm(false)}
                onSuccess={() => setShowMessageForm(false)}
              />
            </div>
          )}

          {/* Tip form (conditionally rendered) */}
          {showTipForm && (
            <div className="max-w-md mx-auto w-full">
              <QRCodeTipForm
                name={name}
                message={message}
                email={email}
                amount={amount}
                customAmount={customAmount}
                isPrivate={isPrivate}
                isLoading={isLoading}
                authorFirstName={authorFirstName}
                stripeSetupComplete={stripeSetupComplete}
                hasStripeAccount={hasStripeAccount}
                isQRCodePaid={isQRCodePaid}
                onNameChange={setName}
                onMessageChange={setMessage}
                onEmailChange={setEmail}
                onAmountChange={setAmount}
                onCustomAmountChange={setCustomAmount}
                onPrivateChange={setIsPrivate}
                onSubmit={handleSubmit}
                onCancel={() => setShowTipForm(false)}
              />
            </div>
          )}

          </div>
          {/* End hero */}

          {/* Book Bonus Content Section - Only show if QR code is paid */}
          {qrCode.is_paid && (
            <div className="flex flex-col gap-10 sm:gap-12">
              {/* Videos Section */}
              {(() => {
                // Check for new multi-video system first
                const bookVideos = qrCode.book_videos as BookVideo[] | null;
                const hasMultipleVideos = bookVideos && Array.isArray(bookVideos) && bookVideos.length > 0;
                
                // Fallback to legacy single video
                const hasLegacyVideo = !hasMultipleVideos && (qrCode.thank_you_video_url || qrCode.video_title);
                
                if (hasMultipleVideos) {
                  return (
                    <div id="section-video" className="scroll-mt-4 rounded-xl p-4 md:p-6 bg-[#f8f6f2] space-y-3 md:space-y-4">
                      <VideoCarousel videos={bookVideos} />
                    </div>
                  );
                }
                
                if (hasLegacyVideo) {
                  return (
                    <div id="section-video" className="scroll-mt-4 rounded-xl p-4 md:p-6 bg-[#f8f6f2] space-y-3 md:space-y-4">
                      <VideoThumbnailWithModal
                        videoUrl={qrCode.thank_you_video_url || qrCode.video_title || ''}
                        thumbnailUrl={qrCode.thank_you_video_thumbnail || undefined}
                        title={qrCode.video_title && !qrCode.thank_you_video_url ? undefined : qrCode.video_title || undefined}
                        description={qrCode.video_description || undefined}
                      />
                    </div>
                  );
                }
                
                return null;
              })()}
              
              {/* Letter to Readers - inline on page */}
              {qrCode.letter_to_readers && (
                <div id="section-letter" className="scroll-mt-4 rounded-xl p-4 md:p-6 bg-[#f8f6f2] space-y-3 md:space-y-4">
                  <div className="rounded-lg p-3 md:p-4 bg-white/60 border border-border">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {qrCode.letter_to_readers}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Character Art */}
              {qrCode.character_images && Array.isArray(qrCode.character_images) && qrCode.character_images.length > 0 && (
                <div id="section-art" className="scroll-mt-4 rounded-xl p-4 md:p-6 bg-[#f8f6f2] space-y-4 md:space-y-6">
                  <h3 className="text-xl font-playfair text-foreground text-center">Book Art</h3>
                  <CharacterArtCarousel characters={qrCode.character_images} />
                </div>
              )}
              
              {/* Book Description */}
              {qrCode.book_description && (
                <div id="section-description" className="scroll-mt-4 rounded-xl p-4 md:p-6 bg-[#f8f6f2] space-y-3 md:space-y-4">
                  <h3 className="text-xl font-playfair text-center">Description</h3>
                  <div className="rounded-lg p-3 md:p-4">
                    <CollapsibleBookDescription description={qrCode.book_description} maxLines={4} />
                  </div>
                </div>
              )}
              
              {/* About The Author */}
              {qrCode.author && qrCode.author.bio && (
                <div className="rounded-xl p-4 md:p-6 bg-[#f8f6f2] space-y-3">
                  <h3 className="text-xl font-playfair text-center">About The Author</h3>
                  <div className="flex items-start gap-3">
                    <Link
                      to={getAuthorUrl({ id: qrCode.author_id, slug: qrCode.author.slug })}
                      className="shrink-0"
                    >
                      <img
                        src={qrCode.author.avatar_url || "/lovable-uploads/logo_nav.svg"}
                        alt={qrCode.author.name || "Author"}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                        onError={(e) => { e.currentTarget.src = "/lovable-uploads/logo_nav.svg"; }}
                      />
                    </Link>
                    <div className="space-y-1">
                      <p className="text-sm">
                        {qrCode.author.bio.length > 100 
                          ? `${qrCode.author.bio.substring(0, 100)}...` 
                          : qrCode.author.bio}
                      </p>
                      <Link
                        to={getAuthorUrl({ id: qrCode.author_id, slug: qrCode.author.slug })}
                        className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors group"
                      >
                        View profile
                        <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Signup Forms - each in its own card */}
              {qrCode.arc_signup_enabled && (
                <div className="rounded-xl p-4 md:p-6 bg-[#f8f6f2] space-y-4 max-w-md mx-auto w-full">
                  <h3 className="text-xl font-playfair text-center">Sign up for ARC Reader</h3>
                  <ARCSignupCard
                    authorId={qrCode.author_id}
                    description={qrCode.author?.arc_signup_description || "Get early access to upcoming books in exchange for honest reviews."}
                  />
                </div>
              )}
              {qrCode.beta_reader_enabled && (
                <div className="rounded-xl p-4 md:p-6 bg-[#f8f6f2] space-y-4 max-w-md mx-auto w-full">
                  <h3 className="text-xl font-playfair text-center">Sign up for Beta Reader</h3>
                  <BetaReaderSignupCard
                    authorId={qrCode.author_id}
                    description={qrCode.author?.beta_reader_description || "Help shape upcoming stories by providing feedback on early drafts."}
                  />
                </div>
              )}
              {qrCode.newsletter_enabled && (
                <div className="rounded-xl p-4 md:p-6 bg-[#f8f6f2] space-y-4 max-w-md mx-auto w-full">
                  <h3 className="text-xl font-playfair text-center">Sign up for Newsletter</h3>
                  <NewsletterSignupCard
                    authorId={qrCode.author_id}
                    description={qrCode.author?.newsletter_description || "Stay updated on new releases, exclusive content, and author news."}
                  />
                </div>
              )}
              {qrCode.book_club_enabled && (
                <div className="rounded-xl p-4 md:p-6 bg-[#f8f6f2] space-y-4 max-w-md mx-auto w-full">
                  <h3 className="text-xl font-playfair text-center">Sign up for Book Club</h3>
                  <BookClubInviteCard
                    authorId={qrCode.author_id}
                    description={qrCode.author?.book_club_description || "Invite the author to your book club meeting or event."}
                  />
                </div>
              )}
              
              {/* Author's Other Books */}
              {qrCode.otherBooks && qrCode.otherBooks.length > 1 && (
                <div className="rounded-xl p-4 md:p-6 bg-[#f8f6f2]">
                <AuthorOtherBooksCarousel
                  books={qrCode.otherBooks}
                  authorName={qrCode.author?.name || 'this author'}
                  currentBookId={qrCode.id}
                />
                </div>
              )}
              
              {/* Bookshelf - below Other Books */}
              {qrCode.recommendations && qrCode.recommendations.length > 0 && (
                <div className="rounded-xl p-4 md:p-6 bg-[#f8f6f2]">
                <BookRecommendationsCarousel
                  recommendations={qrCode.recommendations}
                  authorName={qrCode.author?.name || 'The author'}
                />
                </div>
              )}
            </div>
          )}
          
          {/* Feed section */}
          <div id="section-feed" className="scroll-mt-4 rounded-lg border border-border p-6 space-y-6 pt-10 sm:pt-12">
            <h2 className="text-2xl font-semibold">Fan Mail</h2>
            <PublicTipHistory qrCodeId={qrCode.id} />
          </div>
        </div>

        <QRCodePublisherInvite
          isOpen={showPublisherInvite}
          onClose={() => setShowPublisherInvite(false)}
          bookTitle={qrCode.book_title}
        />
      </main>
    </>
  );
};

export default QRCodeDetails;
