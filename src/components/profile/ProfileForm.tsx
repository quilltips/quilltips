
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Loader2, Save } from "lucide-react";
import { useProfileForm, SocialLink } from "@/hooks/use-profile-form";
import { ProfileSocialLinks } from "./ProfileSocialLinks";
import { UnsavedChangesIndicator } from "./UnsavedChangesIndicator";

interface ProfileFormProps {
  profileId: string;
  initialName: string;
  initialBio: string;
  initialSocialLinks?: SocialLink[];
  onChangeStatus?: (hasChanges: boolean) => void;
}

export const ProfileForm = ({ 
  profileId, 
  initialName, 
  initialBio,
  initialSocialLinks = [],
  onChangeStatus
}: ProfileFormProps) => {
  const {
    name,
    setName,
    bio,
    setBio,
    socialLinks,
    isLoading,
    hasChanges,
    addSocialLink,
    removeSocialLink,
    updateSocialLink,
    handleSubmit
  } = useProfileForm({
    profileId,
    initialName,
    initialBio,
    initialSocialLinks,
    onChangeStatus
  });

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${hasChanges ? 'relative' : ''}`}>
      <UnsavedChangesIndicator show={hasChanges} />
      
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={hasChanges ? "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label>Bio</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell readers about yourself"
          rows={4}
          className={hasChanges ? "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200" : ""}
        />
      </div>

      <ProfileSocialLinks
        socialLinks={socialLinks}
        hasChanges={hasChanges}
        addSocialLink={addSocialLink}
        removeSocialLink={removeSocialLink}
        updateSocialLink={updateSocialLink}
      />

      <Button 
        type="submit" 
        disabled={isLoading || !hasChanges}
        className={`${hasChanges ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : hasChanges ? (
          <Save className="mr-2 h-4 w-4" />
        ) : null}
        {hasChanges ? 'Save Changes' : 'Save Changes'}
      </Button>
    </form>
  );
};
