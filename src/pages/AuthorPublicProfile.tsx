
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { useEffect, useState } from "react";
import { QRCodeDialog } from "@/components/qr/QRCodeDialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { AuthorProfileHeader } from "@/components/author/AuthorProfileHeader";
import { AuthorProfileContent } from "@/components/author/AuthorProfileContent";
import { transformSocialLinks, type AuthorProfile } from "@/types/author";
import type { PublicProfileResponse } from "@/types/public-profile";

const AuthorPublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedQRCode, setSelectedQRCode] = useState<{ id: string; bookTitle: string } | null>(null);

  const { data: author, isLoading, error } = useQuery({
    queryKey: ['author-public-profile', id],
    queryFn: async () => {
      if (!id) throw new Error('Author identifier is required');

      try {
        // First try UUID lookup in public_profiles
        if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
          const { data: uuidData, error: uuidError } = await supabase
            .from('public_profiles')
            .select('id, name, bio, avatar_url, social_links, created_at')
            .eq('id', id)
            .maybeSingle();

          if (!uuidError && uuidData) {
            // Transform social links if needed and return
            return {
              ...uuidData,
              social_links: Array.isArray(uuidData.social_links) 
                ? uuidData.social_links.map((link: any) => ({
                    url: String(link.url || ''),
                    label: String(link.label || 'Link')
                  }))
                : null,
              role: 'author' // Adding role to match existing interface
            } as AuthorProfile;
          }
        }

        // Then try name lookup
        const { data: nameData, error: nameError } = await supabase
          .from('public_profiles')
          .select('id, name, bio, avatar_url, social_links, created_at')
          .ilike('name', id.replace(/-/g, ' '))
          .maybeSingle();

        if (nameError) throw nameError;
        if (!nameData) throw new Error('Author not found');

        // Transform the data to match our expected format
        return {
          ...nameData,
          social_links: Array.isArray(nameData.social_links) 
            ? nameData.social_links.map((link: any) => ({
                url: String(link.url || ''),
                label: String(link.label || 'Link')
              }))
            : null,
          role: 'author' // Adding role to match existing interface
        } as AuthorProfile;
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
