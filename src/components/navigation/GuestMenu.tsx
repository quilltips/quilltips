import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const GuestMenu = () => {
  return (
    <>
      <Link to="/author/login">
        <Button variant="ghost" className="hover-lift w-full md:w-auto justify-start md:justify-center">
          Log in
        </Button>
      </Link>
      <Link to="/author/register">
        <Button variant="outline" className="hover-lift w-full md:w-auto justify-start md:justify-center">
          Register as Author
        </Button>
      </Link>
    </>
  );
};