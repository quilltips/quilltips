
import { Layout } from "@/components/Layout";
import { QRCodePublisherInvite } from "@/components/qr/QRCodePublisherInvite";
import { PublicTipHistory } from "@/components/tips/PublicTipHistory";
import { QRCodeLoading } from "@/components/qr/QRCodeLoading";
import { QRCodeNotFound } from "@/components/qr/QRCodeNotFound";
import { useQRCodeDetails } from "@/hooks/use-qr-code-details";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { QRCodeTipForm } from "@/components/qr/QRCodeTipForm";
import { Link } from "react-router-dom";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getAuthorUrl } from "@/lib/url-utils";
import { VideoThumbnailWithModal } from "@/components/book/VideoThumbnailWithModal";
import { CollapsibleBookDescription } from "@/components/book/CollapsibleBookDescription";
import { CharacterArtCarousel } from "@/components/book/CharacterArtCarousel";
import { BookRecommendationsCarousel } from "@/components/book/BookRecommendationsCarousel";
import { AuthorOtherBooksCarousel } from "@/components/book/AuthorOtherBooksCarousel";
import { Mail } from "lucide-react";

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
    isLoading,
    handleSubmit,
    showTipForm,
    setShowTipForm,
    authorFirstName,
    stripeSetupComplete,
    hasStripeAccount,
    isQRCodePaid
  } = useQRCodeDetails();

  if (qrCodeLoading) {
    return <QRCodeLoading />;
  }

  if (!qrCode) {
    return <QRCodeNotFound />;
  }

  return (
      <main className="container mx-auto px-4 pt-8 pb-12 space-y-8">
        <div className="max-w-md mx-auto space-y-8">
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
          {!showTipForm && (
            <div className="flex gap-3">
              {stripeSetupComplete && hasStripeAccount && isQRCodePaid ? (
                <>
                  <Button 
                    onClick={() => setShowTipForm(true)} 
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg font-semibold"
                  >
                    Send a Tip 💰
                  </Button>
                  <Button 
                    onClick={() => {
                      setAmount('0');
                      setShowTipForm(true);
                    }} 
                    variant="outline"
                    className="flex-1 py-6 text-lg font-semibold"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Send Message
                  </Button>
                </>
              ) : (
                <div className="w-full p-4 bg-muted rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    Tipping not available - author setting up payments
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tip form (conditionally rendered) */}
          {showTipForm && (
            <QRCodeTipForm
              name={name}
              message={message}
              email={email}
              amount={amount}
              customAmount={customAmount}
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
              onSubmit={handleSubmit}
              onCancel={() => setShowTipForm(false)}
            />
          )}
          
          {/* Book Enhancements Section */}
          {!showTipForm && (
            <div className="space-y-8">
              {/* Thank You Video */}
              {qrCode.thank_you_video_url && (
                <div className="space-y-3">
                  <h3 className="text-xl font-playfair text-foreground">A Message from the Author</h3>
                  <VideoThumbnailWithModal
                    videoUrl={qrCode.thank_you_video_url}
                    thumbnailUrl={qrCode.thank_you_video_thumbnail || undefined}
                    title={qrCode.video_title || undefined}
                    description={qrCode.video_description || undefined}
                  />
                </div>
              )}
              
              {/* Book Description */}
              {qrCode.book_description && (
                <div className="rounded-lg border border-border p-6 space-y-3">
                  <h3 className="text-xl font-playfair text-foreground">About This Book</h3>
                  <CollapsibleBookDescription description={qrCode.book_description} />
                </div>
              )}
              
              {/* Character Art */}
              {qrCode.character_images && Array.isArray(qrCode.character_images) && qrCode.character_images.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-playfair text-foreground">Character Gallery</h3>
                  <CharacterArtCarousel characters={qrCode.character_images} />
                </div>
              )}
              
              {/* Author's Other Books */}
              {qrCode.otherBooks && qrCode.otherBooks.length > 1 && (
                <AuthorOtherBooksCarousel
                  books={qrCode.otherBooks}
                  authorName={qrCode.author?.name || 'this author'}
                  currentBookId={qrCode.id}
                />
              )}
              
              {/* Author Recommendations */}
              {qrCode.recommendations && qrCode.recommendations.length > 0 && (
                <BookRecommendationsCarousel
                  recommendations={qrCode.recommendations}
                  authorName={qrCode.author?.name || 'The author'}
                />
              )}
            </div>
          )}
          
          {/* Tip feed section */}
          <div className="rounded-lg border border-border p-6 space-y-6">
            <h2 className="text-2xl font-semibold">Tip feed</h2>
            <PublicTipHistory qrCodeId={qrCode.id} />
          </div>
        </div>

        <QRCodePublisherInvite
          isOpen={showPublisherInvite}
          onClose={() => setShowPublisherInvite(false)}
          bookTitle={qrCode.book_title}
        />
      </main>
  );
};

export default QRCodeDetails;
