
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
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
    <form onSubmit={handleSubmit} className={`space-y-6 ${hasChanges ? 'relative' : ''}`}>
      <UnsavedChangesIndicator show={hasChanges} />
      
      <div className="space-y-2">
        <Label className="text-base font-medium">Full name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={hasChanges ? "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-base font-medium">Bio</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell readers about yourself"
          rows={4}
          className={hasChanges ? "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-base font-medium">Links</Label>
        <ProfileSocialLinks
          socialLinks={socialLinks}
          hasChanges={hasChanges}
          addSocialLink={addSocialLink}
          removeSocialLink={removeSocialLink}
          updateSocialLink={updateSocialLink}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center sm:justify-start">
        <Button 
          type="button" 
          variant="outline"
          className="px-8 py-2 h-auto rounded-full"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !hasChanges}
          className={`px-8 py-2 h-auto rounded-full bg-secondary text-primary hover:bg-secondary-light font-medium`}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
};
