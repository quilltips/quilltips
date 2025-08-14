
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
      
      if (isUUID(identifier)) {
        // Fetch by UUID
        ({ data: qrData, error: qrError } = await supabase
          .from('qr_codes')
          .select(`
            *,
            author:public_profiles!author_id (
              name,
              avatar_url,
              bio,
              stripe_account_id,
              stripe_setup_complete
            )
          `)
          .eq('id', identifier)
          .maybeSingle());
      } else {
        // Fetch by slug
        ({ data: qrData, error: qrError } = await supabase
          .from('qr_codes')
          .select(`
            *,
            author:public_profiles!author_id (
              name,
              avatar_url,
              bio,
              stripe_account_id,
              stripe_setup_complete
            )
          `)
          .eq('slug', identifier)
          .maybeSingle());
      }

      if (qrError) throw qrError;
      if (!qrData) throw new Error('QR code not found');
      console.log("QRCodeFetch: QR code data loaded:", qrData);
      return qrData;
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
