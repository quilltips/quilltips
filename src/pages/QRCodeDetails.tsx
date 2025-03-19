
import { Navigation } from "@/components/Navigation";
import { QRCodeDetailCard } from "@/components/qr/QRCodeDetailCard";
import { QRCodeTipForm } from "@/components/qr/QRCodeTipForm";
import { QRCodePublisherInvite } from "@/components/qr/QRCodePublisherInvite";
import { PublicTipHistory } from "@/components/tips/PublicTipHistory";
import { QRCodeLoading } from "@/components/qr/QRCodeLoading";
import { QRCodeNotFound } from "@/components/qr/QRCodeNotFound";
import { useQRCodeDetails } from "@/hooks/use-qr-code-details";

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
    isLoading,
    handleSubmit
  } = useQRCodeDetails();

  if (qrCodeLoading) {
    return <QRCodeLoading />;
  }

  if (!qrCode) {
    return <QRCodeNotFound />;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 space-y-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <QRCodeDetailCard qrCode={qrCode} />

          <QRCodeTipForm
            name={name}
            message={message}
            amount={amount}
            customAmount={customAmount}
            isLoading={isLoading}
            onNameChange={setName}
            onMessageChange={setMessage}
            onAmountChange={setAmount}
            onCustomAmountChange={setCustomAmount}
            onSubmit={handleSubmit}
          />
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Reader Messages</h2>
            <PublicTipHistory qrCodeId={qrCode.id} />
          </div>
        </div>

        <QRCodePublisherInvite
          isOpen={showPublisherInvite}
          onClose={() => setShowPublisherInvite(false)}
          bookTitle={qrCode.book_title}
        />
      </main>
    </div>
  );
};

export default QRCodeDetails;
