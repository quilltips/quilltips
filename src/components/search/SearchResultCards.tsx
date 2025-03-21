
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Book, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AuthorResult, BookResult } from "./types";

export const AuthorCard = ({ author }: { author: AuthorResult }) => (
  <Link 
    to={`/author/profile/${author.id}`}
    className="block transition-transform hover:scale-102"
  >
    <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
          {author.avatar_url ? (
            <img 
              src={author.avatar_url} 
              alt={author.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-sm">Author</Badge>
          </div>
          <h3 className="text-lg font-semibold">{author.name || 'Anonymous Author'}</h3>
          {author.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {author.bio}
            </p>
          )}
        </div>
      </div>
    </Card>
  </Link>
);

export const BookCard = ({ book }: { book: BookResult }) => (
  <Link 
    to={`/qr/${book.id}`}
    className="block transition-transform hover:scale-102"
  >
    <Card className="p-6 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        {book.cover_image ? (
          <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-md">
            <img 
              src={book.cover_image} 
              alt={book.book_title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-32 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
            <Book className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">Book</Badge>
          </div>
          <h3 className="text-lg font-semibold">{book.book_title}</h3>
          <Link 
            to={`/author/profile/${book.author.id}`}
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            by {book.author.name || 'Anonymous Author'}
          </Link>
          {book.publisher && (
            <p className="text-sm text-muted-foreground">
              Published by {book.publisher}
            </p>
          )}
        </div>
      </div>
    </Card>
  </Link>
);
