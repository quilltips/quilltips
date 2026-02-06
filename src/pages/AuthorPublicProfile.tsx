import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { QRCodeDialog } from "@/components/qr/QRCodeDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { AuthorProfileHeader } from "@/components/author/AuthorProfileHeader";
import { AuthorProfileContent } from "@/components/author/AuthorProfileContent";
import { supabase } from "@/integrations/supabase/client";
import { usePublicProfile } from "@/hooks/use-public-profile";
import { usePageViewTracking } from "@/hooks/use-page-view-tracking";

const AuthorPublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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

  // Track page view for this author profile
  usePageViewTracking({
    authorId: author?.id,
    pageType: "profile",
  });

  // Fetch the author's Stripe setup info
  useEffect(() => {
    const fetchStripeSetupInfo = async () => {
      if (!author?.id) return;
      
      try {
        const { data, error } = await supabase.rpc('get_public_profile_by_id', { 
          profile_id: author.id 
        });

        if (error) throw error;
        
        if (data && data.length > 0) {
          const { data: stripeData, error: stripeError } = await supabase
            .from('profiles')
            .select('stripe_account_id, stripe_setup_complete')
            .eq('id', author.id)
            .single();
          
          if (stripeError) throw stripeError;
          
          setStripeSetupInfo({
            hasStripeAccount: !!stripeData?.stripe_account_id,
            stripeSetupComplete: !!stripeData?.stripe_setup_complete
          });
        }
      } catch (err) {
        console.error("Error fetching stripe setup info:", err);
        // No need to toast user for stripe info errors
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
      navigate('/');
    }
  }, [error, toast, navigate]);

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
      <div className="container mx-auto px-4 pt-8 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="container mx-auto px-4 pt-8 text-center">
        <h1 className="text-2xl font-semibold text-red-500">
          {error instanceof Error ? error.message : 'Author not found'}
        </h1>
      </div>
    );
  }

  return (
    <>
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
          stripeSetupComplete={stripeSetupInfo.stripeSetupComplete}
          hasStripeAccount={stripeSetupInfo.hasStripeAccount}
        />
      )}
    </>
  );
};

export default AuthorPublicProfile;
