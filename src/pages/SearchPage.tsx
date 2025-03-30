
import { Search } from "@/components/Search";
import { Layout } from "@/components/Layout";
import { useSearchParams } from "react-router-dom";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  
  return (
    <Layout>
      <Search />
    </Layout>
  );
};

export default SearchPage;
