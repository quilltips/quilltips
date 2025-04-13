
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { qrCodeQueryKeys } from "./use-qr-code-details-page";

export const useQRCodeFetch = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showPublisherInvite, setShowPublisherInvite] = useState(false);

  const { data: qrCode, isLoading: qrCodeLoading } = useQuery({
    queryKey: qrCodeQueryKeys.detail(id || ''),
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
      console.log("QRCodeFetch: QR code data loaded:", qrData);
      return qrData;
    },
    staleTime: 60000, // 1 minute stale time
    enabled: !!id,
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
    id,
    qrCode,
    qrCodeLoading,
    showPublisherInvite,
    setShowPublisherInvite
  };
};
