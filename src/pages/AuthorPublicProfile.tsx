
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";
import { TipHistory } from "@/components/TipHistory";
import { AuthorQRCodes } from "@/components/AuthorQRCodes";
import { useState, useEffect } from "react";
import { QRCodeDialog } from "@/components/qr/QRCodeDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

const AuthorPublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [selectedQRCode, setSelectedQRCode] = useState<{ id: string; bookTitle: string } | null>(null);
  const { toast } = useToast();

  // Add session check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session check error:', error);
        toast({
          title: "Session Error",
          description: "There was an error checking your session. Please try logging in again.",
          variant: "destructive"
        });
      }
    };

    checkSession();
  }, [toast]);

  const { data: author, isLoading, error } = useQuery({
    queryKey: ['author', id],
    queryFn: async () => {
      if (!id) throw new Error('Author identifier is required');
      
      try {
        // First try UUID lookup
        if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .eq('role', 'author')
            .maybeSingle();

          if (!error && data) return data;
        }

        // Then try name lookup
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'author')
          .ilike('name', id.replace(/-/g, ' '))
          .maybeSingle();

        if (error) {
          console.error('Error fetching author:', error);
          throw error;
        }
        if (!data) throw new Error('Author not found');
        
        return data;
      } catch (error) {
        console.error('Error fetching author:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

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
          console.error('Error fetching QR code:', error);
        }
      };
      
      fetchQRCode();
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
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

  const socialLinks = author.social_links ? 
    (author.social_links as { url: string; label: string }[]) : 
    [];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 space-y-8">
        <AuthorPublicProfileView
          name={author.name || 'Anonymous Author'}
          bio={author.bio || 'No bio available'}
          imageUrl={author.avatar_url || "/placeholder.svg"}
          authorId={author.id}
          socialLinks={socialLinks}
        />
        
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Books</h2>
          <AuthorQRCodes 
            authorId={author.id} 
            authorName={author.name || 'Anonymous Author'} 
          />
        </div>
        
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Tip History</h2>
          <TipHistory 
            authorId={author.id}
            authorName={author.name || 'Anonymous Author'}
            isDashboard={false}
          />
        </div>

        <QRCodeDialog
          isOpen={!!selectedQRCode}
          onClose={() => setSelectedQRCode(null)}
          selectedQRCode={selectedQRCode}
          authorId={author.id}
        />
      </main>
    </div>
  );
};

export default AuthorPublicProfile;
