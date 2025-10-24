import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toPng, toSvg } from "html-to-image";
import { useRef, useEffect, useState, useCallback } from "react";
import { useToast } from "./use-toast";

export type QRCode = {
  id: string;
  author_id: string;
  book_title: string;
  publisher: string | null;
  release_date: string | null;
  isbn: string | null;
  cover_image: string | null;
  total_tips: number | null;
  total_amount: number | null;
  average_tip: number | null;
  last_tip_date: string | null;
  is_paid: boolean;
  author?: {
    name: string | null;
    avatar_url: string | null;
    bio: string | null;
  };
};

export type TipData = {
  tips: any[];
  likes: any[];
  comments: any[];
};

export const qrCodeQueryKeys = {
  all: ['qr-codes'] as const,
  list: () => [...qrCodeQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...qrCodeQueryKeys.all, 'detail', id] as const,
  tips: (id: string) => [...qrCodeQueryKeys.all, 'tips', id] as const,
};

export const useQRCodeDetailsPage = () => {
  const { id, bookSlug } = useParams<{ id?: string; bookSlug?: string }>();
  const identifier = id || bookSlug;
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const BUCKET_NAME = 'covers';

  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  
  const refreshImage = useCallback(() => {
    console.log('Refreshing image with new key');
    setImageRefreshKey(Date.now());
  }, []);

  const { data: qrCode, isLoading: qrLoading } = useQuery({
    queryKey: qrCodeQueryKeys.detail(identifier || ''),
    queryFn: async () => {
      if (!identifier) throw new Error('QR code identifier is required');
      
      // Helper function to check if string is a UUID
      const isUUID = (str: string): boolean => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      };

      let data, error;
      
      if (isUUID(identifier)) {
        // Fetch by UUID
        ({ data, error } = await supabase
          .from('qr_codes')
          .select(`
            id, 
            author_id, 
            book_title, 
            publisher, 
            release_date, 
            isbn, 
            cover_image, 
            total_tips, 
            total_amount, 
            average_tip, 
            last_tip_date, 
            is_paid,
            author:public_profiles!author_id (
              name,
              avatar_url,
              bio
            )
          `)
          .eq('id', identifier)
          .maybeSingle());
      } else {
        // Fetch by slug
        ({ data, error } = await supabase
          .from('qr_codes')
          .select(`
            id, 
            author_id, 
            book_title, 
            publisher, 
            release_date, 
            isbn, 
            cover_image, 
            total_tips, 
            total_amount, 
            average_tip, 
            last_tip_date, 
            is_paid,
            author:public_profiles!author_id (
              name,
              avatar_url,
              bio
            )
          `)
          .eq('slug', identifier)
          .maybeSingle());
      }

      if (error) {
        console.error("Error fetching QR code:", error);
        throw error;
      }
      
      console.log("QR Code data fetched:", data);
      return data as QRCode;
    },
    staleTime: 0,
    enabled: !!identifier,
  });

  const { mutateAsync: updateCoverImage } = useMutation({
    mutationFn: async (imageUrl: string) => {
      if (!qrCode?.id) {
        console.error("QRCodeDetailsPage: No QR code ID available");
        throw new Error('QR code must be loaded first');
      }
      
      console.log(`Updating cover image for QR code ${qrCode.id} to: ${imageUrl}`);
      
      const { data, error } = await supabase
        .from('qr_codes')
        .update({ cover_image: imageUrl })
        .eq('id', qrCode.id)
        .select();
      
      if (error) {
        console.error("Database update error:", error);
        throw error;
      }
      
      return data;
    },
    onMutate: async (newImageUrl) => {
      await queryClient.cancelQueries({ queryKey: qrCodeQueryKeys.detail(identifier || '') });
      
      const previousQRCode = queryClient.getQueryData(qrCodeQueryKeys.detail(identifier || ''));
      
      queryClient.setQueryData(qrCodeQueryKeys.detail(identifier || ''), (old: any) => ({
        ...old,
        cover_image: newImageUrl
      }));
      
      return { previousQRCode };
    },
    onSuccess: (data) => {
      console.log("Cover image updated successfully:", data);
      
      queryClient.invalidateQueries({ queryKey: qrCodeQueryKeys.all });
      
      refreshImage();
      
      toast({
        title: "Success",
        description: "Book cover image has been updated successfully.",
      });
    },
    onError: (error, _, context) => {
      console.error("Error updating cover image:", error);
      
      if (context?.previousQRCode) {
        queryClient.setQueryData(qrCodeQueryKeys.detail(identifier || ''), context.previousQRCode);
      }
      
      toast({
        title: "Update Error",
        description: error instanceof Error ? error.message : "Failed to update cover image",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qrCodeQueryKeys.all });
    }
  });

  const { data: tipData } = useQuery({
    queryKey: qrCodeQueryKeys.tips(qrCode?.id || ''),
    queryFn: async () => {
      if (!qrCode?.id) return { tips: [], likes: [], comments: [] };

      const { data: tips, error: tipsError } = await supabase
        .from('tips')
        .select('id, amount, message, created_at, author_id, qr_code_id')
        .eq('qr_code_id', qrCode.id);
      if (tipsError) throw tipsError;

      const { data: likes, error: likesError } = await supabase
        .from('tip_likes')
        .select('id, tip_id, author_id, created_at')
        .eq('tip_id', qrCode.id);
      if (likesError) throw likesError;

      const { data: comments, error: commentsError } = await supabase
        .from('tip_comments')
        .select('id, tip_id, author_id, content, created_at')
        .eq('tip_id', qrCode.id);
      if (commentsError) throw commentsError;

      return {
        tips: tips || [],
        likes: likes || [],
        comments: comments || []
      } as TipData;
    },
    enabled: !!qrCode?.id
  });

  const handleDownloadSVG = async () => {
    if (!qrCodeRef.current) {
      console.error('QR code element not found');
      return;
    }

    try {
      const svgDataUrl = await toSvg(qrCodeRef.current, { 
        cacheBust: true,
        backgroundColor: null,
        style: {
          borderRadius: '8px',
        }
      });
      
      const link = document.createElement('a');
      link.href = svgDataUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || 'download'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating SVG QR code image:', error);
    }
  };

  const handleDownloadPNG = async () => {
    if (!qrCodeRef.current) {
      console.error('QR code element not found');
      return;
    }

    try {
      const pngDataUrl = await toPng(qrCodeRef.current, { 
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: null,
        style: {
          borderRadius: '8px',
        }
      });
      
      const link = document.createElement('a');
      link.href = pngDataUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || 'download'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PNG QR code image:', error);
    }
  };

  return {
    id: identifier,
    qrCode,
    qrLoading,
    handleDownloadSVG,
    handleDownloadPNG,
    qrCodeRef,
    updateCoverImage,
    imageRefreshKey,
    refreshImage,
  };
};
