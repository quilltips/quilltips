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
    setSocialLinks,
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

  // Handler for the Cancel button to reset form values
  const handleCancel = () => {
    // Reset form values to initial values
    setName(initialName);
    setBio(initialBio);
    
    // Reset social links to initial state
    // We need to create a deep copy to avoid reference issues
    const initialLinksCopy = JSON.parse(JSON.stringify(initialSocialLinks));
    setSocialLinks(initialLinksCopy);
    
    // This will trigger the useEffect in useProfileForm to set hasChanges to false
  };

  // New handler to enforce the 1,000 char limit for bio
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, 1000);
    setBio(val);
  };

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
          onChange={handleBioChange}
          placeholder="Tell readers about yourself"
          rows={4}
          className={hasChanges ? "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200" : ""}
          maxLength={1000}
        />
        <div className="text-xs text-right text-muted-foreground">
          {bio.length}/1000
        </div>
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
          onClick={handleCancel}
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
