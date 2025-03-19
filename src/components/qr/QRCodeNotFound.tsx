
import { Navigation } from "@/components/Navigation";

export const QRCodeNotFound = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Book not found</h1>
          <p className="text-muted-foreground mt-2">The book you're looking for doesn't exist or has been removed.</p>
        </div>
      </main>
    </div>
  );
};
