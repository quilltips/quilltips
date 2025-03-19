
import { Navigation } from "@/components/Navigation";

export const QRCodeLoading = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary rounded-full border-t-transparent" />
        </div>
      </main>
    </div>
  );
};
