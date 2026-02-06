import { format } from "date-fns";
import { Card } from "../ui/card";
import { RefObject, useRef, useState, useEffect } from "react";
import { StyledQRCode } from "./StyledQRCode";
import { QRCodeDownloadOptions } from "./QRCodeDownloadOptions";
import { toPng } from "html-to-image";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useQRCheckout } from "@/hooks/use-qr-checkout";
import { ShoppingCart, Share2, Edit, Save, X, ExternalLink } from "lucide-react";
import { generateBrandedQRCodeSVG } from "./generateBrandedQRCodeSVG";
import { OptimizedImage } from "../ui/optimized-image";
import { BookCoverUpload } from "./BookCoverUpload";
import { useQRCodeDetailsPage, qrCodeQueryKeys } from "@/hooks/use-qr-code-details-page";
import { supabase } from "@/integrations/supabase/client";
import { EnhancementsManager } from "../book/EnhancementsManager";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getAuthorUrl } from "@/lib/url-utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronRight } from "lucide-react";

interface QRCodeStats {
  total_tips: number | null;
  total_amount: number | null;
  average_tip: number | null;
  last_tip_date: string | null;
}

interface QRCodeStatsCardProps {
  qrCode: {
    id: string;
    author_id: string;
    book_title: string;
    slug?: string | null;
    is_paid?: boolean;
    cover_image?: string | null;
    publisher?: string | null;
    isbn?: string | null;
    release_date?: string | null;
    buy_now_link?: string | null;
    thank_you_video_url?: string | null;
    thank_you_video_thumbnail?: string | null;
    video_title?: string | null;
    video_description?: string | null;
    book_description?: string | null;
    character_images?: any;
    book_videos?: any;
    letter_to_readers?: string | null;
    arc_signup_enabled?: boolean | null;
    beta_reader_enabled?: boolean | null;
    newsletter_enabled?: boolean | null;
    book_club_enabled?: boolean | null;
    recommendations?: any[];
    tipping_enabled?: boolean;
  } & QRCodeStats;
  qrCodeRef?: RefObject<HTMLDivElement>;
}

