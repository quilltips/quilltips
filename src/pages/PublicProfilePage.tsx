
import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { QRCodeDialog } from "@/components/qr/QRCodeDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { AuthorProfileHeader } from "@/components/author/AuthorProfileHeader";
import { AuthorProfileContent } from "@/components/author/AuthorProfileContent";
import { supabase } from "@/integrations/supabase/client";
import { usePublicProfile } from "@/hooks/use-public-profile";
import { Layout } from "@/components/Layout";

const PublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [selectedQRCode, setSelectedQRCode] = useState<{ id: string; bookTitle: string } | null>(null);
  const [stripeSetupInfo, setStripeSetupInfo] = useState<{ 
    hasStripeAccount: boolean; 
    stripeSetupComplete: boolean 
  }>({
    hasStripeAccount: false,
    stripeSetupComplete: false
  });

  const { data: author, isLoading, error } = usePublicProfile(id);

  // Fetch the author's Stripe setup info
  useEffect(() => {
    const fetchStripeSetupInfo = async () => {
      if (!author?.id) return;
      
      try {
        // Fetch the stripe setup info from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('stripe_account_id, stripe_setup_complete')
          .eq('id', author.id)
          .single();
        
        if (error) throw error;
        
        setStripeSetupInfo({
          hasStripeAccount: !!data?.stripe_account_id,
          stripeSetupComplete: !!data?.stripe_setup_complete
        });
      } catch (err) {
        console.error("Error fetching stripe setup info:", err);
        // Don't show an error to the user, just default to not showing books
      }
    };
    
    fetchStripeSetupInfo();
  }, [author]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading profile",
        description: error instanceof Error ? error.message : "Failed to load author profile",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  useEffect(() => {
    const qrId = searchParams.get('qr');
    const autoOpenTip = searchParams.get('autoOpenTip');

    if (qrId && autoOpenTip === 'true') {
      const fetchQRCode = async () => {
        try {
          const { data: qrCode, error } = await supabase
            .from('qr_codes')
            .select('id, book_title')
            .eq('id', qrId)
            .single();

          if (error) throw error;
          if (qrCode) {
            setSelectedQRCode({
              id: qrCode.id,
              bookTitle: qrCode.book_title
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Could not load QR code details",
            variant: "destructive"
          });
        }
      };

      fetchQRCode();
    }
  }, [searchParams, toast]);

  if (isLoading) {
    return (
      
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      
    );
  }

  if (error || !author) {
    return (
      
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
          <h1 className="text-2xl font-semibold text-red-500">
            {error instanceof Error ? error.message : 'Author not found'}
          </h1>
        </div>
      
    );
  }

  return (
    
      <main className="w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AuthorProfileHeader author={author} />
        <AuthorProfileContent 
          authorId={author.id} 
          authorName={author.name || 'Anonymous Author'}
          hasStripeAccount={stripeSetupInfo.hasStripeAccount}
          stripeSetupComplete={stripeSetupInfo.stripeSetupComplete}
        />

        {selectedQRCode && (
          <QRCodeDialog
            isOpen={!!selectedQRCode}
            onClose={() => setSelectedQRCode(null)}
            selectedQRCode={selectedQRCode}
            authorId={author.id}
          />
        )}
      </main>
    
  );
};

export default PublicProfilePage;
