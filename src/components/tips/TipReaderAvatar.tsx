
import { cn } from "@/lib/utils";

interface TipReaderAvatarProps {
  readerName: string | null;
  className?: string;
}

export const TipReaderAvatar = ({ readerName, className }: TipReaderAvatarProps) => {
  const initial = readerName 
    ? readerName.split(' ')[0].charAt(0).toUpperCase()
    : 'A';

  return (
    <div 
      className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full bg-transparent border border-[#333333]",
        className
      )}
    >
      <span className="text-[#333333] text-md font-semibold">
        {initial}
      </span>
    </div>
  );
};
