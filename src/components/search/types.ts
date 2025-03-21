
export interface AuthorResult {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  role: string;
}

export interface BookResult {
  id: string;
  book_title: string;
  publisher?: string;
  cover_image?: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export type SearchResults = {
  authors: AuthorResult[];
  books: BookResult[];
};

export type SearchResultItem = 
  | { type: 'author'; data: AuthorResult }
  | { type: 'book'; data: BookResult };
