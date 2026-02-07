import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, X, HelpCircle } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CharacterImageUploadProps {
  onUploadSuccess: (url: string) => void;
  currentImageUrl?: string;
  onRemove?: () => void;
  /** When true, allows selecting multiple files; onUploadSuccess is called for each. No thumbnail/remove shown. */
  multiple?: boolean;
}

const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const maxFileSize = 10 * 1024 * 1024; // 10MB

async function uploadFile(file: File, supabase: any): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage
    .from('character-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('character-images').getPublicUrl(fileName);
  return publicUrl;
}

export const CharacterImageUpload = ({ 
  onUploadSuccess, 
  currentImageUrl, 
  onRemove,
  multiple = false,
}: CharacterImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = multiple ? Array.from(files) : [files[0]];

    for (const file of fileList) {
      if (!validImageTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload image files (JPEG, PNG, WebP, or GIF)",
          variant: "destructive",
        });
        continue;
      }
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB`,
          variant: "destructive",
        });
        continue;
      }
    }

    setIsUploading(true);
    let successCount = 0;
    try {
      for (const file of fileList) {
        if (!validImageTypes.includes(file.type) || file.size > maxFileSize) continue;
        const publicUrl = await uploadFile(file, supabase);
        onUploadSuccess(publicUrl);
        successCount++;
      }
      if (successCount > 0) {
        toast({
          title: "Success",
          description: successCount === 1 ? "Image uploaded successfully" : `${successCount} images uploaded`,
        });
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const uploadId = `character-image-upload-${Math.random().toString(36).substring(2)}`;

  return (
    <div className="space-y-2">
      {!multiple && currentImageUrl && (
        <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
          <OptimizedImage
            src={currentImageUrl}
            alt="Character"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex gap-2 items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById(uploadId)?.click()}
          className="relative"
          style={{ borderColor: '#333333', color: '#333333' }}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {multiple ? 'Upload' : (currentImageUrl ? 'Change Image' : 'Upload Image')}
            </>
          )}
        </Button>
        
        {!multiple && currentImageUrl && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            style={{ color: '#333333' }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 cursor-help" style={{ color: '#333333' }} />
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px]">
              <p>Supported formats: JPEG, PNG, WebP, GIF (max 10MB)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Input
        id={uploadId}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileUpload}
        className="hidden"
        multiple={multiple}
      />
    </div>
  );
};
