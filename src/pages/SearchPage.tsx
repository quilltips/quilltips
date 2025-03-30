
import { Search } from "@/components/Search";
import { Layout } from "@/components/Layout";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    // Update the document title with the search query
    document.title = query ? `Search: ${query} | Quilltips` : "Search | Quilltips";
  }, [query]);

  return (
    <Layout>
      <Search />
    </Layout>
  );
};

export default SearchPage;
