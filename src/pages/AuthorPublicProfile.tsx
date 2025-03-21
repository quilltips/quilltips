
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useEffect, useState } from "react";
import { QRCodeDialog } from "@/components/qr/QRCodeDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { AuthorProfileHeader } from "@/components/author/AuthorProfileHeader";
import { AuthorProfileContent } from "@/components/author/AuthorProfileContent";
import { supabase } from "@/integrations/supabase/client";
import { usePublicProfile } from "@/hooks/use-public-profile";

const AuthorPublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedQRCode, setSelectedQRCode] = useState<{ id: string; bookTitle: string } | null>(null);

  // Using the updated hook that doesn't require authentication but works with the profiles table
  const { data: author, isLoading, error } = usePublicProfile(id);

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
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-semibold text-red-500">
            {error instanceof Error ? error.message : 'Author not found'}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 space-y-8">
        <AuthorProfileHeader author={author} />
        <AuthorProfileContent 
          authorId={author.id} 
          authorName={author.name || 'Anonymous Author'} 
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
    </div>
  );
};

export default AuthorPublicProfile;
