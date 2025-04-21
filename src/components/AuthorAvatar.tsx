
import React from "react";

interface AuthorAvatarProps {
  authorName: string | null;
  avatarUrl: string | null;
  className?: string;
}

export const AuthorAvatar = ({ authorName, avatarUrl, className }: AuthorAvatarProps) => {
  const initial = authorName
    ? authorName.charAt(0).toUpperCase()
    : "A";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={authorName || "Author"}
        className={className}
        // Constrain to circle shape for consistency
        style={{ borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full select-none font-semibold text-lg ${className}`}
      style={{ backgroundColor: "#19363C", color: "#FFD166", userSelect: "none" }}
      aria-label="Default Author Avatar"
      role="img"
    >
      {initial}
    </div>
  );
};

