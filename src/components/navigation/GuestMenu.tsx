
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const GuestMenu = () => {
  return (
    <div className="flex items-center gap-2">
      <Link to="/author/login">
        <Button 
          variant="ghost" 
          className="text-sm font-medium hover:bg-accent/10"
        >
          Log in
        </Button>
      </Link>
    </div>
  );
};
