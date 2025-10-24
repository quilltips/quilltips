
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, AlertCircle, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { qrCodeQueryKeys } from "@/hooks/use-qr-code-details-page";
import { useImageProcessor } from "@/hooks/use-image-processor";

interface BookCoverUploadProps {
  qrCodeId?: string;
  bookTitle: string;
  coverImage?: string | null;
  updateCoverImage?: (imageUrl: string) => Promise<any>;
  onUploadSuccess?: (imageUrl: string) => void;
  placement?: 'overlay' | 'below';
}

export const BookCoverUpload = ({
  qrCodeId,
  bookTitle,
  coverImage,
  updateCoverImage,
  onUploadSuccess,
  placement = 'overlay'
}: BookCoverUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { processImage, isProcessing } = useImageProcessor();

  const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const BUCKET_NAME = 'covers';

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError(`Unsupported file type: ${file.type}`);
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, WebP or SVG image",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size too large`);
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const processedImage = await processImage(file, {
        type: 'cover',
        maxWidth: 800,
        maxHeight: 1200
      });

      if (!processedImage) throw new Error('Failed to process image');

      const response = await fetch(processedImage);
      const processedFile = await response.blob();
      const optimizedFile = new File([processedFile], file.name, { type: 'image/jpeg' });

      const filePath = `${(qrCodeId || 'temp')}-${Date.now()}.jpg`;

      const { error: uploadError, data } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, optimizedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      if (qrCodeId && !onUploadSuccess) {
        // Existing QR flow: update Supabase directly
        if (updateCoverImage) {
          await updateCoverImage(publicUrl);
        } else {
          const { error: updateError } = await supabase
            .from('qr_codes')
            .update({ cover_image: publicUrl })
            .eq('id', qrCodeId);
          if (updateError) throw updateError;

          queryClient.invalidateQueries({ queryKey: qrCodeQueryKeys.all });
        }
      } else if (onUploadSuccess) {
        // Creation flow: send image URL back to parent
        onUploadSuccess(publicUrl);
      }

      toast({
        title: "Success",
        description: "Book cover image has been uploaded.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error.message || "Failed to upload image");
      toast({
        title: "Upload Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={placement === 'overlay' ? 'relative' : 'relative flex justify-center'}>
      <Input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleCoverImageUpload}
        className="hidden"
        id="cover-upload"
      />
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
              <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => document.getElementById('cover-upload')?.click()}
              disabled={isUploading || isProcessing}
              className={placement === 'overlay' ? 'absolute bottom-2 left-1/2 -translate-x-1/2 z-10' : 'static mt-3'}
            >
              {isUploading || isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="h-3.5 w-3.5 mr-1" />
                  <span>Upload cover</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Upload book cover</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
