
import { useState } from "react";
import { Card } from "./ui/card";
import { AvatarUpload } from "./profile/AvatarUpload";
import { ProfileForm } from "./profile/ProfileForm";
import { BankAccountConnect } from "./profile/BankAccountConnect";

interface SocialLink {
  url: string;
  label: string;
}

interface ProfileSettingsProps {
  profile: {
    id: string;
    name: string;
    bio: string;
    avatar_url?: string | null;
    stripe_account_id?: string | null;
    social_links?: SocialLink[];
  };
}

export const ProfileSettings = ({ profile }: ProfileSettingsProps) => {
  const [hasFormChanges, setHasFormChanges] = useState(false);

  return (
    <Card className={`p-6 transition-all duration-300 ${hasFormChanges ? 'bg-amber-50/50 border-amber-200' : ''}`}>
      <div className="space-y-6">
        <AvatarUpload
          profileId={profile.id}
          avatarUrl={profile.avatar_url}
          name={profile.name}
        />

        <ProfileForm
          profileId={profile.id}
          initialName={profile.name}
          initialBio={profile.bio}
          initialSocialLinks={profile.social_links}
          onChangeStatus={(hasChanges) => setHasFormChanges(hasChanges)}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <BankAccountConnect
            profileId={profile.id}
            stripeAccountId={profile.stripe_account_id}
          />
        </div>
      </div>
    </Card>
  );
};
