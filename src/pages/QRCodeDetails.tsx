
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
import { useState } from "react";
import { ChevronRight, Mail } from "lucide-react";
import { Meta } from "@/components/Meta";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

  // Check if any signup forms are enabled
  const hasSignupForms = qrCode.arc_signup_enabled || qrCode.beta_reader_enabled || qrCode.newsletter_enabled;

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
      <main className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-md mx-auto space-y-10 sm:space-y-12">
          {/* Book details card with horizontal layout */}
          <div className="flex items-center space-x-6">
            <div className="w-32 aspect-[2/3] relative shrink-0 rounded-md overflow-hidden">
              <OptimizedImage
                src={qrCode.cover_image || "/lovable-uploads/logo_nav.svg"}
                alt={qrCode.book_title}
                className="w-full h-full"
                objectFit={qrCode.cover_image ? "cover" : "contain"}
                fallbackSrc="/lovable-uploads/logo_nav.svg"
                sizes="128px"
                priority={true}
              />
            </div>
            <div className="space-y-1 pt-2">
              <h1 className="text-2xl font-bold">{qrCode.book_title}</h1>
              <p className="">
                by <Link 
                    to={getAuthorUrl({ id: qrCode.author_id, slug: qrCode.author?.slug })}
                    className="hover:underline hover:text-primary transition-colors"
                  >
                    {qrCode.author?.name || 'Unknown Author'}
                  </Link>
              </p>
              
              {/* Added publisher and release date info */}
              <div className="mt-2 text-sm space-y-1">
                {qrCode.publisher && (
                  <p>Publisher: {qrCode.publisher}</p>
                )}
                {qrCode.release_date && (
                  <p>Released: {format(new Date(qrCode.release_date), 'MMMM yyyy')}</p>
                )}
                
                {/* Buy Now button */}
                {qrCode.buy_now_link && (
                  <div className="pt-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(qrCode.buy_now_link, '_blank')}
                      className="bg-transparent border-border text-[#333333] hover:underline hover:bg-transparent hover:shadow-none hover:font-bold hover:border-[#333333]/50 text-xs px-3 py-1"
                    >
                      Buy Now!
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
            
          {/* Tip and Message buttons */}
          {!showTipForm && !showMessageForm && (
            <div className="flex gap-3">
              {stripeSetupComplete && hasStripeAccount && isQRCodePaid && qrCode.tipping_enabled !== false ? (
                <>
                  <Button 
                    onClick={() => setShowTipForm(true)} 
                    className="flex-1 py-6 text-md font-medium"
                    style={{ backgroundColor: '#FFD166', color: '#333333' }}
                  >
                    Leave a tip
                  </Button>
                  <Button 
                    onClick={() => setShowMessageForm(true)} 
                    variant="outline"
                    className="flex-1 py-6 text-md font-medium hover:bg-transparent hover:shadow"
                  >
                    Send a message
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setShowMessageForm(true)} 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow py-6 text-lg font-semibold"
                >
                  Send a message
                </Button>
              )}
            </div>
          )}

          {/* Message form (conditionally rendered) */}
          {showMessageForm && (
            <MessageForm
              authorId={qrCode.author_id}
              authorName={qrCode.author?.name}
              bookTitle={qrCode.book_title}
              qrCodeId={qrCode.id}
              onCancel={() => setShowMessageForm(false)}
              onSuccess={() => setShowMessageForm(false)}
            />
          )}

          {/* Tip form (conditionally rendered) */}
          {showTipForm && (
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
          )}
          
          {/* Book Bonus Content Section - Only show if QR code is paid */}
          {!showTipForm && !showMessageForm && qrCode.is_paid && (
            <div className="space-y-16 sm:space-y-20">
              {/* Videos Section */}
              {(() => {
                // Check for new multi-video system first
                const bookVideos = qrCode.book_videos as BookVideo[] | null;
                const hasMultipleVideos = bookVideos && Array.isArray(bookVideos) && bookVideos.length > 0;
                
                // Fallback to legacy single video
                const hasLegacyVideo = !hasMultipleVideos && (qrCode.thank_you_video_url || qrCode.video_title);
                
                if (hasMultipleVideos) {
                  return (
                    <div className="space-y-4">
                      <h3 className="text-xl font-playfair text-foreground">
                        {bookVideos.length === 1 ? "A Message from the Author" : "Videos"}
                      </h3>
                      <VideoCarousel videos={bookVideos} />
                    </div>
                  );
                }
                
                if (hasLegacyVideo) {
                  return (
                    <div className="space-y-4">
                      <h3 className="text-xl font-playfair text-foreground">A Message from the Author</h3>
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
              
              {/* Letter to Readers - Modal */}
              {qrCode.letter_to_readers && (
                <div className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="w-full flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <span className="text-lg font-playfair">A Letter from the Author</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-playfair text-xl">A Letter from the Author</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
                        {qrCode.letter_to_readers}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              
              {/* Book Description */}
              {qrCode.book_description && (
                <div className="space-y-4">
                  <h3 className="text-xl font-playfair">Description</h3>
                  <div className="rounded-lg p-6">
                    <CollapsibleBookDescription description={qrCode.book_description} />
                  </div>
                </div>
              )}
              
              {/* Character Art */}
              {qrCode.character_images && Array.isArray(qrCode.character_images) && qrCode.character_images.length > 0 && (
                <div className="space-y-6 -mt-8 sm:-mt-10">
                  <h3 className="text-xl font-playfair text-foreground">Book Art</h3>
                  <CharacterArtCarousel characters={qrCode.character_images} />
                </div>
              )}
              
              {/* Author Bio Preview */}
              {qrCode.author && qrCode.author.bio && (
                <div className="space-y-2 py-2">
                  <p className="text-sm ">
                    {qrCode.author.bio.length > 100 
                      ? `${qrCode.author.bio.substring(0, 100)}...` 
                      : qrCode.author.bio}
                  </p>
                  <Link
                    to={getAuthorUrl({ id: qrCode.author_id, slug: qrCode.author.slug })}
                    className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors group"
                  >
                    View author profile
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
              
              {/* Author Recommendations */}
              {qrCode.recommendations && qrCode.recommendations.length > 0 && (
                <BookRecommendationsCarousel
                  recommendations={qrCode.recommendations}
                  authorName={qrCode.author?.name || 'The author'}
                />
              )}
              
              {/* Signup Forms Section - moved below recommendations */}
              {hasSignupForms && (
                <div className="space-y-4">
                  <h3 className="text-xl font-playfair">Connect with the Author</h3>
                  <div className="space-y-4">
                    {qrCode.arc_signup_enabled && (
                      <ARCSignupCard
                        authorId={qrCode.author_id}
                        description={qrCode.author?.arc_signup_description || "Get early access to upcoming books in exchange for honest reviews."}
                      />
                    )}
                    {qrCode.beta_reader_enabled && (
                      <BetaReaderSignupCard
                        authorId={qrCode.author_id}
                        description={qrCode.author?.beta_reader_description || "Help shape upcoming stories by providing feedback on early drafts."}
                      />
                    )}
                    {qrCode.newsletter_enabled && (
                      <NewsletterSignupCard
                        authorId={qrCode.author_id}
                        description={qrCode.author?.newsletter_description || "Stay updated on new releases, exclusive content, and author news."}
                      />
                    )}
                  </div>
                </div>
              )}
              
              {/* Author's Other Books - moved to bottom */}
              {qrCode.otherBooks && qrCode.otherBooks.length > 1 && (
                <AuthorOtherBooksCarousel
                  books={qrCode.otherBooks}
                  authorName={qrCode.author?.name || 'this author'}
                  currentBookId={qrCode.id}
                />
              )}
            </div>
          )}
          
          {/* Feed section */}
          <div className="rounded-lg border border-border p-6 space-y-6 pt-10 sm:pt-12">
            <h2 className="text-2xl font-semibold">Feed</h2>
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