export const QRCodeStatsCard = ({ qrCode, qrCodeRef }: QRCodeStatsCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isPaid = qrCode.is_paid !== false;

  const { data: bookActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['book-activity', qrCode.id],
    queryFn: async () => {
      const [viewsResult, tipsResult] = await Promise.all([
        supabase.from('page_views').select('id', { count: 'exact', head: true }).eq('qr_code_id', qrCode.id).eq('page_type', 'book'),
        supabase.from('tips').select('id, message').eq('qr_code_id', qrCode.id),
      ]);
      const totalViews = viewsResult.count ?? 0;
      const tips = tipsResult.data || [];
      const totalMessages = tips.filter(t => t.message && String(t.message).trim().length > 0).length;
      return { totalViews, totalMessages, totalTips: tips.length };
    },
    enabled: !!qrCode.id,
  });
  const { isCheckingOut, handleCheckout } = useQRCheckout({
    qrCodeId: qrCode.id,
    bookTitle: qrCode.book_title
  });
  const { updateCoverImage, imageRefreshKey, id } = useQRCodeDetailsPage();
  
  const [isEditingBuyNow, setIsEditingBuyNow] = useState(false);
  const [buyNowLinkInput, setBuyNowLinkInput] = useState(qrCode.buy_now_link || "");
  const [isSaving, setIsSaving] = useState(false);

  // Book description inline edit state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState(qrCode.book_description || "");
  const [isDescSaving, setIsDescSaving] = useState(false);

  const downloadRef = useRef<HTMLDivElement>(null);

  // Sync buyNowLinkInput when qrCode.buy_now_link changes
  useEffect(() => {
    if (!isEditingBuyNow) {
      setBuyNowLinkInput(qrCode.buy_now_link || "");
    }
  }, [qrCode.buy_now_link, isEditingBuyNow]);

  // Sync descriptionInput when qrCode.book_description changes
  useEffect(() => {
    if (!isEditingDescription) {
      setDescriptionInput(qrCode.book_description || "");
    }
  }, [qrCode.book_description, isEditingDescription]);

  // Use slug if available, fallback to old format for backward compatibility
  const bookSlug = qrCode.slug || qrCode.book_title.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
  const qrUrl = bookSlug ? 
    `${window.location.origin}/book/${bookSlug}` : 
    `${window.location.origin}/qr/${qrCode.id}`;
  const authorProfileUrl = `${window.location.origin}${getAuthorUrl({ id: qrCode.author_id })}`;

  const handleDownloadSVG = async () => {
    if (!isPaid) {
      toast({
        title: "QR Code not purchased",
        description: "You need to purchase this QR code before you can download it.",
        variant: "destructive"
      });
      return;
    }

    try {
      const svgUrl = await generateBrandedQRCodeSVG({
        url: qrUrl,
        bookTitle: qrCode.book_title
      });

      const link = document.createElement("a");
      link.href = svgUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || "download"}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating SVG QR code:", error);
      toast({
        title: "SVG Download Failed",
        description: "Something went wrong generating your SVG.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPNG = async () => {
    if (!isPaid) {
      toast({
        title: "QR Code not purchased",
        description: "You need to purchase this QR code before you can download it.",
        variant: "destructive"
      });
      return;
    }

    if (!downloadRef?.current) return;

    try {
      const pngDataUrl = await toPng(downloadRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        backgroundColor: null
      });

      const link = document.createElement("a");
      link.href = pngDataUrl;
      link.download = `quilltips-qr-${qrCode?.book_title || "download"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating PNG QR code image:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code for ${qrCode?.book_title}`,
          text: 'Check out my QR code on Quilltips!',
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleSaveBuyNowLink = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ buy_now_link: buyNowLinkInput || null })
        .eq('id', qrCode.id);

      if (error) throw error;

      if (id) {
        queryClient.setQueryData(qrCodeQueryKeys.detail(id), (old: any) => ({
          ...old,
          buy_now_link: buyNowLinkInput || null
        }));
      }

      queryClient.invalidateQueries({ queryKey: qrCodeQueryKeys.detail(id || '') });
      queryClient.invalidateQueries({ queryKey: qrCodeQueryKeys.all });

      toast({
        title: "Success",
        description: "Buy now link updated successfully",
      });

      setIsEditingBuyNow(false);
    } catch (error) {
      console.error("Error updating buy now link:", error);
      toast({
        title: "Error",
        description: "Failed to update buy now link",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setBuyNowLinkInput(qrCode.buy_now_link || "");
    setIsEditingBuyNow(false);
  };

  const handleSaveDescription = async () => {
    setIsDescSaving(true);
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ book_description: descriptionInput || null })
        .eq('id', qrCode.id);

      if (error) throw error;

      if (id) {
        queryClient.setQueryData(qrCodeQueryKeys.detail(id), (old: any) => ({
          ...old,
          book_description: descriptionInput || null
        }));
      }

      queryClient.invalidateQueries({ queryKey: qrCodeQueryKeys.detail(id || '') });
      queryClient.invalidateQueries({ queryKey: qrCodeQueryKeys.all });

      toast({
        title: "Success",
        description: "Book description updated successfully",
      });

      setIsEditingDescription(false);
    } catch (error) {
      console.error("Error updating book description:", error);
      toast({
        title: "Error",
        description: "Failed to update book description",
        variant: "destructive",
      });
    } finally {
      setIsDescSaving(false);
    }
  };

  const handleCancelDescriptionEdit = () => {
    setDescriptionInput(qrCode.book_description || "");
    setIsEditingDescription(false);
  };

  const handleTippingToggle = async () => {
    const newValue = qrCode.tipping_enabled === false ? true : false;
    
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ tipping_enabled: newValue })
        .eq('id', qrCode.id);

      if (error) throw error;

      if (id) {
        queryClient.setQueryData(qrCodeQueryKeys.detail(id), (old: any) => ({
          ...old,
          tipping_enabled: newValue
        }));
      }

      queryClient.invalidateQueries({ queryKey: qrCodeQueryKeys.detail(id || '') });
      queryClient.invalidateQueries({ queryKey: qrCodeQueryKeys.all });

      toast({
        title: "Tipping setting updated",
        description: newValue 
          ? "Readers can now leave tips for this book" 
          : "Tipping disabled - readers can only send messages",
      });
    } catch (error) {
      console.error("Error updating tipping setting:", error);
      toast({
        title: "Update failed",
        description: "Could not update tipping setting. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
    {/* Content tiles section above the grid */}
    <div className="mb-7">
      <h3 className="text-lg font-semibold text-[#333333] mb-3">Add Content To Your Book Page</h3>
      <EnhancementsManager
        qrCodeId={qrCode.id}
        authorId={qrCode.author_id}
        initialData={{
          thank_you_video_url: qrCode.thank_you_video_url,
          character_images: qrCode.character_images,
          book_videos: qrCode.book_videos,
          letter_to_readers: qrCode.letter_to_readers,
          arc_signup_enabled: qrCode.arc_signup_enabled,
          beta_reader_enabled: qrCode.beta_reader_enabled,
          newsletter_enabled: qrCode.newsletter_enabled,
          book_club_enabled: qrCode.book_club_enabled,
        }}
        recommendations={qrCode.recommendations}
        onUpdate={() => {
          if (id) {
            queryClient.invalidateQueries({ queryKey: qrCodeQueryKeys.detail(id) });
          }
          if (qrCode.id) {
            queryClient.invalidateQueries({ queryKey: ['qr-codes', 'recommendations', qrCode.id] });
          }
          queryClient.invalidateQueries({ queryKey: qrCodeQueryKeys.all });
        }}
      />
    </div>

    <div className="grid xl:grid-cols-[3fr_2fr] gap-7 mx-auto">
      {/* Left side - QR Code, Book Cover, and Book Details */}
      <div className="">
        <Card className="p-4 md:p-7 bg-white shadow-md" style={{ borderColor: '#333333' }}>
          <div className="space-y-8">
            {/* Book Cover with Upload */}
            <div className="space-y-4">
              <div className="aspect-[2/3] rounded-lg overflow-hidden relative max-w-[240px] mx-auto">
                <OptimizedImage
                  key={imageRefreshKey}
                  src={qrCode.cover_image || "/lovable-uploads/logo_nav.svg"}
                  alt={qrCode.book_title}
                  className="w-full h-full"
                  objectFit={qrCode.cover_image ? "cover" : "contain"}
                  fallbackSrc="/lovable-uploads/logo_nav.svg"
                />
                <BookCoverUpload 
                  qrCodeId={qrCode.id}
                  coverImage={qrCode.cover_image}
                  bookTitle={qrCode.book_title}
                  updateCoverImage={updateCoverImage}
                />
              </div>
            </div>

            {/* Book Details */}
            <div className="space-y-2 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-base font-bold">{qrCode.book_title}</p>
                  <Link
                    to={bookSlug ? `/book/${bookSlug}` : `/qr/${qrCode.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=" hover:text-primary transition-colors"
                    title="View public book page"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
                {qrCode.publisher && (
                  <p className="text-base">
                    <span className="font-sm">Publisher:</span> {qrCode.publisher}
                  </p>
                )}
                {qrCode.isbn && (
                  <p className="text-base">
                    <span className="font-sm">ISBN:</span> {qrCode.isbn}
                  </p>
                )}
                 {qrCode.release_date && (
                   <p className="text-base">
                     <span className="font-sm">Release Date:</span>{' '}
                     {format(new Date(qrCode.release_date), 'PPP')}
                   </p>
                 )}
               </div>

               {/* Buy Now Link Edit Section */}
               <div className="space-y-2 pt-2 border-t">
                 <div className="flex items-center justify-between">
                   <span className="text-sm font-medium">Buy Now Link:</span>
                   {!isEditingBuyNow && (
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => setIsEditingBuyNow(true)}
                     >
                       <Edit className="h-3 w-3" />
                     </Button>
                   )}
                 </div>
                 
                 {isEditingBuyNow ? (
                   <div className="space-y-2">
                     <Input
                       value={buyNowLinkInput}
                       onChange={(e) => setBuyNowLinkInput(e.target.value)}
                       placeholder="Enter Amazon or website link"
                       type="url"
                     />
                     <div className="flex gap-2">
                       <Button
                         variant="default"
                         size="sm"
                         onClick={handleSaveBuyNowLink}
                         disabled={isSaving}
                       >
                         <Save className="h-3 w-3 mr-1" />
                         {isSaving ? "Saving..." : "Save"}
                       </Button>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={handleCancelEdit}
                       >
                         <X className="h-3 w-3 mr-1" />
                         Cancel
                       </Button>
                     </div>
                   </div>
                 ) : (
                   <p className="text-sm">
                     {qrCode.buy_now_link ? (
                       <a 
                         href={qrCode.buy_now_link} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-blue-600 hover:underline"
                       >
                         {qrCode.buy_now_link}
                       </a>
                     ) : (
                       <span className="text-sm">No buy now link set</span>
                     )}
                   </p>
                  )}
                </div>

                {/* Book Description Edit Section */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Book Description:</span>
                    {!isEditingDescription && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingDescription(true)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {isEditingDescription ? (
                    <div className="space-y-2">
                      <Textarea
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                        placeholder="Enter a description of your book..."
                        className="min-h-[100px] text-sm"
                        maxLength={2000}
                      />
                      <p className="text-xs text-gray-500">{descriptionInput.length}/2000 characters</p>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSaveDescription}
                          disabled={isDescSaving}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          {isDescSaving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelDescriptionEdit}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">
                      {qrCode.book_description ? (
                        <span className="line-clamp-3">{qrCode.book_description}</span>
                      ) : (
                        <span className="text-sm">No description set</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Tipping Enable/Disable Toggle */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Enable Tipping</span>
                      <p className="text-xs">
                        When disabled, readers can only send messages
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qrCode.tipping_enabled !== false}
                        onChange={handleTippingToggle}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
           </div>
         </Card>
      </div>

      {/* Right side - Share first (white card), then condensed Activity */}
      <div className="space-y-6">
        {/* Share - white background card */}
        <Card className="p-4 md:p-5 bg-white shadow-md">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#333333]">Share</h3>

            {/* Hidden download QR code (used for PNG/SVG export) */}
            <div style={{ position: "absolute", left: "-9999px", top: "0" }}>
              <StyledQRCode
                ref={downloadRef}
                value={qrUrl}
                showBranding={true}
                isPaid={isPaid}
                variant="download"
              />
            </div>

            {/* Small QR code preview - compact card */}
            <div className="flex justify-center">
              <StyledQRCode
                value={qrUrl}
                showBranding={true}
                isPaid={isPaid}
                variant="screen"
                size={80}
              />
            </div>

            <QRCodeDownloadOptions
              onDownloadSVG={handleDownloadSVG}
              onDownloadPNG={handleDownloadPNG}
              disabled={!isPaid}
            />

            <Button 
              variant="secondary" 
              className="w-full border border-[#333333]"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share QR Code
            </Button>

            {/* Book page link */}
            <div className="space-y-1">
              <span className="text-sm font-medium text-[#333333]">Book page</span>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border">
                <input
                  type="text"
                  value={qrUrl}
                  readOnly
                  className="flex-1 text-sm bg-transparent border-none outline-none text-[#333333] min-w-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(qrUrl);
                    toast({
                      title: "Link copied",
                      description: "Your book page link has been copied to clipboard.",
                    });
                  }}
                  className="text-[#333333] hover:text-[#19363C] p-1 shrink-0"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Author profile link */}
            <div className="space-y-1">
              <span className="text-sm font-medium text-[#333333]">Author profile</span>
              <a
                href={authorProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors text-sm text-[#333333]"
              >
                <span className="flex-1 truncate">{authorProfileUrl}</span>
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
            </div>

            {!isPaid && (
              <div className="space-y-2">
                <p className="text-sm text-center text-orange-500">
                  This QR code hasn't been purchased yet. Please complete your purchase to download.
                </p>
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-[#FFD166] hover:bg-[#FFD166]/80 text-[#19363C]"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isCheckingOut ? "Processing..." : "Purchase QR Code"}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Condensed Activity - book-scoped engagement */}
        {activityLoading ? (
          <Card className="p-4 flex justify-center items-center bg-[#19363C] min-h-[100px] rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-[#FFD166]" />
          </Card>
        ) : (
          <Card
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow rounded-lg"
            onClick={() => navigate('/author/data')}
          >
            <div className="p-4 bg-[#19363C] text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-playfair">Activity</h3>
                <ChevronRight className="h-4 w-4 text-white/60" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-0.5 text-center">
                  <div className="text-xl font-bold text-[#FFD166]">{bookActivity?.totalViews ?? 0}</div>
                  <div className="text-xs text-white/80">Views</div>
                </div>
                <div className="space-y-0.5 text-center">
                  <div className="text-xl font-bold text-[#FFD166]">{bookActivity?.totalMessages ?? 0}</div>
                  <div className="text-xs text-white/80">Messages</div>
                </div>
                <div className="space-y-0.5 text-center">
                  <div className="text-xl font-bold text-[#FFD166]">{bookActivity?.totalTips ?? qrCode.total_tips ?? 0}</div>
                  <div className="text-xs text-white/80">Tips</div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  </>
  );
};
