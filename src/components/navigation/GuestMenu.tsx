
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import React from "react";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <a
        ref={ref}
        className={cn(
          "block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        {children && <p className="line-clamp-2 text-xs mt-1 leading-snug text-muted-foreground">{children}</p>}
      </a>
    </li>
  );
});
ListItem.displayName = "ListItem";

export const GuestMenu = () => {
  return (
    <div className="flex items-center gap-2">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent hover:text-[#FFD166]">About</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[180px] gap-1 p-2 md:w-[220px]">
                <Link to="/about" onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}>
                  <ListItem title="About Quilltips" />
                </Link>
                <Link to="/how-it-works" onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}>
                  <ListItem title="How It Works" />
                </Link>
                <Link to="/faq" onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}>
                  <ListItem title="FAQ" />
                </Link>
                <Link to="/pricing" onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}>
                  <ListItem title="Pricing" />
                </Link>
                <Link to="/stripe-help" onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}>
                  <ListItem title="Stripe Help" />
                </Link>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      
      <Link to="/author/login">
        <Button 
          variant="ghost" 
          className="text-sm font-medium hover:bg-accent/50"
        >
          Author Login
        </Button>
      </Link>
    </div>
  );
};
