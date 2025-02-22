
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";
import { AuthorProfile } from "@/types/author";

interface AuthorProfileHeaderProps {
  author: AuthorProfile;
}

export const AuthorProfileHeader = ({ author }: AuthorProfileHeaderProps) => {
  return (
    <AuthorPublicProfileView
      name={author.name || 'Anonymous Author'}
      bio={author.bio || 'No bio available'}
      imageUrl={author.avatar_url || "/placeholder.svg"}
      authorId={author.id}
      socialLinks={author.social_links || []}
    />
  );
};
