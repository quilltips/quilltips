
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearch } from "@/hooks/use-search"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Book, User } from "lucide-react"
import { Link } from "react-router-dom"
import { Input } from "@/components/ui/input"

export const MobileSearchSheet = () => {
  const {
    query,
    results,
    isLoading,
    handleSearch,
    handleKeyDown,
    navigateToSearchPage,
  } = useSearch('', 'quick');

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="h-[80vh] w-full p-0">
        <div className="p-4 space-y-4">
          <Input
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            placeholder="Search books or authors..."
            className="w-full"
            autoFocus
          />
          
          <ScrollArea className="h-[calc(80vh-8rem)]">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Searching...</div>
            ) : (
              <div className="space-y-2">
                {results?.authors?.filter(author => author && author.id).map((author) => (
                  <Link
                    key={author.id}
                    to={`/profile/${author.id}`}
                    className="block p-4 hover:bg-accent rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3" />
                      <Badge variant="secondary" className="text-xs py-0 px-1.5">Author</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
                        {author.name ? author.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <p className="font-medium">{author.name || "Anonymous Author"}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                          {author.bio ? (author.bio.length > 60 ? author.bio.substring(0, 60) + '...' : author.bio) : "No bio available"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {results?.books?.filter(book => book && book.id && book.author).map((book) => (
                  <Link
                    key={book.id}
                    to={`/qr/${book.id}`}
                    className="block p-4 hover:bg-accent rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Book className="h-3 w-3" />
                      <Badge variant="default" className="text-xs py-0 px-1.5 bg-[#19363C] text-white">Book</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/lovable-uploads/quill_icon.png" 
                          alt="Book cover" 
                          className="h-6 w-6 object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{book.book_title}</p>
                        <p className="text-sm text-muted-foreground">
                          By <Link 
                              to={`/profile/${book.author?.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline"
                            >
                              {book.author?.name || "Anonymous Author"}
                            </Link>
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {query.trim() && !isLoading && !results?.authors?.length && !results?.books?.length && (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found for "{query}"
                  </div>
                )}
                
                {!query.trim() && (
                  <div className="p-4 text-center text-muted-foreground">
                    Type to search...
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          
          {query.trim() && (
            <Button 
              onClick={navigateToSearchPage}
              className="w-full"
              variant="secondary"
            >
              <Search className="h-4 w-4 mr-2" />
              View all results for "{query}"
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
