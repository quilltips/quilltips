import { Navigation } from "@/components/Navigation";
import { AuthorRegistrationForm } from "@/components/AuthorRegistrationForm";

const AuthorRegister = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <AuthorRegistrationForm />
      </main>
    </div>
  );
};

export default AuthorRegister;