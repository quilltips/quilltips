
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

// Create a custom styled navigation menu link
const navigationMenuTriggerStyle = "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent/50 focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50";

const NavigationMenuLinkComponent = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <a
      ref={ref}
      className={cn(
        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      {...props}
    >
      <div className="text-sm font-medium leading-none">{title}</div>
      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
        {children}
      </p>
    </a>
  );
});
NavigationMenuLinkComponent.displayName = "NavigationMenuLink";

export const GuestMenu = () => {
  return (
    <div className="flex items-center gap-2">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent hover:text-[#FFD166]">About</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-[#19363C] p-6 no-underline outline-none focus:shadow-md"
                      to="/about"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium text-white">
                        About Quilltips
                      </div>
                      <p className="text-sm leading-tight text-white/90">
                        Learn about our mission to help authors get paid for their work.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <Link to="/how-it-works" onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}>
                    <NavigationMenuLinkComponent title="How It Works">
                      See how Quilltips connects authors with readers.
                    </NavigationMenuLinkComponent>
                  </Link>
                </li>
                <li>
                  <Link to="/faq" onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}>
                    <NavigationMenuLinkComponent title="FAQ">
                      Get answers to common questions about Quilltips.
                    </NavigationMenuLinkComponent>
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}>
                    <NavigationMenuLinkComponent title="Pricing">
                      View our simple pricing plan for authors.
                    </NavigationMenuLinkComponent>
                  </Link>
                </li>
                <li>
                  <Link to="/stripe-help" onClick={() => document.activeElement instanceof HTMLElement && document.activeElement.blur()}>
                    <NavigationMenuLinkComponent title="Stripe Help">
                      Get help with payment processing through Stripe.
                    </NavigationMenuLinkComponent>
                  </Link>
                </li>
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
