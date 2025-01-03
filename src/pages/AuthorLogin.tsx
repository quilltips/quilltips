import { Navigation } from "@/components/Navigation";
import { AuthorLoginForm } from "@/components/AuthorLoginForm";

const AuthorLogin = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <AuthorLoginForm />
      </main>
    </div>
  );
};

export default AuthorLogin;