
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";
import { TipHistory } from "@/components/TipHistory";
import { AuthorQRCodes } from "@/components/AuthorQRCodes";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { QRCodeDialog } from "@/components/qr/QRCodeDialog";

const AuthorPublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [selectedQRCode, setSelectedQRCode] = useState<{ id: string; bookTitle: string } | null>(null);

  const { data: author, isLoading, error } = useQuery({
    queryKey: ['author', id],
    queryFn: async () => {
      if (!id) throw new Error('Author identifier is required');
      
      // Try to fetch by ID first (for backward compatibility)
      if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        const { data, error } = await supabase
          .from('profiles')
          .select()
          .eq('id', id)
          .eq('role', 'author')
          .maybeSingle();

        if (!error && data) return data;
      }

      // If not found by ID or not a UUID, try to find by name
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('role', 'author')
        .ilike('name', id.replace(/-/g, ' '))
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Author not found');
      return data;
    },
    retry: false
  });

  // Handle auto-opening the tip dialog
  useEffect(() => {
    const qrId = searchParams.get('qr');
    const autoOpenTip = searchParams.get('autoOpenTip');
    
    if (qrId && autoOpenTip === 'true') {
      const fetchQRCode = async () => {
        const { data: qrCode } = await supabase
          .from('qr_codes')
          .select('id, book_title')
          .eq('id', qrId)
          .single();
          
        if (qrCode) {
          setSelectedQRCode({
            id: qrCode.id,
            bookTitle: qrCode.book_title
          });
        }
      };
      
      fetchQRCode();
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-semibold">
            {error?.message || 'Author not found'}
          </h1>
        </div>
      </div>
    );
  }

  // Convert the social_links from JSON to the expected format
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
          <TipHistory 
            authorId={author.id}
            authorName={author.name || 'Anonymous Author'}
            isDashboard={false}
          />
        </div>

        {/* QR Code Dialog */}
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
