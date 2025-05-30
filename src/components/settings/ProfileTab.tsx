
import { AvatarUpload } from "../profile/AvatarUpload";
import { ProfileForm } from "../profile/ProfileForm";

interface SocialLink {
  url: string;
  label: string;
}

interface ProfileTabProps {
  profile: {
    id: string;
    name?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    social_links?: SocialLink[] | null;
  };
  onChangeStatus?: (hasChanges: boolean) => void;
}

export const ProfileTab = ({ profile, onChangeStatus }: ProfileTabProps) => {
  return (
    <div className="space-y-8">
      <AvatarUpload
        profileId={profile.id}
        avatarUrl={profile.avatar_url ?? null}
        name={profile.name ?? ""}
      />

      <ProfileForm
        profileId={profile.id}
        initialName={profile.name ?? ""}
        initialBio={profile.bio ?? ""}
        initialSocialLinks={profile.social_links ?? []}
        onChangeStatus={onChangeStatus}
      />
    </div>
  );
};
