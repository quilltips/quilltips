
import { Layout } from "@/components/Layout";
import { QRCodePublisherInvite } from "@/components/qr/QRCodePublisherInvite";
import { PublicTipHistory } from "@/components/tips/PublicTipHistory";
import { QRCodeLoading } from "@/components/qr/QRCodeLoading";
import { QRCodeNotFound } from "@/components/qr/QRCodeNotFound";
import { useQRCodeDetails } from "@/hooks/use-qr-code-details";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { QRCodeTipForm } from "@/components/qr/QRCodeTipForm";

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
    authorFirstName
  } = useQRCodeDetails();

  if (qrCodeLoading) {
    return (
      <Layout>
        <QRCodeLoading />
      </Layout>
    );
  }

  if (!qrCode) {
    return (
      <Layout>
        <QRCodeNotFound />
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="container mx-auto px-4 pt-8 pb-12 space-y-8">
        <div className="max-w-md mx-auto space-y-8">
          {/* Book details card with horizontal layout */}
          <div className="flex items-start space-x-6">
            <div className="w-32 aspect-[2/3] relative shrink-0 rounded-md overflow-hidden">
              {qrCode.cover_image ? (
                <img
                  src={qrCode.cover_image}
                  alt={qrCode.book_title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/quill_icon.png"
                    alt="Quilltips Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              )}
            </div>
            <div className="space-y-1 pt-2">
              <h1 className="text-2xl font-bold">{qrCode.book_title}</h1>
              <p className="text-muted-foreground">by {qrCode.author?.name || 'Unknown Author'}</p>
              
              {/* Added publisher and release date info */}
              <div className="mt-2 text-sm text-muted-foreground">
                {qrCode.publisher && (
                  <p>Publisher: {qrCode.publisher}</p>
                )}
                {qrCode.release_date && (
                  <p>Released: {format(new Date(qrCode.release_date), 'MMMM yyyy')}</p>
                )}
              </div>
            </div>
          </div>
            
          {/* Leave a tip button */}
          {!showTipForm && (
            <Button 
              onClick={() => setShowTipForm(true)} 
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full py-6"
            >
              Leave a tip!
            </Button>
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
          <div className="rounded-lg border border-border p-6 space-y-4">
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
    </Layout>
  );
};

export default QRCodeDetails;
