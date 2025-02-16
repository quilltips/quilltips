import { AuthorLoginForm } from "@/components/AuthorLoginForm";
import { Layout } from "@/components/Layout";
const AuthorLogin = () => {
  return <Layout>
      <div className="container mx-auto px-4 pt-24 pb-12 py-[57px]">
        <AuthorLoginForm />
      </div>
    </Layout>;
};
export default AuthorLogin;