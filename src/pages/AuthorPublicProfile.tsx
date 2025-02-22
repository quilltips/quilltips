
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";
import { TipHistory } from "@/components/TipHistory";
import { AuthorQRCodes } from "@/components/AuthorQRCodes";
import { useEffect, useState } from "react";
import { QRCodeDialog } from "@/components/qr/QRCodeDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

// Use the same SocialLink type as AuthorPublicProfileView component
type SocialLink = {
  url: string;
  label: string;
};

interface AuthorProfile {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  social_links: SocialLink[] | null;
  role: string;
}

const AuthorPublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedQRCode, setSelectedQRCode] = useState<{ id: string; bookTitle: string } | null>(null);

  const { data: author, isLoading, error } = useQuery({
    queryKey: ['author-profile', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Author identifier is required');
      }

      console.log('Fetching author profile for ID:', id);
      
      try {
        // First try UUID lookup
        if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
          console.log('Attempting UUID lookup');
          const { data: uuidData, error: uuidError } = await supabase
            .from('profiles')
            .select('id, name, bio, avatar_url, social_links, role')
            .eq('id', id)
            .eq('role', 'author')
            .maybeSingle();

          if (!uuidError && uuidData) {
            console.log('Found author by UUID:', uuidData);
            // Transform social_links to match expected format if needed
            const transformedData = {
              ...uuidData,
              social_links: uuidData.social_links ? uuidData.social_links.map((link: any) => ({
                url: link.url,
                label: link.platform || link.label
              })) : []
            };
            return transformedData as AuthorProfile;
          }
        }

        // Then try name lookup if UUID fails or isn't provided
        console.log('Attempting name lookup');
        const { data: nameData, error: nameError } = await supabase
          .from('profiles')
          .select('id, name, bio, avatar_url, social_links, role')
          .eq('role', 'author')
          .ilike('name', id.replace(/-/g, ' '))
          .maybeSingle();

        if (nameError) {
          console.error('Error fetching author by name:', nameError);
          throw nameError;
        }

        if (!nameData) {
          console.error('Author not found');
          throw new Error('Author not found');
        }

        // Transform social_links to match expected format if needed
        const transformedData = {
          ...nameData,
          social_links: nameData.social_links ? nameData.social_links.map((link: any) => ({
            url: link.url,
            label: link.platform || link.label
          })) : []
        };

        console.log('Found author by name:', transformedData);
        return transformedData as AuthorProfile;
      } catch (error) {
        console.error('Error fetching author:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    if (error) {
      console.error('Query error:', error);
      toast({
        title: "Error loading profile",
        description: error instanceof Error ? error.message : "Failed to load author profile",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [error, toast, navigate]);

  // Handle QR code from URL params
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
        <AuthorPublicProfileView
          name={author.name || 'Anonymous Author'}
          bio={author.bio || 'No bio available'}
          imageUrl={author.avatar_url || "/placeholder.svg"}
          authorId={author.id}
          socialLinks={author.social_links || []}
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
