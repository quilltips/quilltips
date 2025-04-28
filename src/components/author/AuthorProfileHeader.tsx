
import { AuthorPublicProfileView } from "@/components/AuthorPublicProfile";
import { AuthorProfile } from "@/types/author";

interface AuthorProfileHeaderProps {
  author: AuthorProfile;
}

export const AuthorProfileHeader = ({ author }: AuthorProfileHeaderProps) => {
  // Extract year from created_at if available, safely handling the optional property
  const joinedYear = author.created_at && author.created_at.trim() !== '' 
    ? new Date(author.created_at).getFullYear().toString() 
    : undefined;
  
  return (
    <AuthorPublicProfileView
      name={author.name || 'Anonymous Author'}
      bio={author.bio || 'No bio available'}
      imageUrl={author.avatar_url || undefined }
      authorId={author.id}
      socialLinks={author.social_links || []}
      joinedDate={joinedYear}
    />
  );
};
