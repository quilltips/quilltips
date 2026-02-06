
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const getVisitorId = (): string => {
  const key = "qt_visitor_id";
  let visitorId = localStorage.getItem(key);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(key, visitorId);
  }
  return visitorId;
};

interface UsePageViewTrackingOptions {
  authorId: string | undefined;
  qrCodeId?: string | undefined;
  pageType: "book" | "profile";
}

export const usePageViewTracking = ({ authorId, qrCodeId, pageType }: UsePageViewTrackingOptions) => {
  useEffect(() => {
    if (!authorId) return;

    const visitorId = getVisitorId();

    const trackView = async () => {
      try {
        const { error } = await supabase
          .from("page_views")
          .insert({
            author_id: authorId,
            qr_code_id: qrCodeId || null,
            page_type: pageType,
            visitor_id: visitorId,
          });

        if (error) {
          console.error("Error tracking page view:", error);
        }
      } catch (err) {
        // Silently fail - tracking should never break the user experience
        console.error("Page view tracking error:", err);
      }
    };

    trackView();
  }, [authorId, qrCodeId, pageType]);
};
