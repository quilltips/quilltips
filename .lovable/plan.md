

# Revamp Book Recommendations to Platform-Only Bookshelf

## Overview
Transform the current external book recommendations system into an integrated "Bookshelf" feature where authors can only recommend books already on the Quilltips platform. This creates cross-promotion between authors and a more cohesive user experience.

## Current State
- Authors manually type book titles, author names, and external links (e.g., Amazon URLs)
- Recommendations are stored in `author_book_recommendations` with free-text fields
- The public-facing display is a simple bulleted list with external link icons
- The config UI in `EnhancementsManager` has individual text inputs for title, author, and link

## What Changes

### 1. Database Migration
Add a new column to `author_book_recommendations` to store the reference to the recommended QR code (book on the platform):

- Add `recommended_qr_code_id` (uuid, nullable, FK to `qr_codes.id`) to `author_book_recommendations`
- Keep existing columns (`recommended_book_title`, `recommended_book_author`, `buy_link`, `recommended_book_cover_url`) for display caching / backward compatibility, but new entries will auto-populate these from the linked `qr_codes` record

### 2. Author Configuration UI (EnhancementsManager.tsx)
Replace the current free-text recommendation form (lines 651-694) with a search-and-select interface:

- Replace the individual title/author/link inputs with a single search input field
- When the author types, query `qr_codes` table (via `ilike` on `book_title`) joined with `public_profiles` to show matching books with their covers and author names
- Display search results as a dropdown list showing: cover thumbnail, book title, author name
- On selection, save the `recommended_qr_code_id` and auto-fill `recommended_book_title`, `recommended_book_author`, and `recommended_book_cover_url` from the QR code data
- Remove the external link input entirely
- Each selected book appears as a compact card with cover + title + remove button
- Prevent authors from recommending their own books (filter out books where `author_id === current authorId`)
- Rename the section header from "Book Recommendations" to "Bookshelf"

### 3. Public Display (BookRecommendationsCarousel.tsx)
Replace the bulleted list with a visual carousel of book covers:

- Rename header from "{firstName} also recommends these books!" to "{firstName}'s Bookshelf"
- Replace the `<ul>` list with a `<Carousel>` component (reusing the existing Embla carousel from the UI library, same pattern as `AuthorOtherBooksCarousel`)
- Each carousel item shows: book cover image, book title below, author name below title
- Each item links to the book's page on Quilltips (`/book/{slug}`) instead of external URLs
- Remove the `ExternalLink` icon since all links are internal now

### 4. Data Fetching Updates
- **`use-qr-code-fetch.ts`**: Update the recommendations query to also select `recommended_qr_code_id` and join with `qr_codes` to get `slug` and `cover_image` for the linked book
- **`use-qr-code-details-page.ts`**: Same update to the recommendations query
- **`QRCodeDetails.tsx`**: Pass updated data to the new carousel component

### 5. Backward Compatibility
- Existing recommendations without `recommended_qr_code_id` (old external links) will still display but won't have internal links -- they can show as static text entries. Over time authors can replace them with platform books.
- The `buy_link` column remains in the DB but is no longer populated for new entries.

## Files to Create/Modify

| File | Action |
|------|--------|
| **DB Migration** | Add `recommended_qr_code_id` column with FK to `qr_codes` |
| `src/components/book/EnhancementsManager.tsx` | Replace recommendation form (lines 651-694) with search-and-select UI |
| `src/components/book/BookRecommendationsCarousel.tsx` | Rewrite from bullet list to visual carousel with covers and internal links |
| `src/hooks/use-qr-code-fetch.ts` | Update recommendations query to include slug/cover from linked QR code |
| `src/hooks/use-qr-code-details-page.ts` | Same query update |
| `src/pages/QRCodeDetails.tsx` | Minor: pass slug data to carousel, no structural changes needed |

## Technical Details

### Search in EnhancementsManager
A lightweight inline search (not reusing the full `useSearch` hook which includes navigation logic). Instead, a simple debounced query:

```text
qr_codes table
  -> ilike book_title
  -> select id, book_title, cover_image, slug, author_id
  -> join public_profiles for author name
  -> filter out current author's own books
  -> limit 5 results
```

### Carousel Component Pattern
Follow the exact same pattern as `AuthorOtherBooksCarousel`:
- Embla carousel with cover images
- Each item is a `Link` to `/book/{slug}`
- Responsive basis classes for mobile/desktop
- Previous/Next arrows when more than 1 item

### Recommendation Data Flow
```text
Author searches -> selects book -> saves to author_book_recommendations:
  - recommended_qr_code_id = selected qr_code.id
  - recommended_book_title = qr_code.book_title (cached)
  - recommended_book_author = author.name (cached)
  - recommended_book_cover_url = qr_code.cover_image (cached)
  - buy_link = null (no longer used)
```

### Public Display Data Flow
```text
Fetch recommendations -> join qr_codes for fresh slug/cover ->
  Display carousel with covers linking to /book/{slug}
```

