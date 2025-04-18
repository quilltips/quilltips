import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, AlertCircle, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useImageProcessor } from "@/hooks/use-image-processor";
import { AvatarCropModal } from "./AvatarCropModal";

interface AvatarUploadProps {
  profileId: string;
  avatarUrl?: string | null;
  name: string;
}

export const AvatarUpload = ({ profileId, avatarUrl, name }: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(avatarUrl);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const { toast } = useToast();
  const { processImage, isProcessing } = useImageProcessor();

  const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File): boolean => {
    setError(null);

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError(`Unsupported file type: ${file.type}. Please upload a JPG, PNG, GIF, WebP or SVG image.`);
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, WebP or SVG image",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum size is 5MB.`);
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      e.target.value = '';
      return;
    }

    // Create URL for the crop modal
    const imageUrl = URL.createObjectURL(file);
    setCropImageUrl(imageUrl);
    setShowCropModal(true);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const processedImage = await processImage(croppedFile, {
        type: 'avatar',
        maxWidth: 400,
        maxHeight: 400
      });

      if (!processedImage) {
        throw new Error('Failed to process image');
      }

      const response = await fetch(processedImage);
      const processedFile = await response.blob();
      const optimizedFile = new File([processedFile], croppedFile.name, { type: 'image/jpeg' });

      const fileExt = 'jpg';
      const filePath = `${profileId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, optimizedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileId);

      if (updateProfileError) throw updateProfileError;
      
      const { error: updatePublicProfileError } = await supabase
        .from('public_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileId);

      if (updatePublicProfileError) {
        console.warn("Failed to update public profile avatar:", updatePublicProfileError);
      }

      setCurrentAvatarUrl(publicUrl);

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      setError(error.message || "Failed to upload profile picture");
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (cropImageUrl) {
        URL.revokeObjectURL(cropImageUrl);
        setCropImageUrl(null);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;
    
    setIsUploading(true);
    
    try {
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profileId);

      if (updateProfileError) throw updateProfileError;
      
      const { error: updatePublicProfileError } = await supabase
        .from('public_profiles')
        .update({ avatar_url: null })
        .eq('id', profileId);

      if (updatePublicProfileError) {
        console.warn("Failed to update public profile avatar:", updatePublicProfileError);
      }

      setCurrentAvatarUrl(null);

      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed successfully.",
      });
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24 border-2 border-gray-200">
          <AvatarImage src={currentAvatarUrl || undefined} alt={name} className="object-cover" />
          <AvatarFallback>{name?.charAt(0)?.toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="absolute -bottom-1 -right-1">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
            id="avatar-upload"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={isUploading || isProcessing}
                  className="rounded-full h-8 w-8"
                >
                  {isUploading || isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Edit className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Change profile picture</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="text-center text-lg font-medium">
        {name}
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {cropImageUrl && (
        <AvatarCropModal
          imageUrl={cropImageUrl}
          isOpen={showCropModal}
          onClose={() => {
            setShowCropModal(false);
            URL.revokeObjectURL(cropImageUrl);
            setCropImageUrl(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};
