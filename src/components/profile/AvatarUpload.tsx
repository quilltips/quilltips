
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, Upload, AlertCircle, InfoIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { syncProfileToPublic } from "@/types/public-profile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface AvatarUploadProps {
  profileId: string;
  avatarUrl?: string | null;
  name: string;
}

export const AvatarUpload = ({ profileId, avatarUrl, name }: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Define supported image formats
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous error
    setError(null);

    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError(`Unsupported file type: ${file.type}. Please upload a JPG, PNG, GIF, WebP or SVG image.`);
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, GIF, WebP or SVG image",
        variant: "destructive",
      });
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum size is 5MB.`);
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${profileId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileId);

      if (updateError) throw updateError;
      
      // Sync avatar changes to public profile
      const syncResult = await syncProfileToPublic(profileId);
      if (!syncResult.success) {
        console.warn("Avatar updated but public profile sync failed:", syncResult.error);
      }

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });

      window.location.reload();
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
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarUrl || undefined} alt={name} />
          <AvatarFallback>{name?.charAt(0)?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {avatarUrl ? "Change picture" : "Upload picture"}
            </Button>
            
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-amber-200 hover:bg-amber-300">
                    <InfoIcon className="h-4 w-4 text-amber-700" />
                    <span className="sr-only">File information</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="start" className="max-w-xs bg-white p-2 text-sm">
                  <p>Supported formats: JPG, PNG, GIF, WebP, SVG. Maximum size: 5MB.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {error && (
            <p className="text-xs text-destructive mt-1">
              {error}
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
