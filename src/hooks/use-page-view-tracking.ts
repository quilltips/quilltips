
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const getVisitorId = (): string => {
  try {
    const key = "qt_visitor_id";
    const stored = localStorage.getItem(key);
    if (stored) return stored;
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(key, id);
    return id;
  } catch {
    // localStorage or crypto may be unavailable (e.g. mobile Safari private mode)
    return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
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

        if (error && error.code !== '23505') {
          // Ignore unique constraint violations (duplicate views) - only log real errors
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
