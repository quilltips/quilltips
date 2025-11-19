
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const cleanup = useCallback(() => {
    // Force any open sheets or modals to close
    const sheets = document.querySelectorAll('[data-state="open"]');
    sheets.forEach((sheet) => {
      const closeButton = sheet.querySelector('button[aria-label="Close"]');
      if (closeButton) {
        (closeButton as HTMLButtonElement).click();
      }
    });
    
    // Clean up any lingering event listeners
    const interactiveElements = document.querySelectorAll('button, a, input');
    interactiveElements.forEach((element) => {
      element.removeAttribute('style');
      element.removeAttribute('disabled');
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    cleanup();
    
    // Add this cleanup on unmount as well
    return () => cleanup();
  }, [location.pathname, cleanup]);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden w-full">
      <Navigation />
      <main className="flex-grow pt-20 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};
