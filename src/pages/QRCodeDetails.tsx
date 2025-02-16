import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { QRCodePublisherInvite } from "@/components/qr/QRCodePublisherInvite";
import { QRCodeCanvas } from "qrcode.react";
import { TipAmountSelector } from "@/components/tip/TipAmountSelector";
import { TipMessageForm } from "@/components/tip/TipMessageForm";
import { PaymentForm } from "@/components/tip/PaymentForm";
import { PublicTipHistory } from "@/components/tips/PublicTipHistory";

const QRCodeDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showPublisherInvite, setShowPublisherInvite] = useState(false);
  const [amount, setAmount] = useState("5");
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: qrCode, isLoading: qrCodeLoading } = useQuery({
    queryKey: ['qr-code', id],
    queryFn: async () => {
      const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .select(`
          *,
          author:author_id (
            name,
            avatar_url,
            bio
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (qrError) throw qrError;
      if (!qrData) throw new Error('QR code not found');
      return qrData;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const finalAmount = amount === 'custom' ? customAmount : amount;

    try {
      const { data, error } = await supabase.functions.invoke('create-tip-checkout', {
        body: {
          amount: Number(finalAmount),
          authorId: qrCode.author_id,
          message,
          name,
          bookTitle: qrCode.book_title,
          qrCodeId: qrCode.id,
        },
      });

      if (error) throw error;
      
      if (data.error) {
        if (data.code === 'ACCOUNT_SETUP_INCOMPLETE') {
          toast({
            title: "Account Setup Required",
            description: "The author needs to complete their payment account setup before they can receive tips.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from server');
      }

    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: "QR Code Created",
        description: "Your QR code has been created successfully!",
      });
      setShowPublisherInvite(true);
    }
  }, [searchParams, toast]);

  if (qrCodeLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary rounded-full border-t-transparent" />
          </div>
        </main>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Book not found</h1>
            <p className="text-muted-foreground mt-2">The book you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
      </div>
    );
  }

  const qrValue = `${window.location.origin}/qr/${qrCode.id}`;

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 space-y-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/6 aspect-[2/3] relative rounded-lg overflow-hidden">
                  <img
                    src={qrCode.cover_image || "/placeholder.svg"}
                    alt={qrCode.book_title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl">{qrCode.book_title}</CardTitle>
                    <p className="text-lg text-muted-foreground mt-2">
                      by {qrCode.author?.name || 'Unknown Author'}
                    </p>
                  </div>

                  {qrCode.author?.bio && (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground">{qrCode.author.bio}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {qrCode.publisher && (
                      <p className="text-sm">
                        <span className="font-medium">Publisher:</span> {qrCode.publisher}
                      </p>
                    )}
                    {qrCode.isbn && (
                      <p className="text-sm">
                        <span className="font-medium">ISBN:</span> {qrCode.isbn}
                      </p>
                    )}
                    {qrCode.release_date && (
                      <p className="text-sm">
                        <span className="font-medium">Release Date:</span>{' '}
                        {format(new Date(qrCode.release_date), 'PPP')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <Card className="mt-8">
                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <TipAmountSelector
                        amount={amount}
                        customAmount={customAmount}
                        onAmountChange={setAmount}
                        onCustomAmountChange={setCustomAmount}
                      />

                      <TipMessageForm
                        name={name}
                        message={message}
                        onNameChange={setName}
                        onMessageChange={setMessage}
                      />

                      <PaymentForm
                        isLoading={isLoading}
                        amount={amount}
                        customAmount={customAmount}
                        onSubmit={handleSubmit}
                      />
                    </form>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

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
