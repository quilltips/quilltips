
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
    hasStripeAccount
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
                src={qrCode.cover_image || "/lovable-uploads/logo_nav.png"}
                alt={qrCode.book_title}
                className="w-full h-full"
                objectFit={qrCode.cover_image ? "cover" : "contain"}
                fallbackSrc="/lovable-uploads/logo_nav.png"
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
              <div className="mt-2 text-sm">
                {qrCode.publisher && (
                  <p>Publisher: {qrCode.publisher}</p>
                )}
                {qrCode.release_date && (
                  <p>Released: {format(new Date(qrCode.release_date), 'MMMM yyyy')}</p>
                )}
              </div>
            </div>
          </div>
            
          {/* Leave a tip button or message */}
          {!showTipForm && (
            <>
              {stripeSetupComplete && hasStripeAccount ? (
                <Button 
                  onClick={() => setShowTipForm(true)} 
                  className="w-full bg-[#FFD166] hover:bg-[#FFD166]/80 hover:shadow text-secondary-foreground rounded-full py-6"
                >
                  Leave a tip!
                </Button>
              ) : (
                <div className="w-full p-4 bg-muted rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    Tipping not available - author setting up payments
                  </p>
                </div>
              )}
            </>
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
              onNameChange={setName}
              onMessageChange={setMessage}
              onEmailChange={setEmail}
              onAmountChange={setAmount}
              onCustomAmountChange={setCustomAmount}
              onSubmit={handleSubmit}
              onCancel={() => setShowTipForm(false)}
            />
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
