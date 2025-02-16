import { Layout } from "@/components/Layout";
import { AuthorRegistrationForm } from "@/components/AuthorRegistrationForm";
const AuthorRegister = () => {
  return <Layout>
      <main className="container mx-auto px-4 pt-24 pb-12 py-[75px]">
        <AuthorRegistrationForm />
      </main>
    </Layout>;
};
export default AuthorRegister;