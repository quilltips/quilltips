import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, AlertCircle, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { qrCodeQueryKeys } from "@/hooks/use-qr-code-details-page";

interface BookCoverUploadProps {
  qrCodeId: string;
  coverImage?: string | null;
  bookTitle: string;
  onUpdateImage?: (newImageUrl: string) => void;
  updateCoverImage?: (imageUrl: string) => Promise<any>;
}

export const BookCoverUpload = ({
  qrCodeId,
  coverImage,
  bookTitle,
  onUpdateImage,
  updateCoverImage
}: BookCoverUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const BUCKET_NAME = 'covers';

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError(`Unsupported file type: ${file.type}. Please upload a JPG, PNG, GIF, WebP or SVG image.`);
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, WebP or SVG image",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum size is 5MB.`);
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      console.log("Starting upload to bucket:", BUCKET_NAME);
      const fileExt = file.name.split('.').pop();
      const filePath = `${qrCodeId}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", data);

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log("Generated public URL:", publicUrl);

      if (updateCoverImage) {
        console.log("Using mutation to update cover image");
        await updateCoverImage(publicUrl);
      } 
      else if (onUpdateImage) {
        console.log("Using direct Supabase update");
        const { error: updateError } = await supabase
          .from('qr_codes')
          .update({ cover_image: publicUrl })
          .eq('id', qrCodeId);

        if (updateError) {
          console.error("Database update error:", updateError);
          throw updateError;
        }
        
        queryClient.invalidateQueries({ queryKey: qrCodeQueryKeys.all });
        
        onUpdateImage(publicUrl);
        
        toast({
          title: "Success",
          description: "Book cover image has been updated successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error uploading cover image:", error);
      setError(error.message || "Failed to upload cover image");
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload cover image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="relative">
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
              disabled={isUploading}
              className="absolute bottom-2 right-2 z-10"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  <span>Edit</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Change book cover image</p>
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
