
import { Layout } from "@/components/Layout";
import { QRCodePublisherInvite } from "@/components/qr/QRCodePublisherInvite";
import { PublicTipHistory } from "@/components/tips/PublicTipHistory";
import { QRCodeLoading } from "@/components/qr/QRCodeLoading";
import { QRCodeNotFound } from "@/components/qr/QRCodeNotFound";
import { useQRCodeDetails } from "@/hooks/use-qr-code-details";
import { Button } from "@/components/ui/button";

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
    handleSubmit,
    showTipForm,
    setShowTipForm
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
            <div className="w-32 aspect-[2/3] relative shrink-0">
              <img
                src={qrCode.cover_image || "/placeholder.svg"}
                alt={qrCode.book_title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="space-y-1 pt-2">
              <h1 className="text-2xl font-bold">{qrCode.book_title}</h1>
              <p className="text-muted-foreground">by {qrCode.author?.name || 'Unknown Author'}</p>
            </div>
          </div>
            
          {/* Leave a tip button */}
          <Button 
            onClick={() => setShowTipForm(true)} 
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full py-6"
          >
            Leave a tip!
          </Button>

          {/* Tip form (conditionally rendered) */}
          {showTipForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <div className="mt-1 flex space-x-2">
                      {["5", "10", "15", "25", "custom"].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`px-3 py-2 text-sm rounded-md ${
                            amount === value
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-gray-100"
                          }`}
                          onClick={() => setAmount(value)}
                        >
                          {value === "custom" ? "Custom" : `$${value}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {amount === "custom" && (
                    <div>
                      <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700">
                        Custom Amount
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="customAmount"
                          id="customAmount"
                          className="pl-8 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-primary focus:border-primary"
                          placeholder="0.00"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="mt-1 block w-full p-2 rounded-md border border-gray-300 focus:ring-primary focus:border-primary"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={3}
                      className="mt-1 block w-full p-2 rounded-md border border-gray-300 focus:ring-primary focus:border-primary"
                      placeholder="Leave a message for the author"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowTipForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || (amount === "custom" && !customAmount)}
                  >
                    {isLoading ? "Processing..." : "Send Tip"}
                  </Button>
                </div>
              </form>
            </div>
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
