
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, AlertCircle, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface BookCoverUploadProps {
  qrCodeId: string;
  coverImage?: string | null;
  bookTitle: string;
  onImageUpdate: (newImageUrl: string) => void;
}

export const BookCoverUpload = ({ 
  qrCodeId, 
  coverImage, 
  bookTitle,
  onImageUpdate 
}: BookCoverUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
      const fileExt = file.name.split('.').pop();
      const filePath = `${qrCodeId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('book_covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('book_covers')
        .getPublicUrl(filePath);

      const { error: updateQrCodeError } = await supabase
        .from('qr_codes')
        .update({ cover_image: publicUrl })
        .eq('id', qrCodeId);

      if (updateQrCodeError) throw updateQrCodeError;
      
      // Call the callback to update the image in the parent component
      onImageUpdate(publicUrl);

      toast({
        title: "Cover Image Updated",
        description: "Your book cover image has been updated successfully.",
      });
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
