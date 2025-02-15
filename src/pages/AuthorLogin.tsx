
import { AuthorLoginForm } from "@/components/AuthorLoginForm";
import { Layout } from "@/components/Layout";

const AuthorLogin = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <AuthorLoginForm />
      </div>
    </Layout>
  );
};

export default AuthorLogin;
