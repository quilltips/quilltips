
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from "@/lib/utils";

interface AuthorCommentAvatarProps {
  authorName: string | null;
  avatarUrl: string | null;
  className?: string;
}

export const AuthorCommentAvatar = ({ 
  authorName, 
  avatarUrl,
  className 
}: AuthorCommentAvatarProps) => {
  const initial = authorName 
    ? authorName.charAt(0).toUpperCase()
    : 'A';

  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={avatarUrl || undefined} alt={authorName || 'Author'} />
      <AvatarFallback className="bg-[#19363C] text-white">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
};
