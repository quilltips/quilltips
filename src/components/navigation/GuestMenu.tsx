
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
      <Link to="/author/register">
        <Button 
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
        >
          Register as Author
        </Button>
      </Link>
    </div>
  );
};
