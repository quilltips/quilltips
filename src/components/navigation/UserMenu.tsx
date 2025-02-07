
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  isAuthor: boolean;
  userId: string | null;
  onLogout: () => void;
  isLoading: boolean;
}

export const UserMenu = ({ isAuthor, userId, onLogout, isLoading }: UserMenuProps) => {
  return (
    <div className="flex items-center gap-2">
      {isAuthor && (
        <>
          <Link to="/author/dashboard">
            <Button 
              variant="ghost" 
              className="text-sm font-medium hover:bg-accent/10 hidden md:inline-flex"
            >
              Dashboard
            </Button>
          </Link>
          <Link to={`/author/profile/${userId}`}>
            <Button 
              variant="ghost" 
              className="text-sm font-medium hover:bg-accent/10 hidden md:inline-flex"
            >
              Profile
            </Button>
          </Link>
          <Link to="/author/settings">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-accent/10 hidden md:inline-flex"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </>
      )}
      <Button 
        variant="ghost"
        onClick={onLogout}
        disabled={isLoading}
        className="text-sm font-medium hover:bg-accent/10"
      >
        {isLoading ? "Logging out..." : "Log out"}
      </Button>
    </div>
  );
};
