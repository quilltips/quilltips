
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toPng } from "html-to-image";
import { useRef } from "react";

// Define explicit database types
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
};

export type TipData = {
  tips: any[];
  likes: any[];
  comments: any[];
};

export const useQRCodeDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const { data: qrCode, isLoading: qrLoading } = useQuery({
    queryKey: ['qr-code', id],
    queryFn: async () => {
      if (!id) throw new Error('QR code ID is required');
      
      const { data, error } = await supabase
        .from('qr_codes')
        .select('id, author_id, book_title, publisher, release_date, isbn, cover_image, total_tips, total_amount, average_tip, last_tip_date')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as QRCode;
    }
  });

  const { data: tipData } = useQuery({
    queryKey: ['qr-tips', id],
    queryFn: async () => {
      if (!id) return { tips: [], likes: [], comments: [] };

      const { data: tips, error: tipsError } = await supabase
        .from('tips')
        .select('id, amount, message, created_at, author_id, qr_code_id')
        .eq('qr_code_id', id);
      if (tipsError) throw tipsError;

      const { data: likes, error: likesError } = await supabase
        .from('tip_likes')
        .select('id, tip_id, author_id, created_at')
        .eq('tip_id', id);
      if (likesError) throw likesError;

      const { data: comments, error: commentsError } = await supabase
        .from('tip_comments')
        .select('id, tip_id, author_id, content, created_at')
        .eq('tip_id', id);
      if (commentsError) throw commentsError;

      return {
        tips: tips || [],
        likes: likes || [],
        comments: comments || []
      } as TipData;
    },
    enabled: !!id
  });

  const handleDownloadQR = async () => {
    if (!qrCodeRef.current) {
      console.error('QR code element not found');
      return;
    }

    try {
      const dataUrl = await toPng(qrCodeRef.current, { 
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: null, // Transparent background
        style: {
          borderRadius: '8px', // Ensure rounded corners in export
        }
      });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || 'download'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating QR code image:', error);
    }
  };

  return {
    id,
    qrCode,
    qrLoading,
    tipData,
    handleDownloadQR,
    qrCodeRef
  };
};
