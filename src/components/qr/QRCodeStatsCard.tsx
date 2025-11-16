import { format } from "date-fns";
import { Card } from "../ui/card";
import { RefObject, useRef, useState } from "react";
import { StyledQRCode } from "./StyledQRCode";
import { QRCodeDownloadOptions } from "./QRCodeDownloadOptions";
import { toPng } from "html-to-image";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useQRCheckout } from "@/hooks/use-qr-checkout";
import { ShoppingCart, Share2, Edit, Save, X } from "lucide-react";
import { generateBrandedQRCodeSVG } from "./generateBrandedQRCodeSVG";
import { OptimizedImage } from "../ui/optimized-image";
import { BookCoverUpload } from "./BookCoverUpload";
import { useQRCodeDetailsPage } from "@/hooks/use-qr-code-details-page";
import { supabase } from "@/integrations/supabase/client";
import { EnhancementsManager } from "../book/EnhancementsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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
    recommendations?: any[];
  } & QRCodeStats;
  qrCodeRef?: RefObject<HTMLDivElement>;
}

export const QRCodeStatsCard = ({ qrCode, qrCodeRef }: QRCodeStatsCardProps) => {
  const { toast } = useToast();
  const isPaid = qrCode.is_paid !== false;
  const { isCheckingOut, handleCheckout } = useQRCheckout({
    qrCodeId: qrCode.id,
    bookTitle: qrCode.book_title
  });
  const { updateCoverImage, imageRefreshKey } = useQRCodeDetailsPage();
  
  const [isEditingBuyNow, setIsEditingBuyNow] = useState(false);
  const [buyNowLinkInput, setBuyNowLinkInput] = useState(qrCode.buy_now_link || "");
  const [isSaving, setIsSaving] = useState(false);

  const downloadRef = useRef<HTMLDivElement>(null);

  // Use slug if available, fallback to old format for backward compatibility
  const bookSlug = qrCode.slug || qrCode.book_title.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
  const qrUrl = bookSlug ? 
    `${window.location.origin}/book/${bookSlug}` : 
    `${window.location.origin}/qr/${qrCode.id}`;

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

      toast({
        title: "Success",
        description: "Buy now link updated successfully",
      });

      setIsEditingBuyNow(false);
      // Update the local qrCode object
      qrCode.buy_now_link = buyNowLinkInput || null;
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

  return (
    <div className="grid xl:grid-cols-[3fr_2fr] gap-7 mx-auto">
      {/* Left side - QR Code, Book Cover, and Book Details */}
      <div className="">
        {/* QR Code, Book Cover, and Book Details Container */}
        <Card className="p-4 md:p-7 border" style={{ borderColor: '#333333' }}>
          <div className="space-y-8">
            {/* QR Code and Book Cover - Responsive Stacking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 ">
              {/* QR Code */}
              <div className="space-y-4">
                <div className="bg-gray rounded-lg flex justify-center">
                  <StyledQRCode
                    ref={qrCodeRef}
                    value={qrUrl}
                    showBranding={true}
                    isPaid={isPaid}
                    variant="screen"
                    size={window.innerWidth < 768 ? 180 : 200}
                  />
                </div>
              </div>

              {/* Book Cover with Upload - Max Width Constraint */}
              <div className="space-y-4">
                <div className="aspect-[2/3] rounded-lg overflow-hidden relative max-w-xs mx-auto md:mx-0">
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
            </div>

            {/* Book Details */}
            <div className="space-y-2 pt-2">
              <div className="space-y-2">
                <p className="text-base font-bold">{qrCode.book_title}</p>
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
                   <p className="text-sm text-muted-foreground">
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
                       "No buy now link set"
                     )}
                   </p>
                 )}
               </div>
             </div>
          </div>
        </Card>

        {/* Enhancements Section */}
        <Card className="p-4 md:p-5">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Book Enhancements</h3>
            <p className="text-sm text-muted-foreground">
              Add extra content to make your book page more engaging for readers
            </p>
            <EnhancementsManager
              qrCodeId={qrCode.id}
              authorId={qrCode.author_id}
              initialData={{
                thank_you_video_url: qrCode.thank_you_video_url,
                thank_you_video_thumbnail: qrCode.thank_you_video_thumbnail,
                video_title: qrCode.video_title,
                video_description: qrCode.video_description,
                book_description: qrCode.book_description,
                character_images: qrCode.character_images,
              }}
              recommendations={qrCode.recommendations}
            />
          </div>
        </Card>
      </div>

      {/* Right side - Stats and Actions */}
      <div className="space-y-6">
        {/* Individual Tip Statistics Tiles */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 md:p-5 bg-[#19363C] text-white">
              <p className="text-xs md:text-sm text-white/80 mb-2">Total Tips</p>
              <p className="text-2xl md:text-3xl font-bold text-[#FFD166]">{qrCode.total_tips || 0}</p>
            </Card>
            <Card className="p-4 md:p-5 bg-[#19363C] text-white">
              <p className="text-xs md:text-sm text-white/80 mb-2">Total Amount</p>
              <p className="text-2xl md:text-3xl font-bold text-[#FFD166]">${qrCode.total_amount?.toFixed(2) || "0.00"}</p>
            </Card>
            <Card className="p-4 md:p-5 bg-[#19363C] text-white">
              <p className="text-xs md:text-sm text-white/80 mb-2">Average Tip</p>
              <p className="text-2xl md:text-3xl font-bold text-[#FFD166]">${qrCode.average_tip?.toFixed(2) || "0.00"}</p>
            </Card>
            <Card className="p-4 md:p-5 bg-[#19363C] text-white">
              <p className="text-xs md:text-sm text-white/80 mb-2">Last Tip</p>
              <p className="text-2xl md:text-3xl font-bold text-[#FFD166]">
                {qrCode.last_tip_date ? format(new Date(qrCode.last_tip_date), "MMM d") : "-"}
              </p>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <Card className="p-4 md:p-5 md:mt-4">
          <div className="space-y-4">
            {/* Hidden download QR code */}
            <div style={{ position: "absolute", left: "-9999px", top: "0" }}>
              <StyledQRCode
                ref={downloadRef}
                value={qrUrl}
                showBranding={true}
                isPaid={isPaid}
                variant="download"
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

            {/* Your Link Section */}
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border">
              <span className="text-sm font-medium text-[#333333] whitespace-nowrap">Your Link:</span>
              <input
                type="text"
                value={qrUrl}
                readOnly
                className="flex-1 text-sm bg-transparent border-none outline-none text-[#333333]"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(qrUrl);
                  toast({
                    title: "Link copied",
                    description: "Your QR code link has been copied to clipboard.",
                  });
                }}
                className="text-[#333333] hover:text-[#19363C] p-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
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
      </div>
    </div>
  );
};