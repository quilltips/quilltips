
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { qrCodeQueryKeys } from "./use-qr-code-details-page";

// Helper function to check if string is a UUID
const isUUID = (str: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const useQRCodeFetch = () => {
  const { id, bookSlug } = useParams<{ id?: string; bookSlug?: string }>();
  const identifier = id || bookSlug;
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showPublisherInvite, setShowPublisherInvite] = useState(false);

  const { data: qrCode, isLoading: qrCodeLoading } = useQuery({
    queryKey: qrCodeQueryKeys.detail(identifier || ''),
    queryFn: async () => {
      if (!identifier) throw new Error('No QR code identifier provided');
      
      let qrData, qrError;
      
      const selectQuery = `
        *,
        author:public_profiles!author_id (
          id,
          name,
          avatar_url,
          bio,
          slug,
          stripe_account_id,
          stripe_setup_complete,
          arc_signup_description,
          beta_reader_description,
          newsletter_description,
          book_club_description,
          social_links
        )
      `;
      
      if (isUUID(identifier)) {
        // Fetch by UUID
        ({ data: qrData, error: qrError } = await supabase
          .from('qr_codes')
          .select(selectQuery)
          .eq('id', identifier)
          .maybeSingle());
      } else {
        // Fetch by slug
        ({ data: qrData, error: qrError } = await supabase
          .from('qr_codes')
          .select(selectQuery)
          .eq('slug', identifier)
          .maybeSingle());
      }

      if (qrError) throw qrError;
      if (!qrData) throw new Error('QR code not found');
      
      // Fetch author's other books
      const { data: otherBooks } = await supabase
        .from('qr_codes')
        .select('id, book_title, cover_image, slug')
        .eq('author_id', qrData.author_id)
        .order('created_at', { ascending: false });
      
      // Fetch author's recommendations
      const { data: recommendations } = await supabase
        .from('author_book_recommendations')
        .select('*')
        .eq('qr_code_id', qrData.id)
        .order('display_order', { ascending: true });

      // Enrich recommendations with slugs for platform-linked books
      let enrichedRecommendations = recommendations || [];
      const recQrCodeIds = (recommendations || [])
        .map((r: any) => r.recommended_qr_code_id)
        .filter(Boolean);

      if (recQrCodeIds.length > 0) {
        const { data: recBooks } = await supabase
          .from('qr_codes')
          .select('id, slug, cover_image')
          .in('id', recQrCodeIds);

        const bookMap = new Map((recBooks || []).map((b: any) => [b.id, b]));
        enrichedRecommendations = (recommendations || []).map((r: any) => ({
          ...r,
          recommended_book_slug: r.recommended_qr_code_id ? bookMap.get(r.recommended_qr_code_id)?.slug : null,
          recommended_book_cover_url: r.recommended_qr_code_id
            ? (bookMap.get(r.recommended_qr_code_id)?.cover_image || r.recommended_book_cover_url)
            : r.recommended_book_cover_url,
        }));
      }

      console.log("QRCodeFetch: QR code data loaded:", qrData);
      console.log("QRCodeFetch: character_images:", qrData.character_images);
      console.log("QRCodeFetch: character_images count:", Array.isArray(qrData.character_images) ? qrData.character_images.length : 'not an array');
      
      return {
        ...qrData,
        otherBooks: otherBooks || [],
        recommendations: enrichedRecommendations
      };

    },
    staleTime: 60000, // 1 minute stale time
    enabled: !!identifier,
  });

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: "QR Code Created",
        description: "Your QR code has been created successfully!",
      });
      setShowPublisherInvite(true);
    }
  }, [searchParams, toast]);

  return {
    id: identifier,
    qrCode,
    qrCodeLoading,
    showPublisherInvite,
    setShowPublisherInvite
  };
};
