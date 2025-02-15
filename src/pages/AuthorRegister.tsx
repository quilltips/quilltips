
import { Layout } from "@/components/Layout";
import { AuthorRegistrationForm } from "@/components/AuthorRegistrationForm";

const AuthorRegister = () => {
  return (
    <Layout>
      <main className="container mx-auto px-4 pt-24 pb-12">
        <AuthorRegistrationForm />
      </main>
    </Layout>
  );
};

export default AuthorRegister;
