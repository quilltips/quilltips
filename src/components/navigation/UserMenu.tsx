import { Link } from "react-router-dom";
import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  isAuthor: boolean;
  userId: string | null;
  onLogout: () => void;
  isLoading: boolean;
}

export const UserMenu = ({ isAuthor, userId, onLogout, isLoading }: UserMenuProps) => {
  return (
    <>
      {isAuthor && (
        <>
          <Link to="/author/dashboard" className="hover-lift hidden md:block">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link to={`/author/profile/${userId}`} className="hover-lift hidden md:block">
            <Button variant="ghost">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </Link>
          <Link to="/author/settings" className="hover-lift hidden md:block">
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </>
      )}
      <Button 
        variant="ghost" 
        onClick={onLogout}
        disabled={isLoading}
        className="hover-lift"
      >
        {isLoading ? "Logging out..." : "Log out"}
      </Button>
    </>
  );
};